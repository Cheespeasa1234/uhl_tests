import { Quiz, QuizQuestion } from "./lang/quiz/quiz.ts";
import { logInfo, logError } from "./lib/logger.ts";
import { Submission } from "./lib/db_sqlz.ts";
import { getValues } from "./sheets.ts";
import { HCST_SPREADSHEET_ID } from "./lib/env.ts";

export class GoogleResponse {
    timestamp: Date;
    email: string;
    answerCode: string;
    rating: number;

    // deno-lint-ignore no-explicit-any
    constructor(entry: any) {
        this.timestamp = new Date(entry[0]);
        this.email = entry[1];
        this.answerCode = entry[2];
        this.rating = Number(entry[3]);
    }
}

export async function getResponses(): Promise<Submission[]> {
    const responses = await Submission.findAll();
    logInfo("analyze_responses", "Got responses from database");
    return responses;
}

/**
 * Opens the google form sheet and gets the results from it
 */
export async function getGoogleFormResponses(): Promise<GoogleResponse[]> {
    const data = await getGoogleFormRaw();
    const responses = data.map((line) => new GoogleResponse(line));
    logInfo("analyze_responses", "Got responses from Google Form");
    return responses;
}

// deno-lint-ignore no-explicit-any
export async function getGoogleFormRaw(): Promise<any[][]> {
    const response = await getValues(HCST_SPREADSHEET_ID, "Form Responses 1");
    const values = response.data.values || [];
    return values;
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
    timeStart: Date;
    timeSubmitted: Date;
    timeDue: Date;
    questions: QuestionResult[];
    numberCorrect: { correct: number, incorrect: number } | undefined;

    constructor(name: string, timeStart: Date, timeSubmitted: Date, timeDue: Date) {
        this.name = name;
        this.timeStart = timeStart;
        this.timeSubmitted = timeSubmitted;
        this.timeDue = timeDue;
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

export function gradeStudent(entry: Submission): GradeResult {
    const grade = new GradeResult(entry.email, entry.getStart(), entry.getSubmitted(), entry.getEnd());
    const blob = entry.getBlob();
    for (let i = 0; i < blob.quiz.questions.length; i++) {
        const questionResult: QuestionResult = new QuestionResult(blob.quiz.questions[i], blob.answers[i])
        grade.addQuestionResult(questionResult);
    }
    logInfo("analyze_responses", "Graded student");
    return grade;
}

export function gradeStudentOnlyIfVerified(entry: Submission, googleEntry: GoogleResponse): GradeResult | undefined {
    if (entry.answerCode !== googleEntry.answerCode) {
        logError("analyze_responses", `answerCode in entry ${entry.answerCode} does not match answerCode in googleEntry ${googleEntry.answerCode}`);
        return undefined;
    }
    logInfo("analyze_responses", "Graded (verified)");
    return gradeStudent(entry);
}