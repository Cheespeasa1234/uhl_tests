// @deno-types="npm:@types/express"
import express, { Request, Response, NextFunction } from "npm:express";
// @deno-types="npm:@types/body-parser"
import bodyParser from "npm:body-parser";
// @deno-types="npm:@types/cookie-parser"
import cookieParser from "npm:cookie-parser";
import crypto from "node:crypto";

import { Quiz, QuizQuestion, Student } from "../uhl_tests/quiz/quiz.ts";
import { generateDoubleForLoop, generateForLoop } from "../uhl_tests/quiz/codegen.ts";
import { $ } from "../uhl_tests/quiz/code.ts";

const PORT = 5173;
const app = express();

// Parse request body & cookies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

// Identify and track users by an ID
app.use((req: Request, res: Response, next: NextFunction) => {
    // Add an identifier cookie
    console.log("IDing user");
    const idCookie = req.cookies["HCS_ID"];
    if (idCookie) {
        next();
    } else {
        const id = crypto.randomBytes(32).toString("hex");
        res.cookie("HCS_ID", id, { maxAge: 1000 * 60 * 60, secure: true, domain: "natelevison.com" });
        next();
    }
});

type Session = {
    student: Student,
    quiz: Quiz,
};

const activeSessions: {[id:string]: (Session | undefined)} = {};

/**
 * IN: { name: string }
 * OUT: { success: boolean, message: string, questions: QuizQuestion[], student: Student}
 * 
 * Request a new test.
 */
app.post("/new-test", (req: Request, res: Response) => {
    
    const name = req.body['name'];
    if (!name) {
        res.json({
            success: false,
            message: "No name provided"
        });
        return;
    }

    const questions = new Array<QuizQuestion>(5);
    for (let i = 0; i < questions.length - 2; i++) {
        questions[i] = new QuizQuestion(generateForLoop("i", [$("print", "$*#i")]));
    }
    questions[questions.length - 2] = new QuizQuestion(generateDoubleForLoop());
    questions[questions.length - 1] = new QuizQuestion(generateDoubleForLoop());

    const quiz = new Quiz(questions);
    const student = new Student(name);
    
    const session: Session = { student, quiz };
    activeSessions[student.name] = session;

    res.json({
        success: true,
        message: "",
        questions,
        student,
    });
});

app.post("/submit-test", (req: Request, res: Response) => {
    
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
    const { name, privateKey } = studentSelf;
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
    res.json({ success: true, message: "Test (totally) submitted. TEMPORARY!", answerCode});

    const responseBlob = {
        answers: answers,
        quiz: session.quiz,
    };

    function sanitizeForCSV(text: string) {
        return text.replaceAll(",", "~").replaceAll("\n", "");
    }

    // Log the answers to the user's identity
    Deno.writeTextFileSync("responses.csv", `\n${sanitizeForCSV(name)},${Date.now()},${sanitizeForCSV(req.cookies["HCS_ID"])},${answerCode},${sanitizeForCSV(JSON.stringify(responseBlob))}`, { append: true });

});

app.get("/uhl_see_csv", (req: Request, res: Response) => {
    res.send("<h3>All tildes (~) are actually commas. They are just replaced to stop CSV injection.</h3><pre>" + Deno.readTextFileSync("responses.csv").toString() + "</pre>");
});

app.get("/uhl_see_sessions", (req: Request, res: Response) => {
    res.json(activeSessions);
});

app.get("/*", express.static("public"));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Listening on port ${PORT}`);
});