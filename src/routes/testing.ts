const DEBUG = false;

import express, { Request, Response, NextFunction } from "npm:express";
// @deno-types="npm:@types/body-parser"
import bodyParser from "npm:body-parser";
// @deno-types="npm:@types/cookie-parser"
import cookieParser from "npm:cookie-parser";
import crypto from "node:crypto";

import { Quiz, Student } from "../lang/quiz/quiz.ts";
import { makeTest } from "../lang/quiz/codegen.ts";
import { ConfigKey, PresetManager } from "../config.ts";

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
        res.cookie("HCS_ID", id, { maxAge: 1000 * 60 * 60, secure: true, domain: "natelevison.com" });
        next();
    }
});

type Session = {
    student: Student,
    quiz: Quiz,
};

const activeSessions: {[id:string]: (Session | undefined)} = {};
export function getActiveSessions(): typeof activeSessions {
    return activeSessions;
}

export const presetManager: PresetManager = new PresetManager();

/**
 * IN: { name: string }
 * OUT: { success: boolean, message: string, questions: QuizQuestion[], student: Student}
 * 
 * Request a new test.
 */
router.post("/new-test", (req: Request, res: Response) => {
    
    const name = req.body['name'];
    if (!name) {
        res.json({
            success: false,
            message: "No name provided"
        });
        return;
    }

    const quiz: Quiz = makeTest(
        presetManager.getConfig(ConfigKey.FOR_LOOP_COUNT).getNumberValue(),
        presetManager.getConfig(ConfigKey.NESTED_FOR_LOOP_COUNT).getNumberValue(),
        presetManager.getConfig(ConfigKey.STRING_COUNT).getNumberValue(),
    );
    const student = new Student(name);
    
    const session: Session = { student, quiz };
    activeSessions[student.name] = session;

    res.json({
        success: true,
        message: "",
        questions: quiz.getCensoredQuestions(),
        student,
    });
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
    const { name, privateKey } = studentSelf;
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
    Deno.writeTextFileSync("responses.csv", `\n${sanitizeForCSV(name)},${Date.now()},${sanitizeForCSV(req.cookies["HCS_ID"])},${answerCode},${sanitizeForCSV(JSON.stringify(responseBlob))}`, { append: true });

});

if (DEBUG) {
    router.get("/uhl_see_csv", (_req: Request, res: Response) => {
        res.send("<h3>All tildes (~) are actually commas. They are just replaced to stop CSV injection.</h3><pre>" + Deno.readTextFileSync("responses.csv").toString() + "</pre>");
    });
    
    router.get("/uhl_see_sessions", (_req: Request, res: Response) => {
        res.json(activeSessions);
    });
}