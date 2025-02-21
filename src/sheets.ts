import { GoogleAuth } from "npm:google-auth-library";
import { google, sheets_v4 } from "npm:googleapis";
import { GaxiosResponse } from "npm:gaxios";

import { load } from "jsr:@std/dotenv";
const env = await load({ envPath: "../secrets/.env" });
const googleKeyFilename: string = env.GOOGLE_KEY_FILENAME;

export async function getValues(
    spreadsheetId: string,
    range: string,
): Promise<GaxiosResponse<sheets_v4.Schema$ValueRange>> {
    const serviceAccountCredentials = JSON.parse(
        await Deno.readTextFile(
            `../secrets/${googleKeyFilename}`,
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
        return result;
    } catch (err) {
        // TODO (developer) - Handle exception
        throw err;
    }
}