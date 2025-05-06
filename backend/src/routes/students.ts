import express, { Request, Response, NextFunction } from "npm:express";
// @deno-types="npm:@types/body-parser"
import bodyParser from "npm:body-parser";
// @deno-types="npm:@types/cookie-parser"
import cookieParser from "npm:cookie-parser";
import crypto from "node:crypto";

import { Quiz } from "../lang/quiz/quiz.ts";
import { makeTest } from "../lang/quiz/codegen.ts";
import { PresetManager } from "../lib/config.ts";
import { addNotification } from "../lib/notifications.ts";
import { logInfo, logWarning } from "../lib/logger.ts";
import { HTTP } from "../lib/http.ts";
import { HCST_FORM_URL, HCST_OAUTH_CLIENT_ID, HCST_OAUTH_CLIENT_SECRET, HCST_OAUTH_REDIRECT_URI } from "../lib/env.ts";
import { Test, Submission, Preset, parsePresetData, PresetData, ConfigValueType } from "../lib/db.ts";
import { addSession, getSessionBySid, removeSession, Session } from "./sessions.ts";

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

    const sidCookie = req.cookies["HCST_SID"];
    if (sidCookie === undefined) {
        res.status(HTTP.CLIENT_ERROR.UNAUTHORIZED).json({
            success: false,
            message: "No HCST_SID cookie provided",
        });
    }
    
    const sess: Session | undefined = getSessionBySid(sidCookie);
    if (sess === undefined) {
        res.status(HTTP.CLIENT_ERROR.UNAUTHORIZED).json({
            success: false,
            message: "Invalid HCST_SID",
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
    let timeToEnd: Date | undefined = undefined;
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

    sess.data = {
        quiz: quiz,
        timeStarted: timeStarted,
        timeToEnd: timeToEnd
    }

    res.json({
        success: true,
        message: "Successfully created test",
        data: {
            questions: quiz.getCensoredQuestions(),
            timeStarted,
            timeToEnd
        }
    });

    addNotification({ message: `Created a new test for ${sess.email}`, success: true });
});

router.post("/submit-test", (req: Request, res: Response) => {
    
    const sidCookie = req.cookies["HCST_SID"];
    const session = getSessionBySid(sidCookie);

    // Check that all the form data exists
    const { answers } = req.body;
    if (!answers) {
        res.json({ success: false, message: "No answers provided" });
        return;
    }

    // make sure they are who they say they are
    if (session === undefined) {
        res.json({ success: false, message: `Session for ${name} not found` });
        return;
    }

    if (session.data === undefined) {
        res.status(HTTP.CLIENT_ERROR.BAD_REQUEST).json({ success: false, message: `Session has no quiz to submit` });
        return;
    }

    // make sure they sent the right amount of answers
    if (answers.length !== session.data.quiz.questions.length) {
        res.json({ success: false, message: `not enough answers sent. recieved ${answers} but requires ${session.data.quiz.questions.length} many` });
        return;
    }

    // remove them from the sessions
    removeSession(session);

    const responseBlob = {
        answers: answers,
        quiz: session.data.quiz,
    };

    // Log the answers to the user's identity
    const timeStart = responseBlob.quiz.timeStarted;
    const timeSubmitted = new Date();
    const due = (responseBlob.quiz.timeToEnd || new Date());
    
    const data = {
        email: name,
        responseBlob: JSON.stringify(responseBlob),
        testId: responseBlob.quiz.testGroup.id,
        timeStart: timeStart.toISOString(),
        timeSubmitted: timeSubmitted.toISOString(),
        timeDue: due.toISOString(),
    }

    Submission.create(data);

    addNotification({ message: `Test just submitted by ${name}`, success: true });
});

router.post("/check-auth", (req: Request, res: Response) => {
    const sid = req.body["HCST_SID"];
    console.log(req.body);
    if (sid === undefined) {
        res.json({
            success: false,
            message: "Not signed in", 
        });
        return;
    }

    const sess = getSessionBySid(sid);
    if (sess === undefined) {
        res.json({
            success: false,
            message: "No session id",
        });
        return;
    }

    res.json({
        success: true,
        message: "Signed in",
        data: {
            email: sess.email,
            name: sess.name,
        }
    });
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
        res
            .status(HTTP.SERVER_ERROR.INTERNAL_SERVER_ERROR)
            .json({
                success: false,
                message: "Could not get access token",
            })
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
        res
            .status(HTTP.SERVER_ERROR.INTERNAL_SERVER_ERROR)
            .json({
                success: false,
                message: "Could not fetch user profile info",
            })
        throw new Error(`Error: ${errorResponse.error} - ${errorResponse.error_description}`);
    }
    
    const userInfo = await emailResponse.json();
    console.log(userInfo);

    // Make them an account session
    const sessionId = crypto.randomBytes(16).toString("hex");
    res.cookie("HCST_SID", sessionId, { maxAge: 1000 * 60 * 60, secure: true, path: "/" });
    res.json({
        success: true,
        message: "Signed in",
        data: {
            sessionId
        }
    }); 

    const session = new Session(sessionId, userInfo.email, userInfo.name);
    addSession(session);
});