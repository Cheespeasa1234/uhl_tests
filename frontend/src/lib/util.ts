import { showNotifToast } from "./popups.ts";

export function sanitize(unsanitized: string): string {
    // only allow a-zA-Z0-9 and hyphens
    return unsanitized.replace(/[^a-zA-Z0-9-]/g, "");
}

export function isUnsanitized(unsanitized: string): boolean {
    return unsanitized !== sanitize(unsanitized);
}

export type API_Response = {
    success: boolean,
    message: string,
    data?: any,
    [key: string]: any,
}

export async function fetchToJsonMiddleware(response: Response): Promise<API_Response> {
    try {
        const json = await response.json();
        showNotifToast(json);
        return json;
    } catch (e) {
        const json = { success: false, message: `${e}`, data: { error: e }};
        showNotifToast(json);
        return json;
    }
}