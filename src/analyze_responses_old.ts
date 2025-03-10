import { parse } from "jsr:@std/csv";
import { Quiz, QuizQuestion } from "./lang/quiz/quiz.ts";
import { getValues } from "./sheets.ts";

import { logInfo } from "./lib/logger.ts";
import { HCST_SPREADSHEET_ID } from "./lib/env.ts";

export const TEST_PROGRAM_RESPONSES_CSV_LOC = "./files/test_program_responses.csv";
export const GOOGLE_FORM_RESPONSES_CSV_LOC = "./files/google_form_responses.csv";

export type ResponseBlob = {
    answers: string[];
    quiz: Quiz;
};

export class CSVEntry_TestProgram {
    name: string;
    epochTime: Date;
    due: Date;
    idCookie: string;
    answerCode: string;
    responseBlob: ResponseBlob;

    constructor(entry: any) {
        this.name = entry.name;
        this.epochTime = new Date(Number(entry.epochTime));
        this.due = new Date(Number(entry.due));
        this.idCookie = entry.idCookie;
        this.answerCode = entry.answerCode;

        const s = entry.responseBlob.replaceAll("~c", ",").replaceAll(
            "~q",
            '"',
        );
        this.responseBlob = JSON.parse(s);
    }
}

export class CSVEntry_GoogleForm {
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

/**
 * Opens the test program sheet and gets the csv entries from it
 */
export function getTestProgramResponses(): CSVEntry_TestProgram[] {
    const text = Deno.readTextFileSync(TEST_PROGRAM_RESPONSES_CSV_LOC);
    const data = parse(text, {
        skipFirstRow: true,
        strip: true,
        lazyQuotes: true,
    });

    return data.map((line) => {
        return new CSVEntry_TestProgram(line);
    });
}

export function getTestProgramRaw(): any[][] {
    const text = Deno.readTextFileSync(TEST_PROGRAM_RESPONSES_CSV_LOC);
    const data = parse(text, {
        strip: true,
        lazyQuotes: true,
    });

    return data;
}

export function appendTestProgramCSV(line: string): void {
    Deno.writeTextFileSync(TEST_PROGRAM_RESPONSES_CSV_LOC, line, { append: true });
}

/**
 * Opens the google form sheet and gets the results from it
 */
export async function getGoogleFormResponses(): Promise<CSVEntry_GoogleForm[]> {
    const data = await getGoogleFormRaw();
    return data.map((line) => new CSVEntry_GoogleForm(line));
}

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

/**
 * Takes a response entry and grades their results, and prints it all out.
 * @param csvEntry The CSV entry to grade
 */
export function gradeStudent(csvEntry: CSVEntry_TestProgram): GradeResult {
    
    const grade = new GradeResult(csvEntry.name, csvEntry.epochTime, csvEntry.due);
    for (let i = 0; i < csvEntry.responseBlob.quiz.questions.length; i++) {
        const questionResult: QuestionResult = new QuestionResult(csvEntry.responseBlob.quiz.questions[i], csvEntry.responseBlob.answers[i])
        grade.addQuestionResult(questionResult);
    }

    return grade;

}

/**
 * Grades a student by their google form data
 * Checks the full responses csv, and finds the response that makes the most sense for it
 * @param responses The responses csv data that the student may be in
 * @param result Their submission to the google form
 */
export function gradeStudentByFormInput(
    response: CSVEntry_TestProgram,
    result: CSVEntry_GoogleForm,
): GradeResult | undefined {

    // Check the answer
    if (result.answerCode !== response.answerCode) {
        return undefined;
    }
    logInfo("analyze_responses", "Graded student by form input");
    return gradeStudent(response);
}