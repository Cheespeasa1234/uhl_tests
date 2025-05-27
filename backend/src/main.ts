// Main program
import express, { Request, Response, NextFunction } from "npm:express";
import cors from "npm:cors";

import { router as gradingRouter } from "./routes/admin.ts";
import { router as testingRouter } from "./routes/students.ts";
import { logDebug, logInfo } from "./lib/logger.ts";
import { HCST_PORT, HCST_HOST } from "./lib/env.ts";
import { HTTP } from "./lib/util.ts";

const PORT = HCST_PORT;
const HOST = HCST_HOST;
const app = express();

app.use(cors({
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    origin: true,
}));

app.use((req: Request, res: Response, next: NextFunction) => {
    logInfo("main/req", `${req.ip}: ${req.method} - ${res.statusCode} ${req.url}`);
    next();
});

app.use("/api/grading", gradingRouter);
app.use("/api/testing", testingRouter);

app.get("/api/ping", (req, res) => {
    res.json("pong");
})

app.listen(Number(PORT), HOST, () => {
    logInfo("main", `Listening on port ${PORT}`);
});