const ANSI_RESET = "\x1b[0m";
const ANSI_RED = "\x1b[31m";
const ANSI_YELLOW = "\x1b[33m";
const ANSI_BLUE = "\x1b[34m";
const ANSI_CYAN = "\x1b[36m";
const ANSI_BOLD = "\x1b[1m";
const ANSI_PURPLE = "\x1b[35m";
const ANSI_GREEN = "\x1b[32m";
const ANSI_GRAY = "\x1b[30m";

const disabledScopes = [
    /^code(\/.*)?$/,
    /^db(\/.*)?$/
];

function removeAnsi(str: string) {
    return str.replace("\x1b[0m", "")
        .replace("\x1b[31m", "")
        .replace("\x1b[33m", "")
        .replace("\x1b[34m", "")
        .replace("\x1b[36m", "")
        .replace("\x1b[1m", "")
        .replace("\x1b[35m", "")
        .replace("\x1b[32m", "");
}

const enableFileLog = false;
const name = `files/log.txt`;
Deno.createSync(name);
Deno.writeTextFile(name, "");

export enum LogLevel {
    Debug =     `${ANSI_PURPLE}[DEBUG]${ANSI_RESET}`,
    Info =      `${ANSI_CYAN}[INFO] ${ANSI_RESET}`,
    Warning =   `${ANSI_YELLOW}${ANSI_BOLD}[WARN] ${ANSI_RESET}`,
    Error =     `${ANSI_RED}${ANSI_BOLD}[ERROR]${ANSI_RESET}`,
}

function log(level: LogLevel, scope: string, ...data: any[]) {
    for (const scopeRegex of disabledScopes) {
        if (scopeRegex.test(scope)) {
            return;
        }
    }
    // Get the locale time for EST
    const now = new Date().toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
    });
    console.log(`${ANSI_GRAY}[${now}]${ANSI_RESET}${level}${ANSI_GREEN}[${scope}]${ANSI_RESET}`, data.join(" "));

    // Write to log file
    if (!enableFileLog) return;
    const logMessage = `[${now}]${removeAnsi(level)}[${scope}] ${data.join(" ")}\n`;
    Deno.writeTextFile(name, logMessage, { append: true });
}

export function logDebug(scope: string, ...data: any[]) {
    log(LogLevel.Debug, scope, data);
}

export function logInfo(scope: string, ...data: any[]) {
    log(LogLevel.Info, scope, data);
}

export function logWarning(scope: string, ...data: any[]) {
    log(LogLevel.Warning, scope, data);
}

export function logError(scope: string, ...data: any[]) {
    log(LogLevel.Error, scope, data);
}