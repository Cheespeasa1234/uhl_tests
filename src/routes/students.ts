import express, { Request, Response, NextFunction } from "npm:express";
// @deno-types="npm:@types/body-parser"
import bodyParser from "npm:body-parser";
// @deno-types="npm:@types/cookie-parser"
import cookieParser from "npm:cookie-parser";
import crypto from "node:crypto";

import { Quiz, Student } from "../lang/quiz/quiz.ts";
import { makeTest } from "../lang/quiz/codegen.ts";
import { PresetManager } from "../lib/config.ts";
// import { addResponse } from "../analyze_responses.ts";
import { addNotification } from "../lib/notifications.ts";
import { logInfo } from "../lib/logger.ts";
import { DB_TestGroup, DB_Response, DB_Response_Data_Settings } from "../lib/db.ts";

export const router = express.Router();

// Parse request body & cookies
router.use(bodyParser.json());
router.use(bodyParser.urlencoded());
router.use(cookieParser());

// Identify and track users by an ID
router.use((req: Request, res: Response, next: NextFunction) => {
    // Add an identifier cookie
    const idCookie = req.cookies["HCS_ID"];
    if (idCookie) {
        next();
    } else {
        const id = crypto.randomBytes(32).toString("hex");
        res.cookie("HCS_ID", id, { maxAge: 1000 * 60 * 60, secure: true, path: "/" });
        addNotification({ message: "Started tracking new user", success: true });
        next();
    }
});

type Session = {
    student: Student,
    quiz: Quiz,
    timeStarted: Date,
    timeToEnd: Date | null,
};

const activeSessions: {[id:string]: (Session | undefined)} = {};
export function getActiveSessions(): typeof activeSessions {
    logInfo("testing/sessions", "Fetching active sessions");
    return activeSessions;
}

export const presetManager: PresetManager = new PresetManager();
export const manualConfigs: Map<string, boolean | number> = new Map();
manualConfigs.set("enableStudentTesting", false);
manualConfigs.set("enableTimeLimit", true);
manualConfigs.set("timeLimit", 40);
manualConfigs.set("debugMode", false);

/**
 * IN: { name: string }
 * OUT: { success: boolean, message: string, questions: QuizQuestion[], student: Student}
 * 
 * Request a new test.
 */
router.post("/new-test", (req: Request, res: Response) => {
    
    if (!manualConfigs.get("enableStudentTesting")) {
        res.json({
            success: false,
            message: "Testing disabled."
        });
        addNotification({ message: `Student tried to start a test, but it was disabled`, success: true });
        return;
    }

    const name = req.body['name'];
    if (!name) {
        res.json({
            success: false,
            message: "No name provided"
        });
        return;
    }

    const testCode = req.body['code'];
    if (!testCode) {
        res.json({
            success: false,
            message: "No testid provided"
        });
        return;
    }

    const testGroup = DB_TestGroup.selectByCode(testCode);
    if (!testGroup) {
        res.json({
            success: false,
            message: "Invalid test code"
        });
        return;
    }

    const timeStarted = new Date();
    let timeToEnd: Date | null = null;
    if (manualConfigs.get("enableTimeLimit")) {
        const timeLimitMillis = (manualConfigs.get("timeLimit") as number) * 60 * 1000;
        const newTime = timeStarted.getTime() + timeLimitMillis;
        timeToEnd = new Date(newTime);
    }
    const quiz: Quiz = makeTest(
        timeStarted,
        timeToEnd,
        testGroup
    );
    const student = new Student(name);
    
    const session: Session = { student, quiz, timeStarted, timeToEnd };
    activeSessions[student.name] = session;

    res.json({
        success: true,
        message: "Successfully created test",
        data: {
            questions: quiz.getCensoredQuestions(),
            student,
            timeStarted,
            timeToEnd
        }
    });

    addNotification({ message: `Created a new test for ${student.name}`, success: true });
});

router.post("/submit-test", (req: Request, res: Response) => {
    
    // Check that all the form data exists
    const { studentSelf, answers } = req.body;
    if (!studentSelf) {
        res.json({ success: false, message: `No studentSelf provided.` });
        return;
    }
    if (!answers) {
        res.json({ success: false, message: "No answers provided" });
        return;
    }
    const { name, privateKey }: { name: string, privateKey: string } = studentSelf;
    if (!name) {
        res.json({ success: false, message: "No studentSelf.name provided" });
        return;
    }
    if (!privateKey) {
        res.json({ success: false, message: "No studentSelf.privateKey provided" });
        return;
    }

    // make sure they are who they say they are
    const session = activeSessions[name];
    if (!session) {
        res.json({ success: false, message: `Session for ${name} not found` });
        return;
    }
    if (privateKey !== session.student.privateKey) {
        res.json({ success: false, message: `privateKey ${privateKey} does not match the session` });
        return;
    }

    // make sure they sent the right amount of answers
    if (answers.length !== session.quiz.questions.length) {
        res.json({ success: false, message: `not enough answers sent. recieved ${answers} but requires ${session.quiz.questions.length} many` });
        return;
    }

    // remove them from the sessions
    activeSessions[name] = undefined;

    const answerCode = crypto.randomBytes(8).toString("hex");
    res.json({ success: true, message: "Test submitted.", answerCode});

    const responseBlob = {
        answers: answers,
        quiz: session.quiz,
    };

    console.log(responseBlob);
    console.log(JSON.stringify(responseBlob));
    console.log(sanitizeForCSV(JSON.stringify(responseBlob)));

    function sanitizeForCSV(text: string) {
        return text.replaceAll(",", "~c").replaceAll("\"", "~q").replaceAll("\n", "");
    }

    // Log the answers to the user's identity
    const epochTime = Date.now();
    const due = (responseBlob.quiz.timeToEnd || new Date()).getTime();
    
    const data: DB_Response_Data_Settings = {
        email: name,
        time: epochTime,
        due: due,
        idCookie: session.student.privateKey,
        answerCode,
        responseBlob: JSON.stringify(responseBlob),
        testId: responseBlob.quiz.testGroup.getId(),
    }

    DB_Response.create(data);

    addNotification({ message: `Test just submitted by ${name}`, success: true });
});