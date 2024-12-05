import { parse, stringify } from "jsr:@std/csv";
import { Quiz, QuizQuestion } from "../uhl_tests/quiz/quiz.ts";

function getEntries(): CSVEntry[] {
    const text = Deno.readTextFileSync("responses.csv").replaceAll("\"", "'");
    const data = parse(text, {
        skipFirstRow: true,
        strip: true,
    });

    return data.map(line => {return new CSVEntry(line)});
}

function gradeStudent(csvEntry: CSVEntry) {
    console.log(`${csvEntry.name} took test on ${csvEntry.epochTime.toLocaleString()}`);
    const answers = csvEntry.responseBlob.answers;
    for (let i = 0; i < csvEntry.responseBlob.quiz.questions.length; i++) {
        const question = csvEntry.responseBlob.quiz.questions[i];
        console.log("== GRADING ==");
        console.log("  ", question.answer.replaceAll("\n", "\\n"));
        console.log("  ", answers[i].replaceAll("\n", "\\n"));
        if (question.answer != answers[i]) {
            console.log("  ", "Incorrect");
        } else {
            console.log("  ", "Correct");
        }
    }
}

type ResponseBlob = {
    answers: string[],
    quiz: Quiz,
}

class CSVEntry {
    name: string;
    epochTime: Date;
    idCookie: string;
    answerCode: string;
    responseBlob: ResponseBlob;

    constructor(entry: any) {
        this.name = entry.name;
        this.epochTime = new Date(Number(entry.epochTime));
        this.idCookie = entry.idCookie;
        this.answerCode = entry.answerCode;

        const s = entry.responseBlob.replaceAll("~", ",").replaceAll("'", "\"");
        this.responseBlob = JSON.parse(s);
    }
}

const entries = getEntries();
entries.forEach(entry => gradeStudent(entry));