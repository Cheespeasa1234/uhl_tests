import { QuizQuestion } from "./lib/quiz.ts";
import { logInfo } from "./lib/logger.ts";
import { Submission } from "./lib/db.ts";

export async function getResponses(): Promise<Submission[]> {
    const responses: Submission[] = await Submission.findAll();

    logInfo("analyze_responses", "Got responses from database");
    return responses;
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