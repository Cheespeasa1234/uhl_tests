import { ParsedToken } from "./parsedToken.ts";
import { ValueTokenType } from "./token.ts";

type Runner = (tokens: ParsedToken[]) => ParsedToken;
type FunctionHeader = {
    name: string,
    args: ValueTokenType[],
    returns: ValueTokenType,
    static: boolean,
    property: boolean,
}

export class Function {
    header: FunctionHeader
    runner: Runner;

    constructor(header: FunctionHeader, runner: Runner) {
        this.header = header;
        this.runner = runner;
    }

    run(tokens: ParsedToken[]): ParsedToken {
        if (tokens.length !== this.header.args.length) {
            throw new Error(`Token count ${tokens.length} can not be run in a function with ${this.header.args.length} parameters`);
        }
        return this.runner(tokens);
    }
}

export const functions: Record<string, Function> = {
    "charAt": new Function(
        {
            name: "charAt", 
            args: [ ValueTokenType.STRING, ValueTokenType.NUMBER ], 
            returns: ValueTokenType.STRING,
            static: false,
            property: false,
        },
        (tokens) => {
            return ParsedToken.fromString(tokens[0].parsedContent.charAt(Number(tokens[1].parsedContent)));
        }),
    "substring": new Function(
        {
            name: "substring", 
            args: [ ValueTokenType.STRING, ValueTokenType.NUMBER, ValueTokenType.NUMBER ], 
            returns: ValueTokenType.STRING,
            static: false,
            property: false,
        },
        (tokens) => {
            return ParsedToken.fromString(tokens[0].parsedContent.substring(Number(tokens[1].parsedContent), Number(tokens[2].parsedContent)));
        }),
    "length": new Function(
        {
            name: "length", 
            args: [ ValueTokenType.STRING ], 
            returns: ValueTokenType.NUMBER,
            static: false,
            property: true,
        },
        (tokens) => {
            return ParsedToken.fromNumber(tokens[0].parsedContent.length);
        }),
    "indexOf": new Function(
        {
            name: "indexOf",
            args: [ ValueTokenType.STRING, ValueTokenType.STRING ],
            returns: ValueTokenType.NUMBER,
            static: false,
            property: false,
        },
        (tokens) => {
            return ParsedToken.fromNumber(tokens[0].parsedContent.indexOf(tokens[1].parsedContent))
        }),
};

export function run(functionToken: ParsedToken, params: ParsedToken[]): ParsedToken {
    return functions[functionToken.parsedContent].run(params);
}

export function functionCallToString(parsedToken: ParsedToken): string {
    if (parsedToken.func?.header.property) {
        const self = parsedToken.params?.at(0)?.toJavaString();
        return `${self}.${parsedToken.func?.header.name}`;    
    } else if (parsedToken.func?.header.static) {
        const params = parsedToken.params?.map(arg => arg.toJavaString()).toString();
        return `${parsedToken.func?.header.name}(${params})`;
    } else {
        const self = parsedToken.params?.at(0)?.toJavaString();
        const params = parsedToken.params?.slice(1)?.map(arg => arg.toJavaString()).toString();
        return `${self}.${parsedToken.func?.header.name}(${params})`;
    }
}