// Main program
import express, { Request, Response, NextFunction } from "npm:express";

import { router as gradingRouter } from "./routes/admin.ts";
import { router as testingRouter } from "./routes/testing.ts";
import { logDebug, logInfo } from "./lib/logger.ts";
import { HCST_PORT, HCST_HOST } from "./lib/env.ts";

const PORT = HCST_PORT;
const HOST = HCST_HOST;
const app = express();

function timeoutExit() {
    logInfo("main/timeout", "No requests have come in for 10 minutes. Exiting.");
    Deno.exit();
}
const timeoutLengthMs = 1000 * 60 * 10;
let timeoutID: number | undefined = setTimeout(timeoutExit, timeoutLengthMs);

app.use((req: Request, res: Response, next: NextFunction) => {
    // Log the whole request
    const lengthOfBody = (JSON.stringify(req.body || {}).length) + (JSON.stringify(req.query || {}).length) + (JSON.stringify(req.params || {}).length);
    const lengthOfCookies = (JSON.stringify(req.cookies) || "").length;
    const lengthOfHeaders = (JSON.stringify(req.headers) || "").length;
    logInfo("main/request", `${req.ip}: ${req.method} ${req.url} BODY:${lengthOfBody} COOK:${lengthOfCookies} HEAD:${lengthOfHeaders}`);
    next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
    if (timeoutID) {
        clearTimeout(timeoutID);
    }
    timeoutID = setTimeout(timeoutExit, timeoutLengthMs);
    next();
});

app.use("/api/grading", gradingRouter);
app.use("/api/testing", testingRouter);

app.get("/*", express.static("./src/public"));

app.listen(Number(PORT), HOST, () => {
    logInfo("main", `Listening on port ${PORT}`);
});