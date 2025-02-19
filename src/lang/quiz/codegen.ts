import { $, CodeEnvironment, type LineOfCode } from "./code.ts";
import { ParsedToken } from "../typing/parsedToken.ts";
import { Quiz, QuizQuestion } from "./quiz.ts";

export function generateForLoop(
    varname: string,
    nest: LineOfCode[],
    smaller = false,
): LineOfCode[] {
    // Create the top of the for loop
    const direction = Math.random() > 0.5;
    const length = Math.round(Math.random() * (smaller ? 3 : 5) + 3);
    const increment = Math.ceil(Math.random() * (smaller ? 2 : 3) + 0);
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
        if (version == 0) {
            const start = Math.floor(
                Math.random() * (originalString.length / 2),
            );
            const end = start +
                Math.floor(Math.random() * (originalString.length / 2));
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
        } else if (version == 1) {
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
        } else if (version == 2) {
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
                `${vals[0].toJavaString()}${vals[1].toJavaString()}=${
                    vals[2].toJavaString()
                };\n`;
        }
    }
    return ans;
}

export function makeTest(timeStarted: Date, timeToEnd: Date | null, testLoopCount: number, testDoubleLoopCount: number, testStringCount: number): Quiz {
    const questions: QuizQuestion[] = [];

    // Create for loop questions
    for (let i = 0; i < testLoopCount; i++) {
        questions.push(
            new QuizQuestion(
                generateForLoop("i", [$("print", "$*#i")]),
                "What will the console look like after this for loop runs? (loops)",
            ),
        );
    }

    // Create double loop question
    for (let i = 0; i < testDoubleLoopCount; i++) {
        questions.push(
            new QuizQuestion(
                generateDoubleForLoop(),
                "What will the console look like after this for loop runs? (loops^2)",
            ),
        );
    }

    // Create string question
    for (let i = 0; i < testStringCount; i++) {
        questions.push(new QuizQuestion(
            generateStringQuestion(),
            "What will the output of this code be? (strings)"
        ));
    }

    const quiz = new Quiz(questions, timeStarted, timeToEnd);
    return quiz;
}
