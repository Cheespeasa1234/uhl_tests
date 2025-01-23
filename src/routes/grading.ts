import express, { Request, Response, Router, NextFunction } from "npm:express";
// @deno-types="npm:@types/body-parser"
import bodyParser from "npm:body-parser";
// @deno-types="npm:@types/cookie-parser"
import cookieParser from "npm:cookie-parser";
import crypto from "node:crypto";

import { CSVEntry_GoogleForm, CSVEntry_TestProgram, getGoogleFormResponses, getTestProgramResponses, gradeStudentByFormInput, GradeResult, QuestionResult, getGoogleFormRaw, getTestProgramRaw, gradeStudent } from "../analyze_responses.ts";
import { getActiveSessions, presetManager } from "./testing.ts";
import { PresetManager } from "../config.ts";
import { load } from "jsr:@std/dotenv";

export const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded());
router.use(cookieParser());

const env = await load({ envPath: "../secrets/.env" });
const secret: string = env.ADMIN_PASSWORD;
console.log("SECRET: " + secret);

let sessionId: string | undefined;
let sessionIdClearTimeout: number | undefined;

const checkSidMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const sessionIdClaim = req.cookies['HCS_ADMIN_SID'];
    if (!sessionId || sessionIdClaim !== sessionId) {
        res.json({
            success: false,
            message: "Invalid sessionId"
        })
    } else {
        next();
    }
}

router.get("/am_i_signed_in", checkSidMiddleware, (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Valid sessionId"
    });
});

router.post("/get_session_id", (req: Request, res: Response) => {
    console.log(req.body);
    const { pass } = req.body;
    if (pass === secret) {
        sessionId = crypto.randomBytes(16).toString("hex");
        if (sessionIdClearTimeout) {
            clearTimeout(sessionIdClearTimeout);
        }
        sessionIdClearTimeout = setTimeout(() => {
            sessionId = undefined;
        }, 1000 * 60 * 60);
        
        res.cookie("HCS_ADMIN_SID", sessionId, { maxAge: 1000 * 60 * 60, secure: true, domain: "natelevison.com" });
        return res.json({
            success: true,
            message: "",
            data: {
                sessionId
            }
        })
    } else {
        res.json({
            success: false,
            message: "pass is not equal to secret. pass: "+ pass
        })
    }
});

router.get("/sessions", checkSidMiddleware, (req: Request, res: Response) => {
    return res.json({
        success: true,
        message: "",
        data: {
            sessions: getActiveSessions()
        }
    });
});

router.get("/google-form", checkSidMiddleware, async (req: Request, res: Response) => {
    const data = await getGoogleFormRaw();

    return res.json({
        success: true,
        message: "it also worked yippee",
        data: {
            header: ["Timestamp", "Email Address", "Answer Code", "How difficult was it?"], 
            rows: data
        }
    });
})

router.get("/test-program", checkSidMiddleware, (req: Request, res: Response) => {
    const data = getTestProgramRaw();
    const header = data[0];
    const rows = data.slice(1);

    return res.json({
        success: true,
        message: "it worked yippee",
        data: {
            header, rows
        }
    });
})

router.get("/grade/:studentEmail", checkSidMiddleware, async (req: Request, res: Response) => {
    const studentEmail = req.params['studentEmail'];
    if (!studentEmail) {
        return res.json({
            success: false,
            message: "Student email not provided"
        });
    }

    const gfrPromised = await getGoogleFormResponses();

    const testProgramResponses: CSVEntry_TestProgram[] = getTestProgramResponses().filter(val => val.name === studentEmail);
    const googleFormResponses: CSVEntry_GoogleForm[] = gfrPromised.filter(val => val.email === studentEmail);
    
    if (testProgramResponses.length === 0) {
        return res.json({
            success: false,
            message: "No test program responses found"
        })
    }

    if (googleFormResponses.length === 0) {
        return res.json({
            success: false,
            message: "No google form responses found"
        })
    }

    // find the test response and google form response that are most recent and that match
    let mostRecentGoogleFormResponse = googleFormResponses[0];
    let mostRecentTimeSince = mostRecentGoogleFormResponse.timestamp.getTime();

    for (const response of googleFormResponses) {
        if (response.timestamp.getTime() > mostRecentTimeSince) {
            mostRecentTimeSince = response.timestamp.getTime();
            mostRecentGoogleFormResponse = response;
        }
    }

    /// find the test result whose answer code is the same
    for (const result of testProgramResponses) {
        if (result.answerCode === mostRecentGoogleFormResponse.answerCode) {
            return res.json({
                success: true,
                message: "",
                data: {
                    grade:gradeStudent(result)
                }
            });
        }
    }

    return res.json({
        success: false,
        message: "No answerCode match found",
    })
});

router.post("/configure/swapto", checkSidMiddleware, (req: Request, res: Response) => {
    const presetName = req.body['presetName'];
    const p = presetManager.getPreset(presetName)
    if (p) {
        presetManager.currentPreset = p;
        return res.json({
            success: true,
            data: p
        })
    } else {
        return res.json({
            success: false,
            message: `No preset called ${presetName} found.`
        })
    }
})

router.post("/configure/swaptodefault", checkSidMiddleware, (req: Request, res: Response) => {
    presetManager.currentPreset = PresetManager.defaultPreset;
})

router.post("/configure/set/:preset/:value")

router.post("/configure/del/:preset")

router.post("/configure/new/:preset")