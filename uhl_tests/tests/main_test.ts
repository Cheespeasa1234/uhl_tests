// import { expect } from "jsr:@std/expect";
// import { CodeEnvironment, LineOfCode } from "../code.ts";

// Deno.test("checks equality", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["a", "5"] },
//     { action: "set", values: ["b", "6"] },
//     {
//       action: "if",
//       values: ["a", "eq", "5"],
//       nest_1: [
//         { action: "print", values: ["a=5"] },
//       ],
//       nest_2: [
//         { action: "print", values: ["a!=5"] },
//       ],
//     },
//     {
//       action: "if",
//       values: ["b", "eq", "5"],
//       nest_1: [
//         { action: "print", values: ["b=5"] },
//       ],
//       nest_2: [
//         { action: "print", values: ["b!=5"] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["a=5", "b!=5"]);
// });

// Deno.test("checks gt", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["a", "5"] },
//     { action: "set", values: ["b", "6"] },
//     {
//       action: "if",
//       values: ["a", "gt", "2"],
//       nest_1: [
//         { action: "print", values: ["a>2"] },
//       ],
//       nest_2: [
//         { action: "print", values: ["!(a>2)"] },
//       ],
//     },
//     {
//       action: "if",
//       values: ["b", "gt", "10"],
//       nest_1: [
//         { action: "print", values: ["b>10"] },
//       ],
//       nest_2: [
//         { action: "print", values: ["!(b>10)"] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["a>2", "!(b>10)"]);
// });

// Deno.test("checks lt", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["a", "5"] },
//     { action: "set", values: ["b", "6"] },
//     {
//       action: "if",
//       values: ["a", "lt", "2"],
//       nest_1: [
//         { action: "print", values: ["a<2"] },
//       ],
//       nest_2: [
//         { action: "print", values: ["!(a<2)"] },
//       ],
//     },
//     {
//       action: "if",
//       values: ["b", "lt", "10"],
//       nest_1: [
//         { action: "print", values: ["b<10"] },
//       ],
//       nest_2: [
//         { action: "print", values: ["!(b<10)"] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["!(a<2)", "b<10"]);
// });

// Deno.test("prints 'Hello, World'", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "print", values: ["Hello, World"] },
//   ];
//   environment.execute(code);
//   expect(environment.output).toEqual(["Hello, World"]);
// });

// Deno.test("prints multiple lines", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "print", values: ["Hello, World"] },
//     { action: "print", values: ["Goodbye, World"] },
//   ];
//   environment.execute(code);
//   expect(environment.output).toEqual(["Hello, World", "Goodbye, World"]);
// });

// Deno.test("sets variables and prints them", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["name", "bobby"] },
//     { action: "printvar", values: ["name"] },
//   ];
//   environment.execute(code);
//   expect(environment.output).toEqual(["bobby"]);
//   expect(environment.variables["name"]).toEqual("bobby");
// });

// Deno.test("executes the correct branch of an if statement", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["name", "Nate"] },
//     { action: "set", values: ["age", "15"] },
//     {
//       action: "if",
//       values: ["name", "eq", "Nate"],
//       nest_1: [
//         { action: "print", values: ["Name is Nate."] },
//       ],
//       nest_2: [
//         { action: "print", values: ["Name is not Nate."] },
//       ],
//     },
//   ];
//   environment.execute(code);
//   expect(environment.output).toEqual(["Name is Nate."]);
//   expect(environment.variables["name"]).toEqual("Nate");
// });

// Deno.test("executes the else branch of an if statement", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["a", "1"] },
//     { action: "set", values: ["b", "15"] },
//     {
//       action: "if",
//       values: ["a", "eq", "2"],
//       nest_1: [
//         { action: "print", values: ["t"] },
//       ],
//       nest_2: [
//         { action: "print", values: ["f"] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["f"]);
//   expect(environment.variables["a"]).toEqual("1");
// });

// Deno.test("evaluates multiple conditions in a single if statement", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["temperature", "30"] },
//     { action: "set", values: ["humidity", "70"] },
//     {
//       action: "if",
//       values: ["temperature", "lt", "35"],
//       nest_1: [
//         {
//           action: "if",
//           values: ["humidity", "gt", "60"],
//           nest_1: [
//             { action: "print", values: ["Comfortable weather."] },
//           ],
//           nest_2: [
//             { action: "print", values: ["Dry weather."] },
//           ],
//         },
//       ],
//       nest_2: [
//         { action: "print", values: ["Too hot!"] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["Comfortable weather."]);
// });

