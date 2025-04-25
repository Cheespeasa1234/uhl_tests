// @deno-types="npm:@types/express@4.17.15"
import express, { Request, Response, NextFunction } from "npm:express";
import bodyParser// @ts-types="body-parser"
, { json } from "npm:body-parser";
import cookieParser from "npm:cookie-parser";
import crypto from "node:crypto";

import { GoogleResponse, getResponses, gradeStudent, getGoogleFormResponses } from "../analyze_responses.ts";
import { getActiveSessions, manualConfigs, presetManager } from "./students.ts";
import { retrieveNotifications } from "../lib/notifications.ts";
import { logDebug, logInfo, logWarning } from "../lib/logger.ts";
import { HCST_ADMIN_PASSWORD } from "../lib/env.ts";
import { Preset, Test, Submission } from "../lib/db_sqlz.ts";
import { HTTP } from "../lib/http.ts";

export const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded());
router.use(cookieParser());

const secret: string = HCST_ADMIN_PASSWORD;
logDebug("admin", "SECRET: " + secret);

let sessionId: string | undefined;
let sessionIdClearTimeout: number | undefined;

const checkSidMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const sessionIdClaim = req.cookies['HCS_ADMIN_SID'];
    if (!sessionId || sessionIdClaim !== sessionId) {
        logWarning("admin/session", "User tried to access admin routes without a valid sessionId");
        res
            .status(HTTP.CLIENT_ERROR.UNAUTHORIZED)
            .json({
                success: false,
                message: "Invalid sessionId (either it expired, or it is invalid)"
            })
    } else {
        next();
    }
}

router.get("/am_i_signed_in", checkSidMiddleware, (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Valid sessionId"
    });
});

router.post("/get_session_id", (req: Request, res: Response) => {
    logInfo("admin/session", "Got request to get session id");
    
    const { pass } = req.body;
    if (pass === secret) {
        sessionId = crypto.randomBytes(16).toString("hex");
        if (sessionIdClearTimeout) {
            clearTimeout(sessionIdClearTimeout);
            logInfo("admin/session", "Cleared previous timeout");
        }
        sessionIdClearTimeout = setTimeout(() => {
            sessionId = undefined;
        }, 1000 * 60 * 60);
        
        res.cookie("HCS_ADMIN_SID", sessionId, { maxAge: 1000 * 60 * 60, secure: true, path: "/" });
        return res.json({
            success: true,
            message: "Successfully set SID",
            data: {
                sessionId
            }
        })
    } else {
        logWarning("admin/session", "pass is not equal to secret. pass: "+ pass);
        res
            .status(HTTP.CLIENT_ERROR.UNAUTHORIZED)
            .json({
                success: false,
                message: "pass is not equal to secret. pass: "+ pass
            });
    }
});

router.get("/sessions", checkSidMiddleware, (_req: Request, res: Response) => {
    logInfo("admin/session", "Fetching active sessions");
    return res.json({
        success: true,
        message: "Successfully fetched sessions",
        data: {
            sessions: getActiveSessions()
        }
    });
});

router.get("/google_form", checkSidMiddleware, async (_req: Request, res: Response) => {
    logInfo("admin/google_form", "Fetching Google form data");
    const data: GoogleResponse[] = (await getGoogleFormResponses()).slice(1);
    
    return res.json({
        success: true,
        message: "Successfully fetched google form",
        data: {
            rows: data
        }
    });
})

router.get("/test_program", checkSidMiddleware, async (_req: Request, res: Response) => {
    logInfo("admin/test_program", "Fetching test program data");
    const data: Submission[] = await getResponses();

    return res.json({
        success: true,
        message: "Successfully fetched test program",
        data: {
            rows: data
        }
    });
})

