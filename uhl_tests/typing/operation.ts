import { TokenType, VariableTokenType } from "./token.ts";
import { OperatorTokenType, ValueTokenType } from "./token.ts";
import { ParsedToken } from "./parsedToken.ts";

type OperationFunction = (...tokens: ParsedToken[]) => ParsedToken;
const Operations: Record<ValueTokenType, Record<OperatorTokenType, OperationFunction | undefined>> = {
    [ValueTokenType.NUMBER]: {
        [OperatorTokenType.ADD]: (v1: ParsedToken, v2: ParsedToken) => {
            return ParsedToken.fromRawTokenString("#" + (Number(v1.parsedContent) + Number(v2.parsedContent)));
        },
        [OperatorTokenType.SUB]: (v1: ParsedToken, v2: ParsedToken) => {
            return ParsedToken.fromRawTokenString("#" + (Number(v1.parsedContent) - Number(v2.parsedContent)));
        },
        [OperatorTokenType.MUL]: (v1: ParsedToken, v2: ParsedToken) => {
            return ParsedToken.fromRawTokenString("#" + (Number(v1.parsedContent) * Number(v2.parsedContent)));
        },
        [OperatorTokenType.DIV]: (v1: ParsedToken, v2: ParsedToken) => {
            return ParsedToken.fromRawTokenString("#" + (Number(v1.parsedContent) / Number(v2.parsedContent)));
        },
        [OperatorTokenType.MOD]: (v1: ParsedToken, v2: ParsedToken) => {
            return ParsedToken.fromRawTokenString("#" + (Number(v1.parsedContent) % Number(v2.parsedContent)));
        },
        [OperatorTokenType.AND]: (v1: ParsedToken, v2: ParsedToken) => {
            return ParsedToken.fromRawTokenString("#" + (Number(v1.parsedContent) & Number(v2.parsedContent)));
        },
        [OperatorTokenType.OR]: (v1: ParsedToken, v2: ParsedToken) => {
            return ParsedToken.fromRawTokenString("#" + (Number(v1.parsedContent) | Number(v2.parsedContent)));
        },
        [OperatorTokenType.GT]: (v1: ParsedToken, v2: ParsedToken) => {
            return Number(v1.parsedContent) > Number(v2.parsedContent) ? ParsedToken.TRUE : ParsedToken.FALSE;
        },
        [OperatorTokenType.LT]: (v1: ParsedToken, v2: ParsedToken) => {
            return Number(v1.parsedContent) < Number(v2.parsedContent) ? ParsedToken.TRUE : ParsedToken.FALSE;
        },
        [OperatorTokenType.GTE]: (v1: ParsedToken, v2: ParsedToken) => {
            return Number(v1.parsedContent) >= Number(v2.parsedContent) ? ParsedToken.TRUE : ParsedToken.FALSE;
        },
        [OperatorTokenType.LTE]: (v1: ParsedToken, v2: ParsedToken) => {
            return Number(v1.parsedContent) <= Number(v2.parsedContent) ? ParsedToken.TRUE : ParsedToken.FALSE;
        },
        [OperatorTokenType.EQ]: (v1: ParsedToken, v2: ParsedToken) => {
            return Number(v1.parsedContent) == Number(v2.parsedContent) ? ParsedToken.TRUE : ParsedToken.FALSE;
        },
        [OperatorTokenType.NEQ]: (v1: ParsedToken, v2: ParsedToken) => {
            return Number(v1.parsedContent) != Number(v2.parsedContent) ? ParsedToken.TRUE : ParsedToken.FALSE;
        },
    },
    [ValueTokenType.STRING]: {
        [OperatorTokenType.ADD]: (v1: ParsedToken, v2: ParsedToken) => {
            return ParsedToken.fromRawTokenString("'" + v1.parsedContent + v2.parsedContent);
        },
        [OperatorTokenType.SUB]: undefined,
        [OperatorTokenType.MUL]: undefined,
        [OperatorTokenType.DIV]: undefined,
        [OperatorTokenType.MOD]: undefined,
        [OperatorTokenType.AND]: undefined,
        [OperatorTokenType.OR]: undefined,
        [OperatorTokenType.GT]: undefined,
        [OperatorTokenType.LT]: undefined,
        [OperatorTokenType.GTE]: undefined,
        [OperatorTokenType.LTE]: undefined,
        [OperatorTokenType.EQ]: (v1: ParsedToken, v2: ParsedToken) => {
            return v1.parsedContent == v2.parsedContent ? ParsedToken.TRUE : ParsedToken.FALSE;
        },
        [OperatorTokenType.NEQ]: (v1: ParsedToken, v2: ParsedToken) => {
            return v1.parsedContent == v2.parsedContent ? ParsedToken.TRUE : ParsedToken.FALSE;
        },
    },
    [ValueTokenType.BOOLEAN]: {
        [OperatorTokenType.ADD]: undefined,
        [OperatorTokenType.SUB]: undefined,
        [OperatorTokenType.MUL]: undefined,
        [OperatorTokenType.DIV]: undefined,
        [OperatorTokenType.MOD]: undefined,
        [OperatorTokenType.AND]: (v1: ParsedToken, v2: ParsedToken) => (v1.asBoolean() && v2.asBoolean()) ? ParsedToken.TRUE : ParsedToken.FALSE,
        [OperatorTokenType.OR]: (v1: ParsedToken, v2: ParsedToken) => (v1.asBoolean() || v2.asBoolean()) ? ParsedToken.TRUE : ParsedToken.FALSE,
        [OperatorTokenType.GT]: undefined,
        [OperatorTokenType.LT]: undefined,
        [OperatorTokenType.GTE]: undefined,
        [OperatorTokenType.LTE]: undefined,
        [OperatorTokenType.EQ]: (v1: ParsedToken, v2: ParsedToken) => (v1.parsedContent == v2.parsedContent) ? ParsedToken.TRUE : ParsedToken.FALSE,
        [OperatorTokenType.NEQ]: (v1: ParsedToken, v2: ParsedToken) => (v1.parsedContent != v2.parsedContent) ? ParsedToken.TRUE : ParsedToken.FALSE,
    }
}

export function stringify(operator: string): string {
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
    }[operator]!;
}

export function operate(token1: ParsedToken, token2: ParsedToken, operation: ParsedToken): ParsedToken {

    if (token1.tokenType !== TokenType.VALUE) {
        throw new Error(`${token1.toString()} must be a value, was type ${token1.getTypeName()}`);
    }
    
    if (token2.tokenType !== TokenType.VALUE) {
        throw new Error(`${token2.toString()} must be a value, was type ${token2.getTypeName()}`);
    }

    if (operation.tokenType !== TokenType.OPERATOR) {
        throw new Error(`${operation.toString()} must be an operator, was type ${operation.getTypeName()}`);
    }

    if (token1.type !== token2.type) {
        throw new Error(`Type mismatch, ${token1.toString()} is type ${token1.getTypeName()} but ${token2.toString()} is type ${token2.getTypeName()}`);
    }
    
    const valueTokenType: ValueTokenType = token1.type as ValueTokenType;
    const operatorTokenType: OperatorTokenType = operation.type as OperatorTokenType;
    const f: OperationFunction | undefined = Operations[valueTokenType][operatorTokenType];
    
    if (f === undefined) {
        throw new Error(`Operation ${operatorTokenType} is not defined for type ${valueTokenType}`);
    }
    
    const answer: ParsedToken = f(token1, token2);
    return answer;
}