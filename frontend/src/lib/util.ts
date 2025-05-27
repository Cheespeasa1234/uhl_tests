/**
 * Provides and exports functions for frontend utility purposes.
 */

import { showNotifToast } from "./popups";
import { type PresetListEntry } from "./types";

import { PUBLIC_API } from "$env/static/public";

/**
 * Remove all characters from a string that are not alphanumeric or hyphens.
 * Used for making sure preset names are valid. This is all frontend, though,
 * so it doesn't actually matter, but it helps with UX.
 * It uses the regular expression `/[^a-zA-Z0-9-]/g`.
 * @param unsanitized The text to santitize
 * @returns The text with non alphanumeric and non hyphen characters removed.
 */
export function sanitize(unsanitized: string): string {
    // only allow a-zA-Z0-9 and hyphens
    return unsanitized.replace(/[^a-zA-Z0-9-]/g, "");
}

/**
 * Returns whether or not a string would be changed if run through the sanitize function.
 * @param unsanitized The unsanitized string
 * @returns Whether or not the text is santitized according to the sanitize function.
 */
export function isUnsanitized(unsanitized: string): boolean {
    return unsanitized !== sanitize(unsanitized);
}

/**
 * All requests from the API will be returned according to this structure.
 */
export type API_Response = {
    /**
     * Whether or not the response is successful
     */
    success: boolean,
    
    /**
     * A success or error message that can be displayed to user or debugger
     */
    message: string,

    /**
     * Optional: some data that a successful call will return
     */
    data?: any,
    
    /**
     * Technically allows any property into this struct. Just for debugging
     */
    [key: string]: any,
}

/**
 * Makes a GET request to the given URL, formats the response, prints important information, shows a notification toast,
 * and returns the API response. Always use this function with the API, as it formats requests and responses according to the API.
 * @param url The URL to fetch
 * @returns A promise for an API response
 */
export async function getJSON(url: string, mute: boolean = false): Promise<API_Response> {
    if (url.startsWith("/api")) url = PUBLIC_API + url;
    const response = await fetch(url, {
        credentials: "include",
    });
    console.groupCollapsed(`GET ${url} - ${response.status}`);
    let json: API_Response;
    try {
        json = await response.json();
    } catch (e) {
        json = { success: false, message: `${e}`, data: { error: e }};
        console.error(e);
        console.log(new Error().stack);
    }
    if (!mute) {
        showNotifToast(json);
    }
    console.dir(json);
    console.trace();
    console.groupEnd();
    return json as API_Response;
}

/**
 * Makes a POST request to the given URL with the given JSON body, formats the response, prints important information, shows a notification toast,
 * and returns the API response. Always use this function with the API, as it formats requests and responses according to the API, and modifies headers.
 * @param url The URL to fetch
 * @param body The JSON body for the request
 * @returns A promise for an API response
 */
export async function postJSON(url: string, body: any, mute: boolean = false): Promise<API_Response> {
    if (url.startsWith("/api")) url = PUBLIC_API + url;
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
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
    if (!mute) {
        showNotifToast(json);
    }
    console.dir(json);
    console.trace();
    console.groupEnd();
    return json as API_Response;
}

export async function getPresetList(): Promise<PresetListEntry[] | undefined> {
    const response = await getJSON("./api/grading/config/list_of_presets")

    if (response.success) {
        return response.data.presets;
    } else {
        return undefined;
    }

}