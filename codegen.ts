import { $, CodeEnvironment, type LineOfCode } from "./code.ts";
import { ParsedToken } from "./typing/parsedToken.ts";

export function generateForLoop(varname: string): LineOfCode[] {
    
    // Create the top of the for loop
    const direction = Math.random() > 0.5;
    const length = Math.round(Math.random() * 5 + 3);
    const increment = Math.round(Math.random() * 3 + 1);
    let code: LineOfCode;
    if (direction) {
        code = $("for", `$*${varname} #0 $*${varname} LT #${length * increment} $*${varname} ADD #${increment}`,);
    } else {
        code = $("for", `$*${varname} #${length * increment} $*${varname} GT #0 $*${varname} SUB #${increment}`,);
    }

    // Set the opeq
    code.nest_1 = [
        $("print", `$*${varname}`),
    ]
    return [code];

}

export function codeToJava(code: LineOfCode[], depth=0): string {
    let ans = "";
    let pref = "";
    for (let i = 0; i < depth; i++) pref += "  ";

    for (const line of code) {
        const p: ParsedToken[] = line.values.map((v) => ParsedToken.fromRawToken(v));
        if (line.action === "for") {
            const s = `for (${p[0].toJavaDefinitionString()} = ${p[1].toJavaString()}; ${p[2].toJavaString()} ${(p[3].toJavaString())} ${p[4].toJavaString()}; ${p[5].toJavaString()} ${p[6].toJavaString()}= ${p[7].toJavaString()}) {`
            ans += pref + s + "\n";
            if (line.nest_1) ans += codeToJava(line.nest_1, depth + 1);
            ans += pref + "}" + "\n";
        } else if (line.action === "print") {
            const parts = p.map(pt => pt.toJavaString());
            ans += pref + `System.out.println(${parts.join(" + ")});\n`;
        } else if (line.action === "set") {
            ans += pref + `${p[0].toJavaDefinitionString()} = ${p[1].toJavaString()};\n`;
        } else if (line.action === "if") {
            ans += pref + `if (${p[0].toJavaString()} ${p[1].toJavaString()} ${p[2].toJavaString()})`;
            if (line.nest_1) {
                ans += " {\n" + codeToJava(line.nest_1, depth + 1);
                if (line.nest_2) {
                    ans += pref + "} else {\n" + codeToJava(line.nest_2, depth + 1) + "\n" + pref + "}\n";
                } else {
                    ans += pref + "}\n";
                }
            } else {
                ans += ";\n"
            }
        } else if (line.action === "opeq") {
            ans += pref + `${p[0].toJavaString()} ${p[1].toJavaString()}= ${p[2].toJavaString()};\n`;
        }
    }
    return ans;
}

console.log(codeToJava(generateForLoop("i")))