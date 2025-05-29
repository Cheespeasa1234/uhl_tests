import { ParsedToken } from "../typing/parsedToken.ts";
import { RawToken, TokenType, VariableTokenType } from "../typing/token.ts";
import { operate as useOperator } from "../typing/operation.ts";
import { functions } from "../typing/func.ts";
import { logDebug, logError, logInfo, logWarning } from "../../lib/logger.ts";

/**
 * Represents a single action, a line of code
 */
export type LineOfCode = {
    action: string;
    values: ParsedToken[];
    nest_1?: LineOfCode[];
    nest_2?: LineOfCode[];
};

/**
 * The map of stored variables
 */
export type VariablesMap = { [id: string]: ParsedToken };

/**
 * Stores all the data of the code environment. Can run single actions.
 */
export class CodeEnvironment {
    /**
     * Anything outputted during the program execution
     */
    output: string[];

    /**
     * The state of the variables
     */
    variables: VariablesMap;

    /**
     * The line number, for error reporting purposes
     */
    line: number;

    /**
     * The line currently running, for error reporting purposes
     */
    lineExecuting?: LineOfCode;

    constructor() {
        this.output = [];
        this.variables = {};
        this.line = 0;
    }

    /**
     * Returns the result of a given operation on two operands
     * @param operand1 First operand
     * @param operand2 Second operand
     * @param operator Operator
     * @returns Result
     */
    operate(
        operand1: ParsedToken,
        operand2: ParsedToken,
        operator: ParsedToken,
    ): ParsedToken {
        // if (operand1.tokenType === TokenType.VARIABLE) {
        logDebug("code/operate", `${operand1.rawContent} ${operand2.rawContent}`);
            operand1 = this.getVariableValue(operand1);
        // }
        // if (operand2.tokenType === TokenType.VARIABLE) {
            operand2 = this.getVariableValue(operand2);
        // }
        return useOperator(operand1, operand2, operator);
    }
    

    /**
     * Return whether or there is a variable that has been defined with the given name
     * @param name Variable name
     * @returns Whether or not it exists
     */
    variableExistsByName(name: string): boolean {
        return this.variables[name] !== undefined;
    }

    /**
     * Returns the variable value with a given name in the variable map
     * @param name Variable name
     * @returns Variable value
     */
    getVariableValueByName(name: string): ParsedToken {
        return this.variables[name];
    }

    /**
     * Returns the value of a variable which a variable token has referenced.
     * If the token is not a variable, its value is returned. Otherwise, its
     * respective value is returned.
     * @param variableToken Variable token call
     * @returns Variable value
     */
    getVariableValue(variableToken: ParsedToken): ParsedToken {
        if (variableToken.tokenType === TokenType.VARIABLE) {
            const isIn = variableToken.parsedContent in this.variables;
            if (!isIn) throw Error(`Variable ${variableToken.rawContent} is undefined`);
            return this.variables[variableToken.parsedContent];
        }
        return variableToken;
    }

    /**
     * Sets the variable with a variable's name to a given value
     * @param variableReferenceToken Variable token vall
     * @param value New variable value
     */
    setVariableValue(variableReferenceToken: ParsedToken, value: ParsedToken) {
        this.variables[variableReferenceToken.parsedContent] = value;
    }

    /**
     * Adds the compiled values of each value token to the output list
     * @param values Values to print
     */
    print(values: ParsedToken[]) {
        const parsedValues = values.map((v) =>
            this.getVariableValue(v).parsedContent
        );
        const output = parsedValues.join("").replaceAll("~s", " ");
        if (
            this.variableExistsByName("_SYS_ENABLEOUT") &&
            this.getVariableValueByName("_SYS_ENABLEOUT").asBoolean()
        ) {
            logInfo("code/print", output);
        }
        this.output = this.output.concat(output);
    }

    /**
     * Sets a variable to a given value
     */
    set(values: ParsedToken[]) {
        const [variableReference, value, ..._] = [...values];
        this.setVariableValue(variableReference, value);
        variableReference.subtype = value.type;
        if (variableReference.rawContent.startsWith("$*?_SYS")) {
            logWarning("code", `SYSTEM VARIABLE ${variableReference.rawContent} SET TO ${value.toString()}`);
        }
    }

    /**
     * Sets the value of a variable to its value operated with another.
     * @param values A list of tokens containing the variable, the operator, and the operand
     */
    opeq(values: ParsedToken[]) {
        const [variableReference, operator, valueUnsafe, ..._] = [...values];
        const value = this.getVariableValue(valueUnsafe);
        variableReference.subtype = value.type;
        const res = this.operate(
            variableReference,
            value,
            operator,
        );
        this.setVariableValue(variableReference, res);
    }

