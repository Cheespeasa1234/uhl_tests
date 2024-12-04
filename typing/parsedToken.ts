import type { VariablesMap } from "../quiz/code.ts";
import { valueTokenManager, operatorTokenManager, TokenType, tokenTypes, RawToken, ValueTokenType, OperatorTokenType, variableTokenManager, VariableTokenType, identifier } from "./token.ts";

/**
 * The parsed data of a token, that stores its type and typemanager. Used to actually compute things
 */
export class ParsedToken {

    static readonly TRUE: ParsedToken = ParsedToken.fromRawTokenString("true");
    static readonly FALSE: ParsedToken = ParsedToken.fromRawTokenString("false");

    rawContent: string;
    parsedContent: string;
    tokenType: TokenType;
    type: string;
    subtype?: string;
    typeManager: typeof valueTokenManager | typeof operatorTokenManager | typeof variableTokenManager;

    constructor (rawContent: string, parsedContent: string, tokenType: TokenType, type: string) {
        this.rawContent = rawContent;
        this.parsedContent = parsedContent;
        this.tokenType = tokenType;
        this.type = type;
        this.typeManager = tokenTypes[tokenType];

        // Handle variable typing
        if (tokenType === TokenType.VARIABLE) {
            this.subtype = identifier[this.rawContent.charAt(2)];
            if (!this.subtype) {
                throw new Error(`Variable not given valid identifier: '${this.rawContent}'`);
            }
        }
    }

    static fromRawToken(token: RawToken): ParsedToken {
        let res: ParsedToken | undefined;
        
        for (const key in tokenTypes) {
            const value = tokenTypes[key as TokenType];
            if (value.rawTokenIsThisType(token)) {
                type t1 = typeof value.types; 
                type t2 = keyof typeof value.types;
                const subtype = value.rawTokenSubType(token)! as keyof typeof value.types;
                res = new ParsedToken(token.content, value.parseAsSubType(token, subtype), key as TokenType, subtype);
            }
        }

        if (res === undefined) {
            throw new Error(`Invalid token ${JSON.stringify(token)}`);
        }

        return res;
    }

    static fromRawTokenString(token: string): ParsedToken {
        return ParsedToken.fromRawToken(new RawToken(token));
    }

    static fromNumber(num: number): ParsedToken {
        return new ParsedToken("#" + num, num.toString(), TokenType.VALUE, ValueTokenType.NUMBER);
    }

    static fromString(str: string): ParsedToken {
        return new ParsedToken("'" + str, str, TokenType.VALUE, ValueTokenType.STRING);
    }

    asBoolean(): boolean {
        if (this.tokenType !== TokenType.VALUE || this.type !== "BOOLEAN") {
            throw new Error(`Can not convert ${this.getTypeName()} to boolean`);
        }

        if (this.parsedContent === "true") {
            return true;
        }

        if (this.parsedContent === "false") {
            return false;
        }

        throw new Error(`Invalid value of boolean ${this.parsedContent}`);
    }

    asBooleanCoerce(): boolean {
        if (this.parsedContent === "true") {
            return true;
        }
        
        if (this.parsedContent === "false") {
            return false;
        }
        
        return this.parsedContent ? true : false;
    }

    getTypeName(): string {
        return `${this.tokenType as string}.${this.type as string}`;
    }

    toString(): string {
        return `(${this.getTypeName()}):${this.rawContent}`;
    }

    toJavaDefinitionString(): string {
        if (this.tokenType !== TokenType.VARIABLE) {
            throw new Error(`Can not make a java definition string from ${this.getTypeName()}`);
        }

        const valueType: ValueTokenType = this.subtype as ValueTokenType;
        if (valueType === ValueTokenType.BOOLEAN) {
            return `boolean ${this.parsedContent}`;
        } else if (valueType === ValueTokenType.NUMBER) {
            const isDecimal = this.parsedContent.includes(".");
            if (isDecimal) {
                return `double ${this.parsedContent}`;
            } else {
                return `int ${this.parsedContent}`;
            }
        } else if (valueType === ValueTokenType.STRING) {
            return `String ${this.parsedContent}`;
        } else {
            return `Object ${this.parsedContent}`;
        }
    }
    
    toJavaString(): string {
        if (this.tokenType === TokenType.OPERATOR) {
            return {
                "ADD": "+",
                "SUB": "-",
                "MUL": "*",
                "DIV": "/",
                "MOD": "%",
                "AND": "&&",
                "OR": "||",
                "GT": ">",
                "LT": "<",
                "GTE": ">=",
                "LTE": ">=",
                "EQ": "==",
                "NEQ": "!=",
            }[this.rawContent]!;
        } else if (this.tokenType === TokenType.VALUE) {
            if (this.type === ValueTokenType.BOOLEAN) {
                return this.rawContent;
            } else if (this.type === ValueTokenType.NUMBER) {
                return this.parsedContent;
            } else if (this.type === ValueTokenType.STRING) {
                if (this.parsedContent === "~s") return "\" \"";
                return `"${this.parsedContent}"`;
            }
        } else if (this.tokenType === TokenType.VARIABLE) {
            return this.parsedContent;
        }
        return "";
    }
}