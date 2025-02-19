import express, { Request, Response, Router, NextFunction } from "npm:express";
// @deno-types="npm:@types/body-parser"
import bodyParser from "npm:body-parser";
// @deno-types="npm:@types/cookie-parser"
import cookieParser from "npm:cookie-parser";
import crypto from "node:crypto";

import { CSVEntry_GoogleForm, CSVEntry_TestProgram, getGoogleFormResponses, getTestProgramResponses, gradeStudentByFormInput, GradeResult, QuestionResult, getGoogleFormRaw, getTestProgramRaw, gradeStudent } from "../analyze_responses.ts";
import { getActiveSessions, manualConfigs, presetManager } from "./testing.ts";
import { PresetManager, type Preset } from "../config.ts";
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
            message: "Invalid sessionId (either it expired, or it is invalid)"
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
            message: "Successfully set SID",
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
        message: "Successfully fetched sessions",
        data: {
            sessions: getActiveSessions()
        }
    });
});

router.get("/google-form", checkSidMiddleware, async (req: Request, res: Response) => {
    const data = await getGoogleFormRaw();

    return res.json({
        success: true,
        message: "Successfully fetched google form",
        data: {
            header: data[0],
            rows: data.slice(1)
        }
    });
})

router.get("/test-program", checkSidMiddleware, (req: Request, res: Response) => {
    const data = getTestProgramRaw();
    const header = data[0];
    const rows = data.slice(1);

    return res.json({
        success: true,
        message: "Successfully fetched test program",
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
            message: "No test program responses found where that email exists"
        })
    }

    if (googleFormResponses.length === 0) {
        return res.json({
            success: false,
            message: "No google form responses found where that email exists"
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
                message: "Successfully graded student",
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

/**
 * Get the value of the given preset. If the presetName is "default", the default preset is obtained.
 */
router.get("/config/get_preset/:presetName", checkSidMiddleware, (req: Request, res: Response) => {
    const presetName = req.params['presetName'];
    const preset = presetManager.getPreset(presetName);
    if (preset) {
        res.json({
            success: true,
            message: "Successfully retrieved preset",
            data: {
                preset: preset
            }
        })
    } else {
        res.json({
            success: false,
            message: "That preset name doesn't exist.",
        })
    }
});

/**
 * Gets the default preset.
 */
router.get("/config/get_preset_default", checkSidMiddleware, (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Got the default preset",
        data: {
            preset: PresetManager.defaultPreset
        }
    })
})

/**
 * Set the value of a preset to a given value.
 */
router.post("/config/set_preset", checkSidMiddleware, (req: Request, res: Response) => {
    const presetName = req.body['presetName'];
    const preset: Preset = req.body['preset'] as Preset;
    presetManager.setPreset(presetName, preset);

    res.json({
        success: true,
        message: "Successfully set " + presetName + " to the given value."
    });
});

/**
 * Set the current configuration in use.
 */
router.post("/config/set_config", checkSidMiddleware, (req: Request, res: Response) => {
    const preset = req.body['preset'];
    console.log("Setting currentPreset to " + preset);
    presetManager.currentPreset = preset;

    res.json({
        success: true,
        message: "Successfully set the current configuration"
    })
});

/**
 * Get the current configuration in use.
 */
router.get("/config/get_config", checkSidMiddleware, (req: Request, res: Response) => {
    console.log(presetManager.currentPreset);
    res.json({
        success: true,
        message: "Successfully got the current configuration",
        data: {
            preset: presetManager.currentPreset
        }
    })
});

router.get("/config/list_of_presets", checkSidMiddleware, (req: Request, res: Response) => {
    const presets = presetManager.listOfPresets();
    res.json({
        success: true,
        message: "Successfully got list of presets",
        data: {
            presets: presets
        }
    });
});

// Extra configs (manually made)
router.get("/manualConfig/:key", checkSidMiddleware, (req: Request, res: Response) => {
    const key = req.params["key"];
    if (manualConfigs.has(key)) {
        res.json({
            success: true,
            message: `Successfully retrieved value of ${key}`,
            data: {
                value: manualConfigs.get(key),
            }
        })
    } else {
        res.json({
            success: false,
            message: `Key ${key} not found.`,
        });
    }
});

router.post("/manualConfig", checkSidMiddleware, (req: Request, res: Response) => {
    const { type, key, value } = req.body;
    if (!type) {
        return res.json({
            success: false,
            message: "type parameter not provided",
        });
    }
    if (!key) {
        return res.json({
            success: false,
            message: "key parameter not provided",
        });
    }
    if (!value) {
        return res.json({
            success: false,
            message: "value parameter not provided",
        });
    }

    if (!manualConfigs.has(key)) {
        return res.json({
            success: false,
            message: `Key ${key} not found`,
        });
    }

    // SPAGHETTI!!!!!1
    if (type == 'number') {
        const num: number = Number(value);
        if (Number.isFinite(num)) {
            manualConfigs.set(key, num);
            return res.json({
                success: true,
                message: `Successfully set ${key} to ${value}`,
            });
        } else {
            return res.json({
                success: false,
                message: `Failed to set ${key} to ${value}: ${value} is not a finite number`,
            });
        }
    } else if (type == 'boolean') {
        const v = value != "false";
        console.log("STRING!", value);
        console.log("BOOLEAN!", v);
        manualConfigs.set(key, v);
        return res.json({
            success: true,
            message: `Successfully set ${key} to ${value}`
        });
    } else {
        const types = ['number', 'boolean'];
        return res.json({
            success: false,
            message: `Type ${type} is not ${types.join(" or ")}`,
        });
    }
});