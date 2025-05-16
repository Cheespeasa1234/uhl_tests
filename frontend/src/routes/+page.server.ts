import type { PageServerLoad } from './$types';
import { randomBytes } from "node:crypto";
import dotenv from "dotenv";
import process from "process";

dotenv.config({ path: "../.env" });

export const load: PageServerLoad = async ({ parent }) => {
    const p = await parent();
    const loaded = {
        ...p,
        state: randomBytes(16).toString("hex"),
        redirect_uri: process.env.HCST_OAUTH_REDIRECT_URI,
        client_id: process.env.HCST_OAUTH_CLIENT_ID,
    };
    console.log(loaded);

    return loaded;
};