import { expect } from "jsr:@std/expect";
import { $, CodeEnvironment, LineOfCode } from "../quiz/code.ts";
import { ParsedToken } from "../typing/parsedToken.ts";

Deno.test("victor loop", () => {
  const environment: CodeEnvironment = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("for", "$*#i #12 $*#i GTE #0 $*#i SUB #2", [
      $("print", "$*#i")
    ])
  ];

  environment.execute(code);
  console.log(environment.output);
});

Deno.test("checks equality", () => {
  const environment: CodeEnvironment = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("set", "$*#a #5"),
    $("set", "$*#b #6"),
    $("if", "$$#a EQ #5", [
      $("print", "'a=5"),
    ], [
      $("print", "'a!=5"),
    ]),
    $("if", "$$#b EQ #5", [
      $("print", "'b=5"),
    ], [
      $("print", "'b!=5"),
    ]),
  ];

  environment.execute(code);
  expect(environment.output).toEqual(["a=5", "b!=5"]);
});

Deno.test("checks variable values", () => {
  const environment: CodeEnvironment = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("set", "$*#a #5"),
    $("set", "$*#b #6"),
    $("set", "$*#c #7"),
    $("print", "$$#a '~s $$#b '~s $$#c"),
  ];
  
  environment.execute(code);
  expect(environment.output).toEqual(["5 6 7"]);
  expect(environment.getVariableValueByName("a")).toEqual(ParsedToken.fromNumber(5));
  expect(environment.getVariableValueByName("b")).toEqual(ParsedToken.fromNumber(6));
  expect(environment.getVariableValueByName("c")).toEqual(ParsedToken.fromNumber(7));
});

Deno.test("loops", () => {
  const env: CodeEnvironment = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("set", "$*#i #0"),
    $("loop", "$*#i LT #10", [
      $("print", "'a"),
      $("opeq", "$*#i ADD #1"),
    ]),
  ];
  
  env.execute(code);
  expect(env.output).toEqual([
    "a",
    "a",
    "a",
    "a",
    "a",
    "a",
    "a",
    "a",
    "a",
    "a",
  ]);
});

Deno.test("loops", () => {
  const env: CodeEnvironment = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("for", "$*#i #0 $*#i LT #10 $*#i ADD #1", [
      $("print", "'a"),
    ]),
  ];
  
  env.execute(code);
  expect(env.output).toEqual([
    "a",
    "a",
    "a",
    "a",
    "a",
    "a",
    "a",
    "a",
    "a",
    "a",
  ]);
});

Deno.test("fizzbuzz", () => {
  const env: CodeEnvironment = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("for", "$*#i #0 $*#i LT #100 $*#i ADD #1", [
      $("set", "$*'out '"),
      $("set", "$*#n $$#i"),
      $("opeq", "$*#n MOD #3"),
      $("if", "$$#n EQ #0", [
        $("opeq", "$*'out ADD 'Fizz")
      ]),
      
      $("set", "$*#n $$#i"),
      $("opeq", "$*#n MOD #5"),
      $("if", "$$#n EQ #0", [
        $("opeq", "$*'out ADD 'Buzz")
      ]),
      
      $("if", "$$'out NEQ '", [
        $("print", "'( $$#i ')"),
      ], [
        $("print", "$$'out '~s '( $$#i ')"),
      ])
    ]),
  ];
  
  env.execute(code);
  expect(env.output.join("\n")).toEqual(`FizzBuzz (0)
(1)
(2)
Fizz (3)
(4)
Buzz (5)
Fizz (6)
(7)
(8)
Fizz (9)
Buzz (10)
(11)
Fizz (12)
(13)
(14)
FizzBuzz (15)
(16)
(17)
Fizz (18)
(19)`);
});