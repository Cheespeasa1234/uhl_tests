import { loadSync } from "jsr:@std/dotenv";
import { logError, logInfo } from "./logger.ts";

export const HCST_SPREADSHEET_ID: string = getEnv("HCST_SPREADSHEET_ID");
export const HCST_ADMIN_PASSWORD: string = getEnv("HCST_ADMIN_PASSWORD");
export const HCST_GOOGLE_KEY_FILENAME: string = getEnv("HCST_GOOGLE_KEY_FILENAME");
export const HCST_PORT: string = getEnv("HCST_PORT");
export const HCST_HOST: string = getEnv("HCST_HOST");

export function getEnv(key: string): string {
    const env = loadSync({ envPath: ".env" });
    const value = env[key];
    if (value === undefined) {
        logError("env", `Key ${key} is not set`);
        Deno.exit(1);
    } else {
        logInfo("env", `Key ${key} is set`);
    }
    return value;
}