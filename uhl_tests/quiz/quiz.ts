import { LineOfCode, CodeEnvironment } from "./code.ts";
import { codeToJava, outputToJava } from "./codegen.ts";
import crypto from "node:crypto";

export class Student {
    name: string;
    privateKey: string;

    constructor(name: string) {
        console.log("NAME:", name);
        this.name = name;
        this.privateKey = crypto.randomBytes(16).toString("hex");
    }
}

export class QuizQuestion {
    questionCode: LineOfCode[];
    questionString: string;

    constructor(questionCode: LineOfCode[]) {
        this.questionCode = questionCode;
        this.questionString = codeToJava(questionCode);
    }

    getAnswer(): string {
        const env: CodeEnvironment = new CodeEnvironment();
        env.execute(this.questionCode);
        
        const output = outputToJava(env.output);
        return output;
    }

    getAnswerCode(student: Student): string {
        return crypto
            .createHash("sha256")
            .update(student.privateKey + this.getAnswer())
            .digest("hex")
            .substring(0, 4);
    }
}

export class QuizResponse extends QuizQuestion {
    attemptedAnswer: string;
    
    constructor(questionCode: LineOfCode[], attemptedAnswer: string) {
        super(questionCode);
        this.attemptedAnswer = attemptedAnswer;
    }

    override getAnswer(): string {
        return this.attemptedAnswer;
    }
}

export class Quiz {
    questions: QuizQuestion[];

    constructor(questions: QuizQuestion[]) {
        this.questions = questions;
    }

    getSolutionKey(student: Student): string {
        let solutionKey = student.name;
        for (const question of this.questions) {
            solutionKey += "-" + question.getAnswerCode(student);
        }
        return solutionKey;
    }
}