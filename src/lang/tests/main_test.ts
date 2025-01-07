import { expect } from "jsr:@std/expect";
import { $, CodeEnvironment, LineOfCode } from "../quiz/code.ts";
import { ParsedToken } from "../typing/parsedToken.ts";

Deno.test("victor loop", () => {
  const environment: CodeEnvironment = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("for", "$*#i #12 $*#i GTE #0 $*#i SUB #2", [
      $("print", "$*#i"),
    ]),
  ];

  environment.execute(code);
  expect(environment.output).toEqual([
    "12", "10", "8",
    "6",  "4",  "2",
    "0"
  ]);
});

Deno.test("checks equality", () => {
  const environment: CodeEnvironment = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("set", "$*#a #5"),
    $("set", "$*#b #6"),
    {
      action: "if",
      values: [
        ParsedToken.fromRawTokenString("$$#a"),
        ParsedToken.fromRawTokenString("EQ"),
        ParsedToken.fromNumber(5),
      ],
      nest_1: [
        {
          action: "print",
          values: [
            ParsedToken.fromString("a=5"),
          ],
        },
      ],
      nest_2: [
        {
          action: "print",
          values: [
            ParsedToken.fromString("a!=5"),
          ],
        },
      ],
    },
    {
      action: "if",
      values: [
        ParsedToken.fromRawTokenString("$$#b"),
        ParsedToken.fromRawTokenString("EQ"),
        ParsedToken.fromNumber(5),
      ],
      nest_1: [
        {
          action: "print",
          values: [
            ParsedToken.fromString("b=5"),
          ],
        },
      ],
      nest_2: [
        {
          action: "print",
          values: [
            ParsedToken.fromString("b!=5"),
          ],
        },
      ],
    },
  ];

  environment.execute(code);
  expect(environment.output).toEqual(["a=5", "b!=5"]);
});

Deno.test("checks GT comparator", (t) => {
  const env = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("set", "$*#a #5"),
    {
      action: "if",
      values: [
        ParsedToken.fromRawTokenString("$$#a"),
        ParsedToken.fromRawTokenString("GT"),
        ParsedToken.fromNumber(10),
      ],
      nest_1: [
        {
          action: "print",
          values: [
            ParsedToken.fromString("a>10"),
          ],
        },
      ],
      nest_2: [
        {
          action: "print",
          values: [
            ParsedToken.fromString("!(a>10)"),
          ],
        },
      ],
    },
    {
      action: "if",
      values: [
        ParsedToken.fromRawTokenString("$$#a"),
        ParsedToken.fromRawTokenString("GT"),
        ParsedToken.fromNumber(2),
      ],
      nest_1: [
        {
          action: "print",
          values: [
            ParsedToken.fromString("a>2"),
          ],
        },
      ],
      nest_2: [
        {
          action: "print",
          values: [
            ParsedToken.fromString("!(a>2)"),
          ],
        },
      ],
    },
  ];
  env.execute(code);
  expect(env.output).toEqual(["!(a>10)", "a>2"]);
});

Deno.test("checks LT comparator", (t) => {
  const env = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("set", "$*#a #5"),
    {
      action: "if",
      values: [
        ParsedToken.fromRawTokenString("$$#a"),
        ParsedToken.fromRawTokenString("LT"),
        ParsedToken.fromNumber(10),
      ],
      nest_1: [
        {
          action: "print",
          values: [
            ParsedToken.fromString("a<10"),
          ],
        },
      ],
      nest_2: [
        {
          action: "print",
          values: [
            ParsedToken.fromString("!(a<10)"),
          ],
        },
      ],
    },
    {
      action: "if",
      values: [
        ParsedToken.fromRawTokenString("$$#a"),
        ParsedToken.fromRawTokenString("LT"),
        ParsedToken.fromNumber(2),
      ],
      nest_1: [
        {
          action: "print",
          values: [
            ParsedToken.fromString("a<2"),
          ],
        },
      ],
      nest_2: [
        {
          action: "print",
          values: [
            ParsedToken.fromString("!(a<2)"),
          ],
        },
      ],
    },
  ];
  env.execute(code);
  expect(env.output).toEqual(["a<10", "!(a<2)"]);
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
  expect(environment.getVariableValueByName("a")).toEqual(
    ParsedToken.fromNumber(5),
  );
  expect(environment.getVariableValueByName("b")).toEqual(
    ParsedToken.fromNumber(6),
  );
  expect(environment.getVariableValueByName("c")).toEqual(
    ParsedToken.fromNumber(7),
  );
});