// Deno.test("nested if statements with multiple conditions", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["score", "85"] },
//     { action: "set", values: ["attendance", "90"] },
//     {
//       action: "if",
//       values: ["score", "gt", "80"],
//       nest_1: [
//         {
//           action: "if",
//           values: ["attendance", "gt", "75"],
//           nest_1: [
//             {
//               action: "print",
//               values: ["Passed with good score and attendance."],
//             },
//           ],
//           nest_2: [
//             { action: "print", values: ["Passed but attendance is low."] },
//           ],
//         },
//       ],
//       nest_2: [
//         { action: "print", values: ["Failed."] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual([
//     "Passed with good score and attendance.",
//   ]);
// });

// Deno.test("handles nested if statements", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["a", "1"] },
//     { action: "set", values: ["b", "17"] },
//     {
//       action: "if",
//       values: ["a", "eq", "2"],
//       nest_1: [
//         { action: "print", values: ["t1"] },
//       ],
//       nest_2: [
//         { action: "print", values: ["f1"] },
//         {
//           action: "if",
//           values: ["b", "gte", "14"],
//           nest_1: [
//             { action: "print", values: ["t2"] },
//           ],
//           nest_2: [
//             { action: "print", values: ["f2"] },
//           ],
//         },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["f1", "t2"]);
//   expect(environment.variables["a"]).toEqual("1");
//   expect(environment.variables["b"]).toEqual("17");
// });

// Deno.test("handles multiple prints", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "print", values: ["First line."] },
//     { action: "print", values: ["Second line."] },
//     { action: "print", values: ["Third line."] },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual([
//     "First line.",
//     "Second line.",
//     "Third line.",
//   ]);
// });

// Deno.test("sets variables inside if statements", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["name", "Nate"] },
//     {
//       action: "if",
//       values: ["name", "eq", "Nate"],
//       nest_1: [
//         { action: "set", values: ["status", "student"] },
//         { action: "print", values: ["Status set to student."] },
//       ],
//       nest_2: [
//         { action: "set", values: ["status", "not a student"] },
//         { action: "print", values: ["Status set to not a student."] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["Status set to student."]);
//   expect(environment.variables["status"]).toEqual("student");
// });

// Deno.test("evaluates 'eq' (equal)", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["value", "9"] },
//     {
//       action: "if",
//       values: ["value", "eq", "9"],
//       nest_1: [
//         { action: "print", values: ["Equal to 9."] },
//       ],
//       nest_2: [
//         { action: "print", values: ["Not equal to 9."] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["Equal to 9."]);
// });

// Deno.test("evaluates 'gt' (greater than)", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["value", "15"] },
//     {
//       action: "if",
//       values: ["value", "gt", "10"],
//       nest_1: [
//         { action: "print", values: ["Greater than 10."] },
//       ],
//       nest_2: [
//         { action: "print", values: ["Not greater than 10."] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["Greater than 10."]);
// });

// Deno.test("evaluates 'lt' (less than)", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["value", "5"] },
//     {
//       action: "if",
//       values: ["value", "lt", "10"],
//       nest_1: [
//         { action: "print", values: ["Less than 10."] },
//       ],
//       nest_2: [
//         { action: "print", values: ["Not less than 10."] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["Less than 10."]);
// });

// Deno.test("evaluates 'gte' (greater than or equal to)", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["value", "10"] },
//     {
//       action: "if",
//       values: ["value", "gte", "10"],
//       nest_1: [
//         { action: "print", values: ["Greater than or equal to 10."] },
//       ],
//       nest_2: [
//         { action: "print", values: ["Less than 10."] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["Greater than or equal to 10."]);
// });

// Deno.test("evaluates 'lte' (less than or equal to)", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["value", "10"] },
//     {
//       action: "if",
//       values: ["value", "lte", "10"],
//       nest_1: [
//         { action: "print", values: ["Less than or equal to 10."] },
//       ],
//       nest_2: [
//         { action: "print", values: ["Greater than 10."] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["Less than or equal to 10."]);
// });

