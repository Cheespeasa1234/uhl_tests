import { Quiz, QuizQuestion } from "./lang/quiz/quiz.ts";
import { DatabaseSync } from "node:sqlite";
import { logInfo, logError } from "./lib/logger.ts";

const db = new DatabaseSync("db/responses.db");

export type TestResponseBlob = {
    answers: string[];
    quiz: Quiz;
};

export class TestResponse {
    id: number;
    email: string;
    time: Date;
    due: Date;
    idCookie: string;
    answerCode: string;
    blob: TestResponseBlob;

    constructor(entry: any) {
        this.id = entry.id;
        this.email = entry.email;
        this.time = new Date(entry.time);
        this.due = new Date(entry.due);
        this.idCookie = entry.idCookie;
        this.answerCode = entry.answerCode;
        this.blob = JSON.parse(entry.responseBlob);
    }
}

export class GoogleResponse {
    timestamp: Date;
    email: string;
    answerCode: string;
    rating: number;

    constructor(entry: any) {
        this.timestamp = new Date(entry[0]);
        this.email = entry[1];
        this.answerCode = entry[2];
        this.rating = Number(entry[3]);
    }
}

export function getResponses(): TestResponse[] {
    const stmt = db.prepare("SELECT * FROM Responses");
    const responsesAny = stmt.all();
    const responses = responsesAny.map((r) => new TestResponse(r));
    logInfo("analyze_responses", "Got responses from database");
    return responses;
}

export function getResponsesRaw(): any[][] {
    const stmt = db.prepare("SELECT * FROM Responses");
    const all = stmt.all() as any[];
    const header = ["id", "email", "time", "due", "idCookie", "answerCode", "responseBlob"];
    logInfo("analyze_responses", "Got raw responses from database");
    return [header, ...all];
}

export function addResponse(data: { email: string; time: Date; due: Date; idCookie: string; answerCode: string; blob: any }) {
    const stmt = db.prepare("INSERT INTO Responses (email, time, due, idCookie, answerCode, responseBlob) VALUES (?, ?, ?, ?, ?, ?)");
    stmt.run(data.email, data.time.getTime(), data.due.getTime(), data.idCookie, data.answerCode, JSON.stringify(data.blob));
    logInfo("analyze_responses", "Inserted response into database");
}

export class QuestionResult {
    question: QuizQuestion;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;

    constructor(question: QuizQuestion, userAnswer: string) {
        this.question = question;
        this.correct = question.answer === userAnswer;
        this.userAnswer = userAnswer;
        this.correctAnswer = question.answer;
    }
}

export class GradeResult {
    name: string;
    epochTime: Date;
    due: Date;
    questions: QuestionResult[];
    numberCorrect: { correct: number, incorrect: number } | undefined;

    constructor(name: string, epochTime: Date, due: Date) {
        this.name = name;
        this.epochTime = epochTime;
        this.due = due;
        this.questions = [];
    }

    addQuestionResult(qr: QuestionResult) {
        this.questions.push(qr);
        this.numberCorrect = this.getNumberCorrect();
    }

    getNumberCorrect(): { correct: number, incorrect: number } {
        let correct = 0;
        let incorrect = 0;
        this.questions.forEach(question => {
            if (question.correct)
                correct++;
            else
                incorrect++;
        });
        return { correct, incorrect };
    }
}

export function gradeStudent(entry: TestResponse): GradeResult {
    const grade = new GradeResult(entry.email, entry.time, entry.due);
    for (let i = 0; i < entry.blob.quiz.questions.length; i++) {
        const questionResult: QuestionResult = new QuestionResult(entry.blob.quiz.questions[i], entry.blob.answers[i])
        grade.addQuestionResult(questionResult);
    }
    logInfo("analyze_responses", "Graded student");
    return grade;
}

export function gradeStudentOnlyIfVerified(entry: TestResponse, googleEntry: GoogleResponse): GradeResult | undefined {
    if (entry.answerCode !== googleEntry.answerCode) {
        logError("analyze_responses", `answerCode in entry ${entry.answerCode} does not match answerCode in googleEntry ${googleEntry.answerCode}`);
        return undefined;
    }
    logInfo("analyze_responses", "Graded (verified)");
    return gradeStudent(entry);
}