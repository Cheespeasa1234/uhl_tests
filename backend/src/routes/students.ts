import express, { Request, Response, NextFunction } from "npm:express";
// @deno-types="npm:@types/body-parser"
import bodyParser from "npm:body-parser";
// @deno-types="npm:@types/cookie-parser"
import cookieParser from "npm:cookie-parser";
import crypto from "node:crypto";

import { Quiz, Student } from "../lang/quiz/quiz.ts";
import { makeTest } from "../lang/quiz/codegen.ts";
import { PresetManager } from "../lib/config.ts";
import { addNotification } from "../lib/notifications.ts";
import { logInfo, logWarning } from "../lib/logger.ts";
import { HTTP } from "../lib/http.ts";
import { HCST_FORM_URL, HCST_OAUTH_CLIENT_ID, HCST_OAUTH_CLIENT_SECRET, HCST_OAUTH_REDIRECT_URI } from "../lib/env.ts";
import { Test, Submission, Preset, parsePresetData, PresetData, ConfigValueType } from "../lib/db.ts";

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
manualConfigs.set("enableStudentTesting", true); // TODO
manualConfigs.set("enableTimeLimit", true);
manualConfigs.set("timeLimit", 40);
manualConfigs.set("debugMode", false);

router.post("/test-info", async (req: Request, res: Response) => {
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
            message: "No code provided"
        });
        return;
    }

    const testGroup = await Test.findOne({
        where: {
            code: testCode
        }
    })

    if (!testGroup) {
        res.json({
            success: false,
            message: "Invalid test code"
        });
        return;
    }

    if (!testGroup.enabled) {
        logWarning(`students/test-info`, `Student used disabled test code: ${testGroup.code}. Consider changing the code to keep it secret.`);
        res.json({
            success: false,
            message: "Invalid test code"
        });
        return;
    }

    const timeLimitMinutes = (manualConfigs.get("timeLimit") as number);
    const preset: Preset | null = await Preset.findByPk(testGroup.presetId);
    if (!preset) {
        res
            .status(HTTP.SERVER_ERROR.INTERNAL_SERVER_ERROR)
            .json({
                success: false,
                message: "Preset not found"
            });
        return;
    };
    const blob: PresetData = parsePresetData(preset.blob);
    let sum = 0
    blob.forEach(config => {
        if (config.valueType === ConfigValueType.NUMBER) {
            sum += config.getNumberValue();
        }
    })

    const enableTimeLimit = manualConfigs.get("enableTimeLimit");

    res.json({
        success: true,
        message: "Successfully retrieved test info",
        data: {
            timeLimit: timeLimitMinutes,
            enableTimeLimit: enableTimeLimit,
            count: sum,
        }
    });
});

/**
 * IN: { name: string }
 * OUT: { success: boolean, message: string, questions: QuizQuestion[], student: Student}
 * 
 * Request a new test.
 */
router.post("/new-test", async (req: Request, res: Response) => {
    
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

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name);
    if (!isValidEmail) {
        res
            .status(HTTP.CLIENT_ERROR.BAD_REQUEST)
            .json({
                success: false,
                message: "Invalid email"
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

    const testGroup = await Test.findOne({
        where: {
            code: testCode
        }
    })

    if (!testGroup) {
        res.json({
            success: false,
            message: "Invalid test code"
        });
        return;
    }

    if (!testGroup.enabled) {
        logWarning(`students/new-test`, `Student used disabled test code: ${testGroup.code}. Consider changing the code to keep it secret.`);
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
    const quiz: Quiz = await makeTest(
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
    res.json({ success: true, message: "Test submitted.", data: {
        formUrl: HCST_FORM_URL,
        answerCode: answerCode,
    }});

    const responseBlob = {
        answers: answers,
        quiz: session.quiz,
    };

    // console.log(responseBlob);
    // console.log(JSON.stringify(responseBlob));
    // console.log(sanitizeForCSV(JSON.stringify(responseBlob)));

    function sanitizeForCSV(text: string) {
        return text.replaceAll(",", "~c").replaceAll("\"", "~q").replaceAll("\n", "");
    }

    // Log the answers to the user's identity
    const timeStart = responseBlob.quiz.timeStarted;
    const timeSubmitted = new Date();
    const due = (responseBlob.quiz.timeToEnd || new Date());
    
    const data = {
        email: name,
        idCookie: session.student.privateKey,
        answerCode,
        responseBlob: JSON.stringify(responseBlob),
        testId: responseBlob.quiz.testGroup.id,
        timeStart: timeStart.toISOString(),
        timeSubmitted: timeSubmitted.toISOString(),
        timeDue: due.toISOString(),
    }

    Submission.create(data);

    addNotification({ message: `Test just submitted by ${name}`, success: true });
});

router.post("/oauth-token", async (req: Request, res: Response) => {
    const code = req.body["code"];
    if (code === undefined) {
        res.status(HTTP.CLIENT_ERROR.BAD_REQUEST).json({
            success: false,
            message: "No code provided",
        })
    }

    const url = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: HCST_OAUTH_CLIENT_ID,
        client_secret: HCST_OAUTH_CLIENT_SECRET,
        redirect_uri: HCST_OAUTH_REDIRECT_URI,
    }).toString();

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Error fetching access token:', errorResponse);
        throw new Error(`Error: ${errorResponse.error} - ${errorResponse.error_description}`);
    }

    const r = await response.json();
    console.log(r);
    const access_token = r.access_token; // used to access the Google API
    const refresh_token = r.refresh_token; // used to refresh the access token
    const expires_in = r.expires_in; // used to know when to refresh the access token

    const emailResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`,
        },
    });
    
    if (!emailResponse.ok) {
        const errorResponse = await emailResponse.json();
        console.error('Error fetching user info:', errorResponse);
        throw new Error(`Error: ${errorResponse.error} - ${errorResponse.error_description}`);
    }
    
    const userInfo = await emailResponse.json();
    console.log(userInfo);
});