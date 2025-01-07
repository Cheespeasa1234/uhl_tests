import { parse } from "jsr:@std/csv";
import { Quiz } from "./lang/quiz/quiz.ts";

type ResponseBlob = {
    answers: string[],
    quiz: Quiz,
}

class CSVEntry_Responses {
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

        const s = entry.responseBlob.replaceAll("~c", ",").replaceAll("~q", "\"");
        this.responseBlob = JSON.parse(s);
    }
}

class CSVEntry_Results {
    timestamp: Date;
    email: string;
    answerCode: string;
    rating: number;

    constructor(entry: any) {
        this.timestamp = new Date(entry.timestamp);
        this.email = entry.email;
        this.answerCode = entry.answerCode;
        this.rating = Number(entry.rating);
    }
}

/**
 * Opens the responses.csv sheet and gets the csv entries from it
 */
function getResponses(): CSVEntry_Responses[] {
    const text = Deno.readTextFileSync("responses.csv");
    const data = parse(text, {
        skipFirstRow: true,
        strip: true,
        lazyQuotes: true,
    });

    return data.map(line => {return new CSVEntry_Responses(line)});
}

/**
 * Opens the results.csv sheet and gets the results from it
 */
function getResults(): CSVEntry_Results[] {
    const text = Deno.readTextFileSync("results.csv").replaceAll("\t", ",");
    console.log(text);
    const data = parse(text, {
        skipFirstRow: true,
        strip: true,
        lazyQuotes: true,
    });

    return data.map(line => {console.log(line); return new CSVEntry_Results(line)});
}

/**
 * Takes a response entry and grades their results, and prints it all out.
 * @param csvEntry The CSV entry to grade
 */
function gradeStudent(csvEntry: CSVEntry_Responses) {
    console.log(`${csvEntry.name} took test on ${csvEntry.epochTime.toLocaleString()}`);
    const answers = csvEntry.responseBlob.answers;
    let correct = 0;
    let incorrect = 0;
    for (let i = 0; i < csvEntry.responseBlob.quiz.questions.length; i++) {
        const question = csvEntry.responseBlob.quiz.questions[i];
        const correctAnswer = question.answer.replaceAll("\n", "\\n");
        const userAnswer = answers[i].replaceAll("\n", "\\n");
        const isCorrect = question.answer == answers[i];
        console.log(`Question ${i}`);
        if (isCorrect) {
            correct++;
            console.log("    ", "Correct");
        } else {
            incorrect++;
            console.log("    ", "Incorrect");
            console.log("    ", question.questionString);
        }
        console.log("    ", `student answer:'${userAnswer}'`);
        console.log("    ", `correct answer:'${correctAnswer}'\n`);
    }
}

/**
 * Grades a student by their google form data
 * Checks the full responses csv, and finds the response that makes the most sense for it
 * @param responses The responses csv data that the student may be in
 * @param result Their submission to the google form
 */
function gradeStudentByFormInput(responses: CSVEntry_Responses[], result: CSVEntry_Results) {
    
    // If it ends with email address, remove that
    if (result.email.endsWith("@pascack.org")) {
        result.email = result.email.substring(0, result.email.indexOf("@"));
    }

    // Find if they are in there
    const matchingEntries: CSVEntry_Responses[] = responses.filter(entry => entry.name === result.email);
    if (matchingEntries.length === 0) {
        console.log(`No matching entries for ${result.email} found.`);
        return;
    }

    // Find the most recent one
    let lowestDiff = result.timestamp.getTime();
    let mostRecent = matchingEntries[0];

    for (const matchingEntry of matchingEntries) {
        const time = result.timestamp.getTime() - matchingEntry.epochTime.getTime();
        if (time >= 0 && time < lowestDiff) {
            mostRecent = matchingEntry;
            lowestDiff = time;
        }
    }

    // Check the answer
    if (result.answerCode !== mostRecent.answerCode) {
        console.log(`answerCode in CSV (${result.answerCode}) does not match submitted answerCode (${mostRecent.answerCode})`);
        return;
    }
    gradeStudent(mostRecent);

} 

const responses: CSVEntry_Responses[] = getResponses();
const results: CSVEntry_Results[] = getResults();

results.forEach(result => {
    gradeStudentByFormInput(responses, result);
});