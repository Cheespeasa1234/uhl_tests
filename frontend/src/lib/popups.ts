/**
 * Manages and exports functions related to popups.
 */

import { toast } from "svelte-hot-french-toast";
import { type API_Response } from "./util";

/**
 * Displays the information from an API response to the screen using svelte-hot-french-toast.
 * @param json The API response
 */
export function showNotifToast(json: API_Response) {
    const { success, message } = json;
    if (success) {
        toast.success(message,
            {
                position: "top-end"
            }
        );
    } else {
        toast.error(message,
            {
                position: "top-end"
            }
        );
    }
}