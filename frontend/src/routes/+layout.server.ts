import type { LayoutServerLoad } from './$types';
import { randomBytes } from "node:crypto";
import { redirect } from '@sveltejs/kit';

import dotenv from "dotenv";
import process from "process";
dotenv.config({ path: "../.env" });

const needsAuth = ["/test", "/admin"];

function urlNeedsAuth(url: string): boolean {
    for (const path of needsAuth) {
        if (url.startsWith(path)) {
            return true;
        }
    }
    return false;
}

export const load: LayoutServerLoad = async ({ url, fetch }) => {
    if (urlNeedsAuth(url.pathname)) {
        const res = await fetch("/api/testing/check-auth");
        const json = await res.json();
        console.log("Got json:", json);
        const loaded = {
            signedIn: json.success,
            session: json.data,
            state: randomBytes(16).toString("hex"),
            redirect_uri: process.env.HCST_OAUTH_REDIRECT_URI,
            client_id: process.env.HCST_OAUTH_CLIENT_ID,
        };
        return loaded;
    } else {
        return {
            state: randomBytes(16).toString("hex"),
            redirect_uri: process.env.HCST_OAUTH_REDIRECT_URI,
            client_id: process.env.HCST_OAUTH_CLIENT_ID,
        };
    }
};