router.get("/grade/:studentEmail", checkSidMiddleware, async (req: Request, res: Response) => {
    const studentEmail = req.params['studentEmail'];
    if (!studentEmail) {
        return res
            .status(HTTP.CLIENT_ERROR.BAD_REQUEST)
            .json({
                success: false,
                message: "Student email not provided"
            });
    }

    const gfrPromised = await getGoogleFormResponses();

    const testProgramResponses: Submission[] = (await getResponses()).filter(val => val.email === studentEmail);
    const googleFormResponses: GoogleResponse[] = gfrPromised.filter(val => val.email === studentEmail);
    
    if (testProgramResponses.length === 0) {
        return res
            .status(HTTP.CLIENT_ERROR.NOT_FOUND)
            .json({
                success: false,
                message: "No test program responses found where that email exists"
            });
    }

    if (googleFormResponses.length === 0) {
        return res
            .status(HTTP.CLIENT_ERROR.NOT_FOUND)
            .json({
                success: false,
                message: "No google form responses found where that email exists"
            });
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
                    grade: gradeStudent(result)
                }
            });
        }
    }

    return res
        .status(HTTP.CLIENT_ERROR.NOT_FOUND)
        .json({
            success: false,
            message: "No answerCode match found",
        });
});

router.get("/config/get_preset/:presetName", checkSidMiddleware, async (req: Request, res: Response) => {
    const presetName = req.params['presetName'];
    const preset: Preset | null = await Preset.findOne({
        where: {
            name: presetName,
        }
    });
    if (preset === null) {
        res
            .status(HTTP.CLIENT_ERROR.NOT_FOUND)
            .json({
                success: false,
                message: "That preset name doesn't exist.",
            });
    } else {
        res.json({
            success: true,
            message: "Successfully retrieved preset",
            data: {
                preset: preset,
            }
        });
    }
});

/**
 * Gets the default preset.
 */
router.get("/config/get_preset_default", checkSidMiddleware, async (_req: Request, res: Response) => {
    const preset = await presetManager.getDefaultPreset();
    res.json({
        success: true,
        message: "Got the default preset",
        data: {
            preset: preset,
        }
    });
})

router.post("/config/new_preset", checkSidMiddleware, async (req: Request, res: Response) => {
    const preset: Preset = req.body['preset'];

    if (!preset) {
        return res
            .status(HTTP.CLIENT_ERROR.BAD_REQUEST)
            .json({
                succcess: false,
                message: "Parameter 'preset' not provided"
            });
    }

    const count = await Preset.count({
        where: {
            name: preset.name,
        }
    });

    if (count !== 0) {
        return res
            .status(HTTP.CLIENT_ERROR.BAD_REQUEST)
            .json({
                success: false,
                message: "Can not create new preset with name that already exists."
            });
    }

    await Preset.create({
        name: preset.name,
        blob: preset.blob,
    });

    return res
        .status(HTTP.SUCCESS.OK)
        .json({
            success: true,
            message: "Successfully made new preset"
        });

});

/**
 * Set the value of a preset to a given value.
 */
router.post("/config/set_preset", checkSidMiddleware, async (req: Request, res: Response) => {
    const preset: Preset = req.body['preset'];

    if (!preset) {
        return res
            .status(HTTP.CLIENT_ERROR.BAD_REQUEST)
            .json({
                success: false,
                message: "Parameter 'preset' not provided"
            });
    }

    const count = await Preset.count({
        where: {
            id: preset.id,
        }
    });

    if (count == 0) {
        return res
            .status(HTTP.CLIENT_ERROR.BAD_REQUEST)
            .json({
                success: false,
                message: "Preset does not exist, could not update it"
            });
    } else {
        await Preset.update({
            name: preset.name,
            blob: preset.blob,
        }, {
            where: {
                id: preset.id
            }
        });

        return res
            .status(HTTP.SUCCESS.OK)
            .json({
                success: true,
                message: "Successfully updated preset"
            });
    }
});

/**
 * Set the current configuration in use.
 */
router.post("/config/set_config", checkSidMiddleware, (req: Request, res: Response) => {
    const preset = req.body['preset'];
    logDebug("admin/preset", "Setting currentPreset to " + JSON.stringify(preset));
    presetManager.setCurrentPreset(preset);

    res.json({
        success: true,
        message: "Successfully set the current configuration"
    })
});

/**
 * Get the current configuration in use.
 */
router.get("/config/get_config", checkSidMiddleware, async (_req: Request, res: Response) => {
    const currentPreset: Preset = await presetManager.getCurrentPreset();
    logDebug("admin/preset", `current preset: ${JSON.stringify(currentPreset)}`);
    res.json({
        success: true,
        message: "Successfully got the current configuration",
        data: {
            preset: currentPreset
        }
    })
});