// Deno.test("runs a for loop", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     {
//       action: "for",
//       values: ["i", "0", "i", "lt", "3", "1"],
//       nest_1: [
//         { action: "print", values: ["a"] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual([
//     "a",
//     "a",
//     "a",
//   ]);
// });

// Deno.test("recursively nests for loops and if statements", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     {
//       action: "for",
//       values: ["i", "0", "i", "lt", "4", "1"],
//       nest_1: [
//         { action: "print", values: ["a"] },
//         {
//           action: "if",
//           values: ["i", "lt", "2"],
//           nest_1: [
//             { action: "print", values: ["b"] },
//           ],
//           nest_2: [
//             { action: "print", values: ["c"] },
//           ],
//         },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["a", "b", "a", "b", "a", "c", "a", "c"]);
// });

// Deno.test("evaluates 'neq' (not equal)", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["value", "8"] },
//     {
//       action: "if",
//       values: ["value", "neq", "9"],
//       nest_1: [
//         { action: "print", values: ["Not equal to 9."] },
//       ],
//       nest_2: [
//         { action: "print", values: ["Equal to 9."] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["Not equal to 9."]);
// });

// Deno.test("evaluates 'lte' (less than or equal to) with equal value", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["value", "10"] },
//     {
//       action: "if",
//       values: ["value", "lte", "10"],
//       nest_1: [
//         { action: "print", values: ["Less than or equal to 10."] },
//       ],
//       nest_2: [
//         { action: "print", values: ["Greater than 10."] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["Less than or equal to 10."]);
// });

// Deno.test("handles multiple nested if statements", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["x", "5"] },
//     { action: "set", values: ["y", "10"] },
//     {
//       action: "if",
//       values: ["x", "lt", "10"],
//       nest_1: [
//         {
//           action: "if",
//           values: ["y", "gt", "5"],
//           nest_1: [
//             {
//               action: "print",
//               values: ["x is less than 10 and y is greater than 5."],
//             },
//           ],
//           nest_2: [
//             {
//               action: "print",
//               values: ["x is less than 10 but y is not greater than 5."],
//             },
//           ],
//         },
//       ],
//       nest_2: [
//         { action: "print", values: ["x is not less than 10."] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual([
//     "x is less than 10 and y is greater than 5.",
//   ]);
// });

// Deno.test("executes a for loop with conditionals", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     {
//       action: "for",
//       values: ["i", "0", "i", "lt", "3", "1"],
//       nest_1: [
//         {
//           action: "if",
//           values: ["i", "eq", "1"],
//           nest_1: [
//             { action: "print", values: ["i is 1."] },
//           ],
//           nest_2: [
//             { action: "print", values: ["i is not 1."] },
//           ],
//         },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual([
//     "i is not 1.",
//     "i is 1.",
//     "i is not 1.",
//   ]);
// });

// Deno.test("sets and prints multiple variables", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["firstName", "Alice"] },
//     { action: "set", values: ["lastName", "Smith"] },
//     { action: "printvar", values: ["firstName"] },
//     { action: "printvar", values: ["lastName"] },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["Alice", "Smith"]);
// });

// Deno.test("evaluates 'gte' (greater than or equal to) with different values", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     { action: "set", values: ["value", "12"] },
//     {
//       action: "if",
//       values: ["value", "gte", "15"],
//       nest_1: [
//         { action: "print", values: ["Greater than or equal to 15."] },
//       ],
//       nest_2: [
//         { action: "print", values: ["Less than 15."] },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual(["Less than 15."]);
// });

// Deno.test("handles multiple conditions in a for loop", () => {
//   const environment: CodeEnvironment = new CodeEnvironment();
//   const code: LineOfCode[] = [
//     {
//       action: "for",
//       values: ["i", "0", "i", "lt", "5", "1"],
//       nest_1: [
//         {
//           action: "if",
//           values: ["i", "eq", "3"],
//           nest_1: [
//             { action: "print", values: ["Found 3!"] },
//           ],
//           nest_2: [
//             { action: "print", values: ["Not 3."] },
//           ],
//         },
//       ],
//     },
//   ];

//   environment.execute(code);
//   expect(environment.output).toEqual([
//     "Not 3.",
//     "Not 3.",
//     "Not 3.",
//     "Found 3!",
//     "Not 3.",
//   ]);
// });