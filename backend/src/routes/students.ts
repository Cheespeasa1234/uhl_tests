import express, { Request, Response, NextFunction, CookieOptions } from "npm:express";
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
import { HTTP } from "../lib/util.ts";
import { COOKIE_DOMAIN, HCST_OAUTH_CLIENT_ID, HCST_OAUTH_CLIENT_SECRET, HCST_OAUTH_REDIRECT_URI } from "../lib/env.ts";
import { Test, Submission, Preset, parsePresetData, PresetData, ConfigValueType } from "../lib/db.ts";
import { addSession, getSessionBySid, removeSession, Session } from "./sessions.ts";

const trackerCookieOpts: CookieOptions = { path: "/", domain: COOKIE_DOMAIN, httpOnly: true, secure: true, sameSite: "none" }

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
        res.cookie("HCS_ID", id, trackerCookieOpts);
        addNotification({ message: "Started tracking new user", success: true });
        next();
    }
});

router.get("/ping", (req, res) => {
    res.json("pong");
})

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
        return;
    }
    
    const session: Session | undefined = getSessionBySid(sidCookie);
    if (session === undefined) {
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
    let timeToEnd: Date = new Date(timeStarted.getTime() + 10000);
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

    session.activeQuiz = {
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

    addNotification({ message: `Created a new test for ${session.email}`, success: true });
});

router.post("/sync-answers", (req: Request, res: Response) => {

    const sidCookie = req.cookies["HCST_SID"];
    if (sidCookie === undefined) {
        res.status(HTTP.CLIENT_ERROR.UNAUTHORIZED).json({
            success: false,
            message: "No HCST_SID cookie provided",
        });
        return;
    }
    
    const session: Session | undefined = getSessionBySid(sidCookie);
    if (session === undefined) {
        res.status(HTTP.CLIENT_ERROR.UNAUTHORIZED).json({
            success: false,
            message: "Invalid HCST_SID",
        });
        return;
    }

    try {
        session.syncQuiz(req.body["answers"]);
    } catch (e) {
        res
            .status(HTTP.CLIENT_ERROR.BAD_REQUEST)
            .json({
                success: false,
                message: (e as Error).message,
            });
        return;
    }

    res
        .status(HTTP.SUCCESS.OK)
        .json({
            success: true,
            message: "Successfully synced test"
        });


});

router.get("/submit-test", (req: Request, res: Response) => {
    
    const sidCookie = req.cookies["HCST_SID"];
    if (sidCookie === undefined) {
        res.status(HTTP.CLIENT_ERROR.UNAUTHORIZED).json({
            success: false,
            message: "No HCST_SID cookie provided",
        });
        return;
    }
    
    const session: Session | undefined = getSessionBySid(sidCookie);
    if (session === undefined) {
        res
            .status(HTTP.CLIENT_ERROR.UNAUTHORIZED)
            .json({
                success: false,
                message: "Invalid HCST_SID",
            });
        return;
    }

    try {
        session.submitQuiz();
    } catch (e) {
        res
            .status(HTTP.SERVER_ERROR.INTERNAL_SERVER_ERROR)
            .json({
                success: false,
                message: (e as Error).message,
            });
        return;
    }

    addNotification({ message: `Test just submitted by ${session.email}`, success: true });
    res.status(HTTP.SUCCESS.OK).json({
        success: true,
        message: "Successfully submitted test"
    });
});

router.get("/check-auth", (req: Request, res: Response) => {
    console.log(JSON.stringify(req.cookies));
    const sidCookie = req.cookies["HCST_SID"];
    if (sidCookie === undefined) {
        res.status(HTTP.CLIENT_ERROR.UNAUTHORIZED).json({
            success: false,
            message: "No HCST_SID cookie provided",
        });
        return;
    }
    
    const session: Session | undefined = getSessionBySid(sidCookie);
    if (session === undefined) {
        res.status(HTTP.CLIENT_ERROR.UNAUTHORIZED).json({
            success: false,
            message: "Invalid HCST_SID",
        });
        return;
    }

    res.json({
        success: true,
        message: "Signed in",
        data: session.getPreviewData()
    });
});

router.post("/oauth-token", async (req: Request, res: Response) => {
    console.log(req.body);
    const code = req.body["code"];
    if (code === undefined) {
        res.status(HTTP.CLIENT_ERROR.BAD_REQUEST).json({
            success: false,
            message: "No code provided",
        });
        return;
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
            .status(HTTP.CLIENT_ERROR.BAD_REQUEST)
            .json({
                success: false,
                message: errorResponse
            })
        throw new Error(`${errorResponse.error} - ${errorResponse.error_description}`);
    }

    const r = await response.json();
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

    // Make them an account session
    const sessionId = crypto.randomBytes(16).toString("hex");
    res.cookie("HCST_SID", sessionId, trackerCookieOpts);
    res.json({
        success: true,
        message: "Signed in",
        data: {
            sessionId
        }
    }); 

    const session = new Session(access_token, refresh_token, expires_in, sessionId, userInfo.email, userInfo.name);
    addSession(session);
});

router.get('/logout', (req: Request, res: Response) => {
    const sid = req.cookies["HCST_SID"];
    const session = getSessionBySid(sid);

    if (session === undefined || session.getExpired()) {
        res
            .status(HTTP.CLIENT_ERROR.BAD_REQUEST)
            .json({
                success: false,
                message: "Not signed in"
            });
        return;
    }

    res.clearCookie('HCST_SID', { path: '/' }); // Clear the HCST_SID cookie
    session.signOut();
    res
        .status(HTTP.SUCCESS.OK)
        .json({
            success: true,
            message: "Signed out",
        });
});
