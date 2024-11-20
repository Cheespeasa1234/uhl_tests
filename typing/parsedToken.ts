import { valueTokenManager, operatorTokenManager, TokenType, tokenTypes, RawToken, ValueTokenType, OperatorTokenType, variableTokenManager, VariableTokenType } from "./token.ts";

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
    typeManager: typeof valueTokenManager | typeof operatorTokenManager | typeof variableTokenManager;

    constructor (rawContent: string, parsedContent: string, tokenType: TokenType, type: string) {
        this.rawContent = rawContent;
        this.parsedContent = parsedContent;
        this.tokenType = tokenType;
        this.type = type;
        this.typeManager = tokenTypes[tokenType];
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
}