router.get("/config/list_of_presets", checkSidMiddleware, async (_req: Request, res: Response) => {
    const names = await Preset.findAll({
        attributes: ["name", "id"]
    });
    res.json({
        success: true,
        message: "Successfully got list of presets",
        data: {
            presets: names
        }
    });
});

router.get("/config/testcodes/:code", checkSidMiddleware, (req: Request, res: Response) => {
    const code = req.params['code'];
    // get the tests that have the given code
    const test = Test.findOne({
        where: {
            code: code
        }
    })
    if (test) {
        res.json({
            success: true,
            message: "Successfully retrieved test",
            data: {
                test: test
            }
        });
    } else {
        res.json({
            success: false,
            message: "Test not found"
        });
    }
});

router.get("/config/testcodes", checkSidMiddleware, async (_req: Request, res: Response) => {
    const tests: Test[] = await Test.findAll();

    res.json({
        success: true,
        message: "Successfully retrieved test codes",
        data: {
            amount: tests.length,
            tests: tests
        }
    });
});

router.post("/config/update_testcodes", checkSidMiddleware, async (req: Request, res: Response) => {
    const testCodes = req.body['testCodes'];
    if (!testCodes) {
        return res.json({
            success: false,
            message: "No testCodes provided"
        });
    }

    for (let i = 0; i < testCodes.length; i++) {
        const testCode = testCodes[i];
        const id = testCode['id'];
        const code = testCode['code'];
        const presetName = testCode['presetName'];
        const enabled = testCode['enabled'];

        if (!id) {
            return res.json({
                success: false,
                message: `No id provided for index ${i}`
            });
        }

        if (!code) {
            return res.json({
                success: false,
                message: `No code provided for index ${i}`
            });
        }

        if (!presetName) {
            return res.json({
                success: false,
                message: `No presetName provided for index ${i}`
            });
        }

        if (!Number.isFinite(Number(id))) {
            return res.json({
                success: false,
                message: `id is not a number for index ${i}`
            });
        }

        const test: Test | null = await Test.findByPk(id);
        if (test === null) {
            return res.json({
                success: false,
                message: `Test not found for index ${i}`
            });
        }

        const preset = await Preset.findByPk(test.presetId);
        if (preset) {
            test.presetId = preset.id;
        } else {
            return res.json({
                success: false,
                message: `Test returned undefined for id ${test.presetId}`
            })
        }

        test.code = code.toString();
        test.enabled = enabled;
        
        test.save();
    }

    res.json({
        success: true,
        message: "Successfully updated test codes"
    });
});


router.get("/config/update_testcode", checkSidMiddleware, async (req: Request, res: Response) => {
    const id = req.query['id'];
    const code = req.query['code'];
    const presetName = req.query['presetName'];
    const enabled = req.query['enabled'];

    if (!id) {
        return res.json({
            success: false,
            message: "No id provided"
        });
    }

    if (!code) {
        return res.json({
            success: false,
            message: "No code provided"
        });
    }

    if (!presetName) {
        return res.json({
            success: false,
            message: "No presetName provided"
        });
    }

    if (!enabled) {
        return res.json({
            success: false,
            message: "No enabled provided"
        });
    }

    if (!Number.isFinite(Number(id))) {
        return res.json({
            success: false,
            message: "id is not a number"
        });
    }

    const test = await Test.findByPk(Number(id));
    if (!test) {
        return res.json({
            success: false,
            message: "Test not found"
        });
    }

    const preset = await Preset.findOne({
        where: {
            name: presetName.toString()
        }
    });

    if (!preset) {
        return res.json({
            success: false,
            message: "Preset not found"
        });
    }

    const enabledBoolean = enabled === "true";

    test.code = code.toString();
    test.presetId = preset.id;
    test.enabled = enabledBoolean;

    test.save();
});

router.get("/notifications", checkSidMiddleware, (_req: Request, res: Response) => {
    const notifications = retrieveNotifications();
    res.json({
        success: true,
        message: "Successfully retrieved the notifications",
        data: {
            amount: notifications.length,
            notifications: notifications
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