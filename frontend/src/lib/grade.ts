export type Grade = {
    name: string,
    epochTime: number,
    due: number,
    questions: Question[],
    numberCorrect: { correct: number, incorrect: number },
}

export type Question = {
    question: { descriptor: string, questionString: string },
    userAnswer: string,
    correctAnswer: string,
    correct: boolean,
}