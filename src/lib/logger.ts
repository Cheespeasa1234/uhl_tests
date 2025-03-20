const ANSI_RESET = "\x1b[0m";
const ANSI_RED = "\x1b[31m";
const ANSI_YELLOW = "\x1b[33m";
const ANSI_BLUE = "\x1b[34m";
const ANSI_CYAN = "\x1b[36m";
const ANSI_BOLD = "\x1b[1m";
const ANSI_PURPLE = "\x1b[35m";
const ANSI_GREEN = "\x1b[32m";

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

const name = `files/log.txt`;
Deno.createSync(name);
Deno.writeTextFile(name, "");

export enum LogLevel {
    Debug =     `${ANSI_BLUE}[DEBUG]${ANSI_RESET}`,
    Info =      `${ANSI_CYAN}[INFO] ${ANSI_RESET}`,
    Warning =   `${ANSI_RED}${ANSI_BOLD}[WARN] ${ANSI_RESET}`,
    Error =     `${ANSI_YELLOW}[ERROR]${ANSI_RESET}`,
}

function log(level: LogLevel, scope: string, message: string) {
    // Get the locale time for EST
    const now = new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
    });
    console.log(`${ANSI_PURPLE}[${now}]${ANSI_RESET}${level}${ANSI_GREEN}[${scope}]${ANSI_RESET} ${message}`);

    // Write to log file
    const logMessage = `[${now}]${removeAnsi(level)}[${scope}] ${message}\n`;
    Deno.writeTextFile(name, logMessage, { append: true });
}

export function logDebug(scope: string, message: string) {
    log(LogLevel.Debug, scope, message);
}

export function logInfo(scope: string, message: string) {
    log(LogLevel.Info, scope, message);
}

export function logWarning(scope: string, message: string) {
    log(LogLevel.Warning, scope, message);
}

export function logError(scope: string, message: string) {
    log(LogLevel.Error, scope, message);
}