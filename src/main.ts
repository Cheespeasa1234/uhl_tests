// Main program
import express, { Request, Response, NextFunction } from "npm:express";

import { router as gradingRouter } from "./routes/admin.ts";
import { router as testingRouter } from "./routes/testing.ts";

const PORT = 5173;
const app = express();

function timeoutExit() {
    console.log("No requests have come in for 10 minutes. Exiting.");
    Deno.exit();
}
const timeoutLengthMs = 1000 * 60 * 10;
let timeoutID: number | undefined = setTimeout(timeoutExit, timeoutLengthMs);
app.use((req: Request, res: Response, next: NextFunction) => {
    if (timeoutID) {
        clearTimeout(timeoutID);
    }
    timeoutID = setTimeout(timeoutExit, timeoutLengthMs);
    next();
});

app.use("/api/grading", gradingRouter);
app.use("/api/testing", testingRouter);

app.get("/*", express.static("./public"));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Listening on port ${PORT}`);
});