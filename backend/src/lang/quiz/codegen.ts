import { $, CodeEnvironment, type LineOfCode } from "./code.ts";
import { ParsedToken } from "../typing/parsedToken.ts";
import { Quiz, QuizQuestion } from "./quiz.ts";
import { Test, Preset, PresetData, parsePresetData, ConfigKey } from "../../lib/db.ts";
import { logDebug, logInfo, logWarning } from "../../lib/logger.ts";

export function generateForLoop(
    varname: string,
    nest: LineOfCode[],
    smaller = false,
): LineOfCode[] {
    // Create the top of the for loop
    const direction = Math.random() > 0.35; // TRUE: left to right
    const length = Math.round(Math.random() * (smaller ? 1 : 2) + 3);
    const increment = Math.ceil(Math.random() * (smaller ? 1 : 3) + 0);
    let code: LineOfCode;
    if (direction) {
        code = $(
            "for",
            `$*#${varname} #0 $*#${varname} LT #${
                length * increment
            } $*#${varname} ADD #${increment}`,
        );
    } else {
        code = $(
            "for",
            `$*#${varname} #${
                length * increment
            } $*#${varname} GT #0 $*#${varname} SUB #${increment}`,
        );
    }

    // Set the opeq
    code.nest_1 = [];

    if (nest) {
        nest.forEach((line) => code.nest_1!.push(line));
    }
    return [code];
}

export function generateSumProdQuestion(
    varname: string,
    smaller = false,
): LineOfCode[] {
    // Create the top of the for loop
    const direction = Math.random() > 0.35; // TRUE: left to right
    const length = Math.round(Math.random() * (smaller ? 1 : 2) + 3);
    const increment = Math.ceil(Math.random() * (smaller ? 1 : 3) + 0);
    const initCode: LineOfCode = $("set", "$*#sum #0");
    const endCode: LineOfCode = $("print", "$*#sum");
    let code: LineOfCode;
    if (direction) {
        code = $(
            "for",
            `$*#${varname} #0 $*#${varname} LT #${
                length * increment
            } $*#${varname} ADD #${increment}`,
        );
    } else {
        code = $(
            "for",
            `$*#${varname} #${
                length * increment
            } $*#${varname} GT #0 $*#${varname} SUB #${increment}`,
        );
    }

    // Set the opeq
    code.nest_1 = [
        $("opeq", "$*#sum ADD $*#i"),
    ];

    return [initCode, code, endCode];
}

export function generateDoubleForLoop(): LineOfCode[] {
    const inner = generateForLoop("y", [$("print", `$*#y`)]);
    const outer = generateForLoop("x", [...inner]);

    return outer;
}

export function generateStringQuestion(): LineOfCode[] {
    return new CodeEnvironment().compile((() => {
        const options = [
            "Nate Levison GOAT",
            "Java is Awesome",
            "Hello World",
            "Goodbye World",
        ];
        const originalString =
            options[Math.floor(Math.random() * options.length)];
        const version = Math.floor(Math.random() * 3);
        if (version == 0) { // substring
            const start = Math.floor(Math.random() * (originalString.length / 2));
            let end = start + Math.floor(Math.random() * (originalString.length / 2));
            // if it ends in a space character, inc the end by 1
            if (originalString[end - 1] === " ") end++;
            return [
                {
                    action: "print",
                    values: [
                        ParsedToken.fromRawTokenString(".substring"),
                        ParsedToken.fromString(originalString),
                        ParsedToken.fromNumber(start),
                        ParsedToken.fromNumber(end),
                    ],
                },
            ];
        } else if (version == 1) { // charAt
            const start = Math.floor(Math.random() * (originalString.length));
            return [
                {
                    action: "print",
                    values: [
                        ParsedToken.fromRawTokenString(".charAt"),
                        ParsedToken.fromString(originalString),
                        ParsedToken.fromNumber(start),
                    ],
                },
            ];
        } else if (version == 2) { // length
            return [
                {
                    action: "print",
                    values: [
                        ParsedToken.fromRawTokenString(".length"),
                        ParsedToken.fromString(originalString),
                    ],
                },
            ];
        } else return [];
    })());
}

export function outputToJava(output: string[]): string {
    return output.join("\n");
}