Deno.test("loop action", () => {
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

Deno.test("for action", () => {
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
    $("for", "$*#i #0 $*#i LT #30 $*#i ADD #1", [
      $("print", "$$#i"),
      $("set", "$*'out '"),
      $("set", "$*#n $$#i"),
      $("opeq", "$*#n MOD #3"),
      $("if", "$*#n EQ #0", [
        $("opeq", "$*'out ADD 'Fizz"),
      ]),

      $("set", "$*#n $$#i"),
      $("opeq", "$*#n MOD #5"),
      $("if", "$*#n EQ #0", [
        $("opeq", "$*'out ADD 'Buzz"),
      ]),

      $("if", "$*'out NEQ '", [
        $("print", "'( $*#i ')"),
      ], [
        $("print", "$*'out '~s '( $*#i ')"),
      ]),
    ]),
  ];

  env.execute(code);
  expect(env.output).toEqual([
    "0",  "FizzBuzz (0)", "1",  "(1)",
    "2",  "(2)",          "3",  "Fizz (3)",
    "4",  "(4)",          "5",  "Buzz (5)",
    "6",  "Fizz (6)",     "7",  "(7)",
    "8",  "(8)",          "9",  "Fizz (9)",
    "10", "Buzz (10)",    "11", "(11)",
    "12", "Fizz (12)",    "13", "(13)",
    "14", "(14)",         "15", "FizzBuzz (15)",
    "16", "(16)",         "17", "(17)",
    "18", "Fizz (18)",    "19", "(19)",
    "20", "Buzz (20)",    "21", "Fizz (21)",
    "22", "(22)",         "23", "(23)",
    "24", "Fizz (24)",    "25", "Buzz (25)",
    "26", "(26)",         "27", "Fizz (27)",
    "28", "(28)",         "29", "(29)"
  ])
});

Deno.test("operators", async (t) => {
  await t.step("+", () => {
    const env: CodeEnvironment = new CodeEnvironment();
    const code: LineOfCode[] = [
      $("set", "$*#i #1"),
      $("opeq", "$*#i ADD #2"),
      $("print", "$*#i"),
      $("set", "$*'s 'Hello"),
      $("opeq", "$*'s ADD '~sWorld"),
      $("print", "$*'s"),
    ];

    env.execute(code);
    expect(env.output).toEqual([
      "3",
      "Hello World",
    ]);
  });

  await t.step("-", () => {
    const env: CodeEnvironment = new CodeEnvironment();
    const code: LineOfCode[] = [
      $("set", "$*#i #5"),
      $("opeq", "$*#i SUB #2"),
      $("print", "$*#i"),
      $("set", "$*#i #12"),
      $("opeq", "$*#i SUB #1"),
      $("print", "$*#i"),
    ];

    env.execute(code);
    expect(env.output).toEqual([
      "3",
      "11",
    ]);
  });

  await t.step("*", () => {
    const env: CodeEnvironment = new CodeEnvironment();
    const code: LineOfCode[] = [
      $("set", "$*#i #5"),
      $("opeq", "$*#i MUL #2"),
      $("print", "$*#i"),
      $("set", "$*#i #12"),
      $("opeq", "$*#i MUL #6"),
      $("print", "$*#i"),
    ];

    env.execute(code);
    expect(env.output).toEqual([
      "10",
      "72",
    ]);
  });

  await t.step("/", () => {
    const env: CodeEnvironment = new CodeEnvironment();
    const code: LineOfCode[] = [
      $("set", "$*#i #18"),
      $("opeq", "$*#i DIV #6"),
      $("print", "$*#i"),
      $("set", "$*#i #12"),
      $("opeq", "$*#i DIV #6"),
      $("print", "$*#i"),
    ];

    env.execute(code);
    expect(env.output).toEqual([
      "3",
      "2",
    ]);
  });

  await t.step("%", () => {
    const env: CodeEnvironment = new CodeEnvironment();
    const code: LineOfCode[] = [
      $("set", "$*#i #5"),
      $("opeq", "$*#i MOD #2"),
      $("print", "$*#i"),
      $("set", "$*#i #12"),
      $("opeq", "$*#i MOD #10"),
      $("print", "$*#i"),
    ];

    env.execute(code);
    expect(env.output).toEqual([
      "1",
      "2",
    ]);
  });
});

Deno.test("nested loop", () => {
  const env = new CodeEnvironment();
  const code: LineOfCode[] = [
    $("for", "$*#x #0 $*#x LT #24 $*#x ADD #3", [
      $("for", "$*#y #6 $*#y GT #0 $*#y SUB #1", [
        $("print", "'x~s $*#x '~sy~s $*#y"),
      ]),
    ]),
  ];
  env.execute(code);
  expect(env.output).toEqual([
    "x 0 y 6",
    "x 0 y 5",
    "x 0 y 4",
    "x 0 y 3",
    "x 0 y 2",
    "x 0 y 1",
    "x 3 y 6",
    "x 3 y 5",
    "x 3 y 4",
    "x 3 y 3",
    "x 3 y 2",
    "x 3 y 1",
    "x 6 y 6",
    "x 6 y 5",
    "x 6 y 4",
    "x 6 y 3",
    "x 6 y 2",
    "x 6 y 1",
    "x 9 y 6",
    "x 9 y 5",
    "x 9 y 4",
    "x 9 y 3",
    "x 9 y 2",
    "x 9 y 1",
    "x 12 y 6",
    "x 12 y 5",
    "x 12 y 4",
    "x 12 y 3",
    "x 12 y 2",
    "x 12 y 1",
    "x 15 y 6",
    "x 15 y 5",
    "x 15 y 4",
    "x 15 y 3",
    "x 15 y 2",
    "x 15 y 1",
    "x 18 y 6",
    "x 18 y 5",
    "x 18 y 4",
    "x 18 y 3",
    "x 18 y 2",
    "x 18 y 1",
    "x 21 y 6",
    "x 21 y 5",
    "x 21 y 4",
    "x 21 y 3",
    "x 21 y 2",
    "x 21 y 1",
  ]);
});

Deno.test("functions", () => {
  const env = new CodeEnvironment();
  const code: LineOfCode[] = [
      { action: "print", values: [
          ParsedToken.fromRawTokenString(".charAt"),
          ParsedToken.fromString("java"),
          ParsedToken.fromNumber(2),
      ] },
      { action: "print", values: [
          ParsedToken.fromRawTokenString(".substring"),
          ParsedToken.fromString("javaiscool"),
          ParsedToken.fromNumber(1),
          ParsedToken.fromNumber(6),
      ] },
      { action: "print", values: [
          ParsedToken.fromRawTokenString(".length"),
          ParsedToken.fromString("javaiscool"),
      ] },
      { action: "print", values: [
          ParsedToken.fromRawTokenString(".indexOf"),
          ParsedToken.fromString("javaiscool"),
          ParsedToken.fromString("is"),
      ] },
  ];

  env.execute(code);
  expect(env.output).toEqual(["v", "avais", "10", "4"]);
});