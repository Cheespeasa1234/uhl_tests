import { expect } from "jsr:@std/expect";
import { $, CodeEnvironment, LineOfCode } from "../code.ts";
import { RawToken } from "../typing/token.ts";
import { ParsedToken } from "../typing/parsedToken.ts";

Deno.test("checks equality", () => {
  const environment: CodeEnvironment = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("set", "$*a #5"),
    $("set", "$*b #6"),
    $("if", "$$a EQ #5", [
      $("print", "'a=5"),
    ], [
      $("print", "'a!=5"),
    ]),
    $("if", "$$b EQ #5", [
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
    $("set", "$*a #5"),
    $("set", "$*b #6"),
    $("set", "$*c #7"),
    $("print", "$$a $$b $$c"),
  ];

  environment.execute(code);
  expect(environment.output).toEqual(["5", "6", "7"]);
  expect(environment.variables["a"]).toEqual(ParsedToken.fromNumber(5));
  expect(environment.variables["b"]).toEqual(ParsedToken.fromNumber(6));
  expect(environment.variables["c"]).toEqual(ParsedToken.fromNumber(7));
});

Deno.test("loops", () => {
  const env: CodeEnvironment = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("set", "$*i #0"),
    $("loop", "$*i LT #10", [
      $("print", "'a"),
      $("opeq", "$*i ADD #1"),
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
    $("for", "$*i #0 $*i LT #10 $*i ADD #1", [
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
    $("set", "$*_SYS_ENABLEOUT true"),
    $("for", "$*i #0 $*i LT #100 $*i ADD #1", [
      $("set", "$*out '"),
      $("set", "$*n $$i"),
      $("opeq", "$*n MOD #3"),
      $("if", "$$n EQ #0", [
        $("opeq", "$*out ADD 'Fizz")
      ]),

      $("set", "$*n $$i"),
      $("opeq", "$*n MOD #5"),
      $("if", "$$n EQ #0", [
        $("opeq", "$*out ADD 'Buzz")
      ]),

      $("if", "$$out NEQ '", [
        $("print", "'( $*i ')"),
      ], [
        $("print", "$*out '~s '( $*i ')"),
      ])
    ]),
  ];

  env.execute(code);
  expect(env.variables["out"].rawContent).toEqual("'");
});