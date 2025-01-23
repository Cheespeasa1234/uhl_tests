import { GoogleAuth } from "npm:google-auth-library";
import { google, sheets_v4 } from "npm:googleapis";
import { GaxiosResponse } from "npm:gaxios";

export async function getValues(
    spreadsheetId: string,
    range: string,
): Promise<GaxiosResponse<sheets_v4.Schema$ValueRange>> {
    const serviceAccountCredentials = JSON.parse(
        await Deno.readTextFile(
            "../secrets/phhs-hcs-testing-f5279344efbd.json",
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
        });
        return result;
    } catch (err) {
        // TODO (developer) - Handle exception
        throw err;
    }
}