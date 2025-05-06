import { Test } from "../../lib/db.ts";
import { LineOfCode, CodeEnvironment } from "./code.ts";
import { codeToJava, outputToJava } from "./codegen.ts";
import crypto from "node:crypto";

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
    testGroup: Test;
    timeStarted: Date;
    timeToEnd: Date | undefined;

    constructor(questions: QuizQuestion[], timeStarted: Date, timeToEnd: Date | undefined, testGroup: Test) {
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
}