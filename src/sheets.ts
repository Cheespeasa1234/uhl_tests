import { GoogleAuth } from "npm:google-auth-library";
import { google, sheets_v4 } from "npm:googleapis";
import { GaxiosResponse } from "npm:gaxios";

import { logInfo, logError } from "./lib/logger.ts";
import { HCST_GOOGLE_KEY_FILENAME } from "./lib/env.ts";

export async function getValues(
    spreadsheetId: string,
    range: string,
): Promise<GaxiosResponse<sheets_v4.Schema$ValueRange>> {
    const serviceAccountCredentials = JSON.parse(
        await Deno.readTextFile(
            `./secrets/${HCST_GOOGLE_KEY_FILENAME}`,
        ),
    );

    const auth = new GoogleAuth({
        credentials: serviceAccountCredentials,
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const service = google.sheets({ version: "v4", auth });
    try {
        const result = await service.spreadsheets.values.get({
            spreadsheetId,
            range,
            majorDimension: 'ROWS'
        });
        logInfo("sheets", "Got values from sheet");
        return result;
    } catch (err) {
        logError("sheets", "Error getting values from sheet");
        throw err;
    }
}