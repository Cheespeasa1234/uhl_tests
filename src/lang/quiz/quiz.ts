import { DB_TestGroup } from "../../lib/db.ts";
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

export type QuizQuestionCensored = {
    questionString: string;
    descriptor: string;
}

export class QuizQuestion {
    questionCode: LineOfCode[];
    questionString: string;
    answer: string;
    descriptor: string;

    constructor(questionCode: LineOfCode[], descriptor?: string) {
        console.log("CONSTRUCTOR CALLED");
        this.questionCode = questionCode;
        this.questionString = codeToJava(questionCode);
        this.answer = this.getAnswer();
        this.descriptor = descriptor || "unnamed question";
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
    testGroup: DB_TestGroup;
    timeStarted: Date;
    timeToEnd: Date | null;

    constructor(questions: QuizQuestion[], timeStarted: Date, timeToEnd: Date | null, testGroup: DB_TestGroup) {
        this.questions = questions;
        this.timeStarted = timeStarted;
        this.timeToEnd = timeToEnd;
        this.testGroup = testGroup;
    }

    canBeSubmittedNow(): boolean {
        const now = new Date();
        if (this.timeToEnd == null)
            return true;

        if (this.timeToEnd.getTime() < now.getTime())
            return false;
        return true;
    }
    
    getCensoredQuestions(): QuizQuestionCensored[] {
        return this.questions.map(question => {
            return { questionString: question.questionString, descriptor: question.descriptor }
        })
    }

    getSolutionKey(student: Student): string {
        let solutionKey = student.name;
        for (const question of this.questions) {
            solutionKey += "-" + question.getAnswerCode(student);
        }
        return solutionKey;
    }
}