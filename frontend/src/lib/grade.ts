/**
 * Exports types related to grading and questions.
 */

/**
 * An object representing an evaluation of a student's response.
 * Computed on the server, and used to display how the student did.
 */
export type Grade = {
    /**
     * The student's email
     */
    name: string,

    /**
     * The milliseconds since 1/1/1970 when the student submitted their test.
     * Subtract this from the due date to see how overdue (or early) the student was.
     */
    epochTime: number,

    /**
     * The milliseconds since 1/1/1970 when the test was due for submission.
     * Subtract the epochTime from this to see how overdue (or early) the student was.
     */
    due: number,
    
    /**
     * The questions and responses the student was asked.
     */
    questions: Question[],

    /**
     * The number of correct and incorrect answers in total.
     */
    numberCorrect: { 
        /**
         * The number of correct answers.
         */
        correct: number,

        /**
         * The number of incorrect answers.
         */
        incorrect: number
    },
}

/**
 * An object representing each question of a quiz.
 */
export type Question = {

    /**
     * The content of the question asked to the student.
     */
    question: {
        /**
         * The english question asked before code samples. For example, "Select one:", or "What does the console output?"
         */
        descriptor: string,

        /**
         * The code content given to a student.
         */
        questionString: string
    },

    /**
     * The exact text the student submitted.
     */
    userAnswer: string,

    /**
     * The exact text which is the correct answer.
     */
    correctAnswer: string,

    /**
     * Whether or not the student was correct.
     * Evaluated in the backend- so even if userAnswer and correctAnswer are different, it might be correct anyway.
     */
    correct: boolean,
}