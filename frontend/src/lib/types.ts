/**
 * Exports types related to Presets.
 */

/**
 * A config value inside of a preset
 */
export type PresetValue = {
    /**
     * The name of the value
     */
    key: string,

    /**
     * The actual stringified value
     */
    value: string,

    /**
     * Either "number", "string", or "boolean"
     */
    valueType: string,
}

/**
 * A map of strings to PresetValues
 */
export type PresetBlob = {
    [key: string]: PresetValue,
}

/**
 * A preset
 */
export type Preset = {
    /**
     * The ID in the database
     */
    id: number,

    /**
     * The display name
     */
    name: string,

    /**
     * The stringified PresetBlob.
     * Before operating on it, parse it to a PresetBlob.
     */
    blob: string,

    /**
     * A string ISO date of when the database entry was created.
     * Convert it to a date before operating on it.
     */
    createdAt: string,

    /**
     * A string ISO date of when the database entry was last updated.
     * Convert it to a date before operating on it.
     */
    updatedAt: string,
}

export type PresetListEntry = {
    name: string,
    id: string,
}

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

    timeStart: string,
    timeSubmitted: string,
    timeDue: string,
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

export type Test = {
    id: number,
    code: string,
    presetId: number,

    /**
     * Whether or not the test code can be used by students
     */
    enabled: boolean,
    
    /**
     * A string ISO date of when the database entry was created.
     * Convert it to a date before operating on it.
     */
    createdAt: string,

    /**
     * A string ISO date of when the database entry was last updated.
     * Convert it to a date before operating on it.
     */
    updatedAt: string,
}

export type EventLocals = {
    signedIn: boolean,
    session?: {
        name: string,
        email: string,
    }
}