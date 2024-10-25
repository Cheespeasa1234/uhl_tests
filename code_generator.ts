import { CodeEnvironment, type LineOfCode } from "./code.ts";
import { expect } from "jsr:@std/expect/expect";

type Question = {
    variables: { [id: string]: string },
    code: LineOfCode[],
    answer: string[]
}

const question1: Question = {
    variables: {name: "Bobby", age: "17"},
    code: [
        { action: "if", values: ["name", "eq", "Nate"], nest_1: [
            { action: "print", values: ["Is Nate"] },
        ], nest_2: [
            { action: "print", values: ["Is Not Nate"] },
        ] }, { action: "if", values: ["age", "lt", "18"], nest_1: [
            { action: "print", values: ["Is Underage"] },
        ], nest_2: [
            { action: "print", values: ["Is Not Underage"] },
        ]}
    ],
    answer: ["Is Not Nate", "Is Underage"]
}

function checkQuestion(question: Question) {
    const env: CodeEnvironment = new CodeEnvironment();
    env.variables = question.variables;
    env.execute(question.code);

    try {
        expect(env.output).toEqual(question.answer);
        console.log("Passed!");
    } catch (e) {
        console.log("Failed.");
        console.log(e);
    }
}

checkQuestion(question1);