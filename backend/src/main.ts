// Main program
import express, { Request, Response, NextFunction } from "npm:express";

import { router as gradingRouter } from "./routes/admin.ts";
import { router as testingRouter } from "./routes/students.ts";
import { logDebug, logInfo } from "./lib/logger.ts";
import { HCST_PORT, HCST_HOST } from "./lib/env.ts";
import { HTTP } from "./lib/util.ts";

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
    const statusCode = res.statusCode;
    logInfo("main/req", `${req.ip}: ${req.method} - ${res.statusCode} ${req.url}`);
    next();
});

// app.use((req: Request, res: Response, next: NextFunction) => {
//     if (timeoutID) {
//         clearTimeout(timeoutID);
//     }
//     timeoutID = setTimeout(timeoutExit, timeoutLengthMs);
//     next();
// });

app.use("/api/grading", gradingRouter);
app.use("/api/testing", testingRouter);

app.listen(Number(PORT), HOST, () => {
    logInfo("main", `Listening on port ${PORT}`);
});