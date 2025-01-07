import { valueTokenManager, operatorTokenManager, TokenType, tokenTypes, RawToken, ValueTokenType, variableTokenManager, identifier, functionTokenManager } from "./token.ts";
import { Function, functionCallToString } from "./func.ts";

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
    typeManager: typeof valueTokenManager | typeof operatorTokenManager | typeof variableTokenManager | typeof functionTokenManager;
    
    params?: ParsedToken[];
    func?: Function;

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

    /**
     * Parses a RawToken and returns the parsed version
     * @param token The raw token to parse
     * @returns The parsed token
     */
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

    /**
     * Creates a parsed token from a raw token string, including identifiers and syntax.
     * @param token The rawContent of the token
     * @returns The parsed token
     */
    static fromRawTokenString(token: string): ParsedToken {
        return ParsedToken.fromRawToken(new RawToken(token));
    }
    
    /**
     * Returns a parsed token of type VALUE.NUMBER, whose parsed content is the provided number
     * @param str The number content
     * @returns The parsed token
     */
    static fromNumber(num: number): ParsedToken {
        return new ParsedToken("#" + num, num.toString(), TokenType.VALUE, ValueTokenType.NUMBER);
    }

    /**
     * Returns a parsed token of type VALUE.STRING, whose parsed content is the provided string
     * @param str The string content
     * @returns The parsed token
     */
    static fromString(str: string): ParsedToken {
        return new ParsedToken("'" + str, str, TokenType.VALUE, ValueTokenType.STRING);
    }

    /**
     * Converts this token to true or false.
     * If the token is a VALUE.BOOLEAN, it will return its boolean value.
     * Otherwise, it throws an error.
     * @returns The boolean
     */
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

    /**
     * Coerces this token to true or false.
     * If the value is "true" or "false", it returns the respective boolean.
     * Otherwise, it returns the truthy / falsy status.
     * @returns The coerced boolean
     */
    asBooleanCoerce(): boolean {
        if (this.parsedContent === "true") {
            return true;
        }
        
        if (this.parsedContent === "false") {
            return false;
        }
        
        return this.parsedContent ? true : false;
    }

    /**
     * Returns the full type name of this token, which is its `tokenType`.`type`.
     * @returns The full type name
     */
    getTypeName(): string {
        return `${this.tokenType as string}.${this.type as string}`;
    }

    /**
     * Returns a string representation of this token, which is its `rawContent` and its type
     * @returns A string representation of the value of this token
     */
    toString(): string {
        return `(${this.getTypeName()}):${this.rawContent}`;
    }

    /**
     * Returns the java defintion string form of this token, assuming it is the creation of a new variable
     * @returns The java definition string
     */
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
    
    /**
     * Returns the java string form of this token
     * @returns The java string
     */
    toJavaString(): string {
        if (this.func && this.params) {
            // get the function that this is
            return functionCallToString(this);
        }
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