export function codeToJava(code: LineOfCode[], depth = 0): string {
    let ans = "";
    let pref = "";
    for (let i = 0; i < depth; i++) pref += "  ";

    for (const line of code) {
        const vals = line.values;
        if (line.action === "for") {
            const s = `for (${vals[0].toJavaDefinitionString()} = ${
                vals[1].toJavaString()
            }; ${vals[2].toJavaString()} ${(vals[3].toJavaString())} ${
                vals[4].toJavaString()
            }; ${vals[5].toJavaString()} ${vals[6].toJavaString()}= ${
                vals[7].toJavaString()
            }) {`;
            ans += pref + s + "\n";
            if (line.nest_1) ans += codeToJava(line.nest_1, depth + 1);
            ans += pref + "}" + "\n";
        } else if (line.action === "loop") {
            const s = `while (${vals[0].toJavaString()} = ${
                vals[1].toJavaString()
            } ${vals[2].toJavaString()}) {`;
            ans += pref + s + "\n";
            if (line.nest_1) ans += codeToJava(line.nest_1, depth + 1);
            ans += pref + "}" + "\n";
        } else if (line.action === "print") {
            const parts = vals.map((pt) => pt.toJavaString());
            ans += pref + `System.out.println(${parts.join(" + ")});\n`;
        } else if (line.action === "set") {
            ans += pref +
                `${vals[0].toJavaDefinitionString()} = ${
                    vals[1].toJavaString()
                };\n`;
        } else if (line.action === "if") {
            ans += pref +
                `if (${vals[0].toJavaString()} ${vals[1].toJavaString()} ${
                    vals[2].toJavaString()
                })`;
            if (line.nest_1) {
                ans += " {\n" + codeToJava(line.nest_1, depth + 1);
                if (line.nest_2) {
                    ans += pref + "} else {\n" +
                        codeToJava(line.nest_2, depth + 1) + "\n" + pref +
                        "}\n";
                } else {
                    ans += pref + "}\n";
                }
            } else {
                ans += ";\n";
            }
        } else if (line.action === "opeq") {
            ans += pref +
                `${vals[0].toJavaString()} ${vals[1].toJavaString()}= ${
                    vals[2].toJavaString()
                };\n`;
        }
    }
    return ans;
}

export async function makeTest(timeStarted: Date, timeToEnd: Date | undefined, testGroup: Test): Promise<Quiz> {

    const preset: Preset | null = await Preset.findByPk(testGroup.presetId);
    if (!preset) throw new Error("That preset doesn't exist");
    const blob: PresetData = parsePresetData(preset.blob);
    logDebug("codegen", `Blob: ${preset.blob}`);

    const questions: QuizQuestion[] = [];

    // Create for loop questions
    for (let i = 0; i < blob.get(ConfigKey.FOR_LOOP_COUNT)!.getNumberValue(); i++) {
        let question: QuizQuestion;
        let attempts = 0;
        do {
            question = new QuizQuestion(
                generateForLoop("i", [$("print", "$*#i")]),
                "What will the console look like after this for loop runs?",
            );
            attempts++;
            if (attempts > 1) {
                logWarning("codegen", `Avoiding duplicate: ${question} already exists`);
            }
            if (attempts > 5) {
                logWarning("codegen", `Could not avoid duplicate: ${question}`);
                break;
            }
        } while (questions.some(q => q.equals(question)));
        questions.push(question);
    }

    // Create double loop question
    for (let i = 0; i < blob.get(ConfigKey.NESTED_FOR_LOOP_COUNT)!.getNumberValue(); i++) {
        let question: QuizQuestion;
        let attempts = 0;
        do {
            question = new QuizQuestion(
                generateDoubleForLoop(),
                "What will the console look like after this for loop runs?",
            );
            attempts++;
            if (attempts > 1) {
                logWarning("codegen", `Avoiding duplicate: ${question} already exists`);
            }
            if (attempts > 5) {
                logWarning("codegen", `Could not avoid duplicate: ${question}`);
                break;
            }
        } while (questions.some(q => q.equals(question)));
        questions.push(question);
    }

    // Create string question
    for (let i = 0; i < blob.get(ConfigKey.STRING_COUNT)!.getNumberValue(); i++) {
        let question: QuizQuestion;
        let attempts = 0;
        do {
            question = new QuizQuestion(
                generateStringQuestion(),
                "What will the output of this code be?",
            );
            attempts++;
            if (attempts > 1) {
                logWarning("codegen", `Avoiding duplicate: ${question} already exists`);
            }
            if (attempts > 5) {
                logWarning("codegen", `Could not avoid duplicate: ${question}`);
                break;
            }
        } while (questions.some(q => q.equals(question)));
        questions.push(question);
    }

    for (let i = 0; i < blob.get(ConfigKey.SUM_PROD_LOOP)!.getNumberValue(); i++) {
        let question: QuizQuestion;
        let attempts = 0;
        do {
            question = new QuizQuestion(
                generateSumProdQuestion("i"),
                "What will the value of sum be?",
            );
            attempts++;
            if (attempts > 1) {
                logWarning("codegen", `Avoiding duplicate: ${question} already exists`);
            }
            if (attempts > 5) {
                logWarning("codegen", `Could not avoid duplicate: ${question}`);
                break;
            }
        } while (questions.some(q => q.equals(question)));
        questions.push(question);
    }

    const quiz = new Quiz(questions, timeStarted, timeToEnd, testGroup);
    return quiz;
}
