/**
 * The type of a token
 */
export enum TokenType {
    VALUE = "VALUE",
    OPERATOR = "OPERATOR",
    VARIABLE = "VARIABLE",
    FUNCTION = "FUNCTION",
}

/**
 * The data type of a value token
 */
export enum ValueTokenType {
    NUMBER = "NUMBER",
    STRING = "STRING",
    BOOLEAN = "BOOLEAN",
}

/**
 * A map of the characters preceding a Value token, which identify its type
 */
export const identifier: Record<string, ValueTokenType> = {
    "?": ValueTokenType.BOOLEAN,
    "#": ValueTokenType.NUMBER,
    "'": ValueTokenType.STRING,
}

/**
 * The type of operator
 */
export enum OperatorTokenType {
    ADD = "ADD",    // Arithmetic
    SUB = "SUB",    // Arithmetic
    MUL = "MUL",    // Arithmetic
    DIV = "DIV",    // Arithmetic
    MOD = "MOD",    // Arithmetic
    AND = "AND",    // Comparator
    OR = "OR",      // Comparator
    GT = "GT",      // Comparator
    LT = "LT",      // Comparator
    GTE = "GTE",    // Comparator
    LTE = "LTE",    // Comparator
    EQ = "EQ",      // Comparator
    NEQ = "NEQ",    // Comparator
}

/**
 * The type of a variable
 */
export enum VariableTokenType {
    VALUE = "VALUE", // Can be compiled, not reactive
    REFERENCE = "REFERENCE", // Should not be compiled, state may be modified by actions
}

/**
 * The type of a function
 */
export enum FunctionTokenType {
    substring = "substring",
    charAt = "charAt",
    length = "length",
    indexOf = "indexOf",
}

export const valueTokenManager: TokenTypeManager<ValueTokenType> = {
    rawTokenIsThisType(token: RawToken): boolean {
        return this.rawTokenSubType(token) !== undefined;
    },
    rawTokenSubType: function (token: RawToken): ValueTokenType | undefined {
        if (token.content === "true" || token.content === "false") return ValueTokenType.BOOLEAN;
        if (token.content.startsWith("#")) return ValueTokenType.NUMBER;
        if (token.content.startsWith("'")) return ValueTokenType.STRING;
        return undefined;
    },

    parseAsSubType: function (token: RawToken, subtype: string): string {
        if (!this.rawTokenIsThisType(token)) throw new Error(`token ${JSON.stringify(token)} is not of type ${JSON.stringify(this)}`);

        if (subtype === ValueTokenType.NUMBER || subtype === ValueTokenType.STRING) return token.content.substring(1);
        return token.content;
    },
    
    types: ValueTokenType
};

export const operatorTokenManager: TokenTypeManager<OperatorTokenType> = {
    rawTokenIsThisType(token: RawToken): boolean {
        for (const key in this.types) {
            if (token.content === this.types[key as OperatorTokenType]) return true;
        }
        return false;
    },

    rawTokenSubType(token: RawToken): OperatorTokenType | undefined {
        for (const key in this.types) {
            if (token.content === (key as string)) return key as OperatorTokenType;
        }
        return undefined;
    },

    parseAsSubType: function (token: RawToken, subtype: string): string {
        if (!this.rawTokenIsThisType(token)) throw new Error(`token ${JSON.stringify(token)} is not of type ${JSON.stringify(this)}`);
        if (subtype !== this.rawTokenSubType(token)) throw new Error(`token ${JSON.stringify(token)} is not of subtype ${JSON.stringify(subtype)}`);

        return token.content;
    },

    types: OperatorTokenType
}

export const variableTokenManager: TokenTypeManager<VariableTokenType> = {
    rawTokenIsThisType(token: RawToken): boolean {
        return token.content.startsWith("$");
    },

    rawTokenSubType(token: RawToken): VariableTokenType | undefined {
        if (token.content.startsWith("$$")) return VariableTokenType.VALUE;
        else if (token.content.startsWith("$*")) return VariableTokenType.REFERENCE;
        return undefined;
    },

    parseAsSubType(token: RawToken, subtype: string): string {
        if (!this.rawTokenIsThisType(token)) throw new Error(`token ${JSON.stringify(token)} is not of type ${JSON.stringify(this)}`);

        return token.content.substring(3);
    },

    types: VariableTokenType
}

export const functionTokenManager: TokenTypeManager<FunctionTokenType> = {
    rawTokenIsThisType(token: RawToken): boolean {
        return token.content.startsWith(".");
    },

    rawTokenSubType(token: RawToken): FunctionTokenType | undefined {
        for (const key in this.types) {
            if (token.content === (key as string)) return key as FunctionTokenType;
        }
        return undefined;
    },

    parseAsSubType(token: RawToken, subtype: string): string {
        return token.content.substring(1);
    },

    types: FunctionTokenType
};

export const tokenTypes: Record<TokenType, TokenTypeManager<ValueTokenType> | TokenTypeManager<OperatorTokenType> | TokenTypeManager<VariableTokenType> | TokenTypeManager<FunctionTokenType>> = {
    [TokenType.VALUE]: valueTokenManager,
    [TokenType.OPERATOR]: operatorTokenManager,
    [TokenType.VARIABLE]: variableTokenManager,
    [TokenType.FUNCTION]: functionTokenManager
};

/**
 * Stores just the content of a token
 */
export class RawToken {
    content: string;

    constructor(token: string) {
        this.content = token;
    }
}

/**
 * Interface for managing conversions from RawToken to this token type
 */
export interface TokenTypeManager<T extends string> {
    /**
     * Checks whether or not the token provided is the given token type.
     * @param token The raw token to check
     * @returns Whether or not the raw token is the type managed by this manager
     */
    rawTokenIsThisType: (token: RawToken) => boolean;

    /**
     * 
     * @param token The raw token to check
     * @returns The type of this token in the type. Undefined if no type found
     */
    rawTokenSubType: (token: RawToken) => string | undefined;

    /**
     * Gets the parsed value of a raw token from a type, for converting to ParsedType
     * @param token The raw token whose content to parse
     * @param subtype The subtype to convert to
     * @returns The string value to be stored
     */
    parseAsSubType: (token: RawToken, subtype: string) => string;

    types: Record<T, string>;
}
