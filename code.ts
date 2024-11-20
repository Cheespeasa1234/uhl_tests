import { ParsedToken } from "./typing/parsedToken.ts";
import { OperatorTokenType, RawToken, TokenType, VariableTokenType } from "./typing/token.ts";
import { operate as useOperator } from "./typing/operation.ts";

export type LineOfCode = {
  action: string;
  values: RawToken[];
  nest_1?: LineOfCode[];
  nest_2?: LineOfCode[];
};

export type VariablesMap = { [id: string]: ParsedToken };

export function operate(operand1: ParsedToken, operand2: ParsedToken, operator: ParsedToken): ParsedToken {
  return useOperator(operand1, operand2, operator);
}

/**
 * Stores all the data of the code environment. Can run single actions.
 */
export class CodeEnvironment {

  output: string[];
  variables: VariablesMap;
  line: number;
  lineExecuting?: LineOfCode;

  constructor () {
    this.output = [];
    this.variables = {};
    this.line = 0;
  }

  variableExistsByName(name: string): boolean {
    return this.variables[name] !== undefined;
  }

  getVariableValueByName(name: string): ParsedToken {
    return this.variables[name];
  }

  getVariableValue(variableToken: ParsedToken): ParsedToken {
    if (variableToken.tokenType === TokenType.VARIABLE && variableToken.parsedContent in this.variables) {
      return this.variables[variableToken.parsedContent];
    }
    return variableToken;
  }

  setVariableValue(variableReferenceToken: ParsedToken, value: ParsedToken) {
    this.variables[variableReferenceToken.parsedContent] = value;
  }

  print(values: ParsedToken[]) {
    const parsedValues = values.map(v => this.getVariableValue(v).parsedContent);
    if (this.variableExistsByName("_SYS_ENABLEOUT") && this.getVariableValueByName("_SYS_ENABLEOUT").asBoolean()) {
      console.log(parsedValues.join("").replaceAll("~s", " "));
    }
    this.output = this.output.concat(parsedValues);
  }

  set(values: ParsedToken[]) {
    const [variableReference, value, ..._] = [...values];
    this.setVariableValue(variableReference, value);
    if (variableReference.rawContent.startsWith("$*_SYS")) {
      console.log(`WARNING: SYSTEM VARIABLE ${variableReference.rawContent} SET TO ${value.toString()}`);
    }
  }

  opeq(values: ParsedToken[]) {
    const [variableReference, operator, valueUnsafe, ..._] = [...values];
    const value = this.getVariableValue(valueUnsafe);
    const res = operate(this.getVariableValue(variableReference), value, operator);
    this.setVariableValue(variableReference, res);
  }

  if(values: ParsedToken[], nest_1?: LineOfCode[], nest_2?: LineOfCode[]) {
    const [variable, comparator, value, ..._] = [...values];
    const result = operate(variable, value, comparator);
    if (result.asBooleanCoerce()) {
      if (nest_1) {
        this.execute(nest_1);
      }
    } else {
      if (nest_2) {
        this.execute(nest_2);
      }
    }

  }

  loop(values: ParsedToken[], nest?: LineOfCode[]) {
    const [
      value1Unsafe,
      operator,
      value2Unsafe,
    ..._] = [...values];

    // console.log({
    //   term1VariableReference: term1VariableReference.toString(),
    //   term1InitialValueUnsafe: term1InitialValueUnsafe.toString(),
    //   term2Value1Unsafe: term2Value1Unsafe.toString(),
    //   term2Operator: term2Operator.toString(),
    //   term2Value2Unsafe: term2Value2Unsafe.toString(),
    //   term3VariableReference: term3VariableReference.toString(),
    //   term3Operator: term3Operator.toString(),
    //   term3Value1Unsafe: term3Value1Unsafe.toString()
    // });

    
    
    // If it is true, run the code inside the loop
    let c = 0;
    while (true) {
      c++;
      // Check the condition
      const value1 = this.getVariableValue(value1Unsafe);
      const value2 = this.getVariableValue(value2Unsafe);
      const result: boolean = operate(value1, value2, operator).asBooleanCoerce();

      if (result && nest) {
        this.execute(nest);
      } else {
        break;
      }
      
      if (c == 20) break;
    }
  }

  for(values: ParsedToken[], nest_1?: LineOfCode[]) {
    const [ setRef, setVal, compVal1, compOp, compVal2, opeqRef, opeqOp, opeqVal, ..._ ] = [...values];
    let loopInner: LineOfCode[] = [];
    const opeqInstruction = $("opeq", `${opeqRef.rawContent} ${opeqOp.rawContent} ${opeqVal.rawContent}`);
    if (nest_1) {
      loopInner = loopInner.concat(nest_1).concat([opeqInstruction]);
    } else {
      loopInner = [opeqInstruction];
    }
    const macroCode: LineOfCode[] = [
      $("set", `${setRef.rawContent} ${setVal.rawContent}`),
      $("loop", `${this.getVariableValue(compVal1).rawContent} ${compOp.rawContent} ${this.getVariableValue(compVal2).rawContent}`, 
        [...loopInner]
      ),
    ]
    this.execute(macroCode);
  }
  
  execute(code: LineOfCode[]) {
    try {
      for (const line of code) {
        // console.log(line);
        const { values, nest_1, nest_2 } = line;
        this.line++;
        this.lineExecuting = line;
  
        const parsedTokens = values.map((rawValue: RawToken) => {
          return ParsedToken.fromRawToken(rawValue);
        }).map(token => {
          if (token.tokenType === TokenType.VARIABLE && token.type === VariableTokenType.VALUE)
            return this.getVariableValue(token);
          return token;
        });
  
        if (line.action === "print") {
          this.print(parsedTokens);
        } else if (line.action === "set") {
          this.set(parsedTokens);
        } else if (line.action === "if") {
          this.if(parsedTokens, nest_1, nest_2);
        } else if (line.action === "loop") {
          this.loop(parsedTokens, nest_1);
        } else if (line.action === "opeq") {
          this.opeq(parsedTokens);
        } else if (line.action === "for") {
          this.for(parsedTokens, nest_1);
        }
      }
    } catch (e) {
      console.error(`Error executing line ${this.line}: ${JSON.stringify(this.lineExecuting)}`);
      throw e;
    }
  }
  
  clear() {
    this.output = [];
    this.variables = {};
  }
}

export function stringify(line: LineOfCode, nestLevel: number = 0): string {
  const tabs = "  ".repeat(nestLevel);
  const tabsPlusOne = "  ".repeat(nestLevel + 1);
  if (!line.nest_1) {
    return `${tabs}${line.action} ${line.values}`;
  } else {
    let out = `${tabs}${line.action}(${line.values}):\n`;
    for (const subLine of line.nest_1) {
      out += tabsPlusOne + stringify(subLine, nestLevel + 1) + "\n";
    }
    
    if (line.nest_2) {
      out += `${tabsPlusOne}else\n`;
      for (const subLine of line.nest_2) {
        out += tabsPlusOne + stringify(subLine, nestLevel + 1) + "\n";
      }  
    }

    return out;
  }
}

export function $(action: string, valuesUnparsed: string, nest_1?: LineOfCode[], nest_2?: LineOfCode[]): LineOfCode {
  return { action, values: valuesUnparsed.split(" ").map(v => new RawToken(v)), nest_1, nest_2};
}