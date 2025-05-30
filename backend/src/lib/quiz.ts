import { Test, Preset, PresetData, parsePresetData, ConfigKey } from "./db.ts";
import { logDebug, logWarning } from "./logger.ts";

function probability(prob: number): boolean {
    return Math.random() < prob;
}

function random(a: number, b: number): number {
    if (a > b) {
        [a, b] = [b, a];
    }
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function randomItem<T>(items: T[]): T {
    return items[random(0, items.length - 1)];
}

export type QuizQuestionCensored = {
    questionString: string;
    descriptor: string;
}

export class QuizQuestion {
    questionString: string;
    answer: string;
    descriptor: string;

    constructor(questionString: string, answer: string, descriptor: string) {
        this.questionString = questionString;
        this.answer = answer;
        this.descriptor = descriptor;
    }

    equals(question: QuizQuestion): boolean {
        return this.questionString == question.questionString;
    }

    static newForLoopQuestion(): QuizQuestion {
        const a = random(0, 4);
        const c = random(1, 3);
        const b = a + c * random(3, 6);
        const reversed = probability(0.35);

        let questionString = "";
        let answer = "";
        
        if (!reversed) {
            questionString = `for (int i = ${a}; i < ${b}; i += ${c}) {\n`
                + `\tSystem.out.println(i);\n`
                + `}`;
            for (let i = a; i < b; i += c) {
                answer += `${i}\n`;
            }
        } else {
            questionString = 
                `for (int i = ${b}; i > ${a}; i -= ${c}) {\n`
                + `\tSystem.out.println(i);\n`
                + `}`;
            for (let i = b; i > a; i -= c) {
                answer += `${i}\n`;
            }
        }

        return new QuizQuestion(questionString, answer, "What will the for loop print?");
    }

    static newNestedForLoopQuestion(): QuizQuestion {
        const a1 = random(0, 4);
        const c1 = random(1, 3);
        const b1 = a1 + c1 * random(3, 6);

        const a2 = random(0, 4);
        const c2 = random(1, 3);
        const b2 = a2 + c2 * random(3, 6);

        let questionString = "";
        let answer = "";
        
        questionString = 
            `for (int x = ${a1}; x < ${b1}; x += ${c1}) {\n`
            + `\tfor (int y = ${a2}; y < ${b2}; y += ${c2}) {\n`
            + `\t\tSystem.out.println(y);\n`
            + `\t}\n`
            + `}`;

        for (let x = a1; x < b1; x += c1) {
            for (let y = a2; y < b2; y += c2) {
                answer += `${y}\n`;
            }
        }

        return new QuizQuestion(questionString, answer, "What will the for loop print?");
    }

    static newStringQuestion(): QuizQuestion {
        const strings = [
            "Java is awesome!",
            "abcdefghijklmnopqrstuvwxyz",
            "I like my man like I like my coffee",
            "Nate Levison is cool.",
            "TypeScript rules, JavaScript drools",
            "Hello, World!",
            "Goodbye, World.",
            "cApItAlS MaTtEr!!",
        ]

        const str = randomItem(strings);
        const type = random(0, 3);

        let questionString = "";
        let answer = "";

        if (type === 0) { // substring
            const start = random(0, str.length / 2);
            const end = random(start, str.length - 1);
            questionString = `String x = "${str}".substring(${start}, ${end});`;
            answer = str.substring(start, end);
        } else if (type === 1) { // indexOf
            let idx = random(0, str.length - 1);
            let attempts = 0;
            while (str.charAt(idx) === " " && attempts < 3) {
                idx = random(0, str.length - 1);
                attempts++;
            }
            const char = str.charAt(idx);
            const index = str.indexOf(char);
            questionString = `int x = "${str}".indexOf("${char}");`;
            answer = index + "";
        } else if (type === 2) { // charAt
            let idx = random(0, str.length - 1);
            let attempts = 0;
            while (str.charAt(idx) === " " && attempts < 3) {
                idx = random(0, str.length - 1);
                attempts++;
            }
            const char = str.charAt(idx);
            questionString = `char x = "${str}".charAt(${idx});`;
            answer = char;
        } else if (type === 3) { // length
            questionString = `int x = "${str}".length();`;
            answer = str.length + "";
        }

        return new QuizQuestion(questionString, answer, "What will the value of x be after the code runs?");
    }

    static newSumQuestion(): QuizQuestion {
        const a = random(0, 4);
        const c = random(1, 3);
        const b = a + c * random(3, 6);
        const reversed = probability(0.35);

        let questionString = "";
        let sum = 0;
        
        if (!reversed) {
            questionString = 
                `int sum = 0;\n`
                + `for (int i = ${a}; i < ${b}; i += ${c}) {\n`
                + `\tsum += i;\n`
                + `}`;
            for (let i = a; i < b; i += c) {
                sum += i;
            }
        } else {
            questionString = 
                `int sum = 0;\n`
                + `for (int i = ${b}; i > ${a}; i -= ${c}) {\n`
                + `\tsum += i;\n`
                + `}`;
            for (let i = b; i > a; i -= c) {
                sum += i;
            }
        }

        return new QuizQuestion(questionString, sum + "", "What will the value of sum be after the loop?");
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

export async function makeTest(timeStarted: Date, timeToEnd: Date | undefined, testGroup: Test): Promise<Quiz> {

    const preset: Preset | null = await Preset.findByPk(testGroup.presetId);
    if (!preset) throw new Error("That preset doesn't exist");
    const blob: PresetData = parsePresetData(preset.blob);
    logDebug("codegen", `Blob: ${preset.blob}`);

    const quiz = new Quiz([], timeStarted, timeToEnd, testGroup);

    // Create for loop questions
    for (let i = 0; i < blob.get(ConfigKey.FOR_LOOP_COUNT)!.getNumberValue(); i++) {
        let question: QuizQuestion;
        let attempts = 0;
        do {
            question = QuizQuestion.newForLoopQuestion();
            attempts++;
            if (attempts > 1) {
                logWarning("codegen", `Avoiding duplicate: ${question} already exists`);
            }
            if (attempts > 5) {
                logWarning("codegen", `Could not avoid duplicate: ${question}`);
                break;
            }
        } while (quiz.questions.some(q => q.equals(question)));
        quiz.questions.push(question);
    }

    // Create double loop question
    for (let i = 0; i < blob.get(ConfigKey.NESTED_FOR_LOOP_COUNT)!.getNumberValue(); i++) {
        let question: QuizQuestion;
        let attempts = 0;
        do {
            question = QuizQuestion.newNestedForLoopQuestion();
            attempts++;
            if (attempts > 1) {
                logWarning("codegen", `Avoiding duplicate: ${question} already exists`);
            }
            if (attempts > 5) {
                logWarning("codegen", `Could not avoid duplicate: ${question}`);
                break;
            }
        } while (quiz.questions.some(q => q.equals(question)));
        quiz.questions.push(question);
    }

    // Create string question
    for (let i = 0; i < blob.get(ConfigKey.STRING_COUNT)!.getNumberValue(); i++) {
        let question: QuizQuestion;
        let attempts = 0;
        do {
            question = QuizQuestion.newStringQuestion();
            attempts++;
            if (attempts > 1) {
                logWarning("codegen", `Avoiding duplicate: ${question} already exists`);
            }
            if (attempts > 5) {
                logWarning("codegen", `Could not avoid duplicate: ${question}`);
                break;
            }
        } while (quiz.questions.some(q => q.equals(question)));
        quiz.questions.push(question);
    }

    for (let i = 0; i < blob.get(ConfigKey.SUM_PROD_LOOP)!.getNumberValue(); i++) {
        let question: QuizQuestion;
        let attempts = 0;
        do {
            question = QuizQuestion.newSumQuestion();
            attempts++;
            if (attempts > 1) {
                logWarning("codegen", `Avoiding duplicate: ${question} already exists`);
            }
            if (attempts > 5) {
                logWarning("codegen", `Could not avoid duplicate: ${question}`);
                break;
            }
        } while (quiz.questions.some(q => q.equals(question)));
        quiz.questions.push(question);
    }

    return quiz;
}