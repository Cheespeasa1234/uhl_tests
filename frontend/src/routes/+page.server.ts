import type { PageServerLoad } from './$types';
import { randomBytes } from "crypto";

export const load: PageServerLoad = async ({ parent }) => {
    const p = await parent();
    return {
        ...p,
        state: randomBytes(16).toString("hex"),
        redirect_uri: "https://super-cod-ppgxp4wxjq6cr595-8082.app.github.dev/oauth/callback",
        client_id: "887407729631-09vk6uihm1mhqkaigbkn7c3fhu1ck1cs.apps.googleusercontent.com"
    };
};