    /**
     * Runs nested code representing an if statement, if the values as an expression return a truthy value
     * @param values The variable to check
     * @param nest_1 The comparator to run
     * @param nest_2 The value to check the variable against
     */
    if(values: ParsedToken[], nest_1?: LineOfCode[], nest_2?: LineOfCode[]) {
        const [variable, comparator, value, ..._] = [...values];
        const result = this.operate(variable, value, comparator);
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

    /**
     * Runs code repeatedly while an expression is true
     * @param values The for expression
     * @param nest The code to run each iteration
     */
    loop(values: ParsedToken[], nest?: LineOfCode[]) {
        const [
            value1Unsafe,
            operator,
            value2Unsafe,
            ..._
        ] = [...values];

        logInfo("code/loop", `Looping ${value1Unsafe.toString()} ${operator.toString()} ${value2Unsafe.toString()}`);

        // If it is true, run the code inside the loop
        let c = 0;
        while (true) {
            c++;
            // Check the condition
            const value1 = this.getVariableValue(value1Unsafe);
            const value2 = this.getVariableValue(value2Unsafe);
            const result: boolean = this.operate(value1, value2, operator)
                .asBooleanCoerce();

            if (result && nest) {
                this.execute(nest);
            } else {
                break;
            }

            // if (c == 20) break;
        }
    }

    /**
     * Runs code repeatedly following a for loop expression
     * @param values For loop expression
     * @param nest_1 Code to run in the loop
     */
    for(values: ParsedToken[], nest_1?: LineOfCode[]) {
        const [
            setRef,
            setVal,
            compVal1,
            compOp,
            compVal2,
            opeqRef,
            opeqOp,
            opeqVal,
            ..._
        ] = [...values];
        let loopInner: LineOfCode[] = [];
        const opeqInstruction = $(
            "opeq",
            `${opeqRef.rawContent} ${opeqOp.rawContent} ${opeqVal.rawContent}`,
        );
        if (nest_1) {
            loopInner = loopInner.concat(nest_1).concat([opeqInstruction]);
        } else {
            loopInner = [opeqInstruction];
        }
        const macroCode: LineOfCode[] = [
            $("set", `${setRef.rawContent} ${setVal.rawContent}`),
            { action: "loop", values: [compVal1, compOp, compVal2], nest_1: loopInner }
        ];
        this.execute(macroCode);
    }

    /**
     * Replaces variable expressions to their value at that state,
     * to more simply be executed, sort of like a JIT compilation
     * @param code Code to compile
     * @returns Compiled code
     */
    compile(code: LineOfCode[]): LineOfCode[] {
        const compiled: LineOfCode[] = [];
        for (const line of code) {
            logInfo("code/compile", `Compiling line ${this.line}`);
            const { values, nest_1, nest_2 } = line;
            this.line++;
            this.lineExecuting = line;

            const parsedTokens: ParsedToken[] = [];
            for (let i = 0; i < values.length; i++) {
                const token = values[i];
                if (
                    token.tokenType === TokenType.VARIABLE &&
                    token.type === VariableTokenType.VALUE
                ) {
                    parsedTokens.push(this.getVariableValue(token));
                } else if (token.tokenType === TokenType.FUNCTION) {
                    const func = functions[token.parsedContent];
                    const paramCount = func.header.args.length;
                    //consume that many
                    const feed = values.slice(i + 1, i + 1 + paramCount);
                    const res = func.run(feed);
                    res.func = func;
                    res.params = feed;
                    parsedTokens.push(res);
                    i += paramCount;
                } else {
                    parsedTokens.push(token);
                }
            }
            
            let nest_1_comp = nest_1;
            if (nest_1) nest_1_comp = this.compile(nest_1);
            let nest_2_comp = nest_2;
            if (nest_2) nest_2_comp = this.compile(nest_2);
            compiled.push({ action: line.action, values: parsedTokens, nest_1: nest_1_comp, nest_2: nest_2_comp });
        }
        return compiled;
    }

    /**
     * Executes the given code and modifies the state of the environment
     * @param code Code to run
     */
    execute(code: LineOfCode[]) {
        const compiledCode = this.compile(code);
        try {
            for (const line of compiledCode) {
                logInfo("code/execute", `Executing line ${this.line}`);
                const { values, nest_1, nest_2 } = line;
                this.line++;
                this.lineExecuting = line;

                if (line.action === "print") {
                    this.print(values);
                } else if (line.action === "set") {
                    this.set(values);
                } else if (line.action === "if") {
                    this.if(values, nest_1, nest_2);
                } else if (line.action === "loop") {
                    this.loop(values, nest_1);
                } else if (line.action === "opeq") {
                    logDebug("code/exec", JSON.stringify(this.variables));
                    this.opeq(values);
                } else if (line.action === "for") {
                    this.for(values, nest_1);
                }
            }
        } catch (e) {
            logError("code/execute", `Error executing line ${this.line}: ${JSON.stringify(this.lineExecuting).substring(0, 20)}...`);
            console.trace(e);
            throw e;
        }
    }

    clear() {
        this.output = [];
        this.variables = {};
    }
}

/**
 * Shorthand for creation of a line of code. Creates a line of code
 * with the given action, and the unparsed values split by string
 * @param action The action to run
 * @param valuesUnparsed The values to give to the action, split by string
 * @param nest_1 The nested code (loops, if true)
 * @param nest_2 The nesteed code (else)
 * @returns A line of code containing the action
 */
export function $(
    action: string,
    valuesUnparsed: string,
    nest_1?: LineOfCode[],
    nest_2?: LineOfCode[],
): LineOfCode {
    return {
        action,
        values: valuesUnparsed.split(" ").map((v) =>
            ParsedToken.fromRawToken(new RawToken(v))
        ),
        nest_1,
        nest_2,
    };
}
