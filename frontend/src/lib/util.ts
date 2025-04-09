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

export async function getJSON(url: string): Promise<API_Response> {
    const response = await fetch(url);
    console.groupCollapsed(`GET ${url} - ${response.status}`);
    let json: API_Response;
    try {
        json = await response.json();
    } catch (e) {
        json = { success: false, message: `${e}`, data: { error: e }};
        console.error(e);
        console.log(new Error().stack);
    }
    showNotifToast(json);
    console.dir(json);
    console.trace();
    console.groupEnd();
    return json as API_Response;
}

export async function postJSON(url: string, body: any): Promise<API_Response> {
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
    });
    console.groupCollapsed(`POST ${url} - ${response.status}`);
    let json: API_Response;
    try {
        json = await response.json();
    } catch (e) {
        json = { success: false, message: `${e}`, data: { error: e }};
        console.error(e);
        console.log(new Error().stack);
    }
    showNotifToast(json);
    console.dir(json);
    console.trace();
    console.groupEnd();
    return json as API_Response;
}