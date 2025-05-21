import { error, redirect, type Handle, json } from '@sveltejs/kit';

const needsAuth = ["/test", "/admin"];

function urlNeedsAuth(url: string): boolean {
    for (const path of needsAuth) {
        if (url.startsWith(path)) {
            return true;
        }
    }
    return false;
}

export const handle: Handle = async ({ event, resolve }) => {
    // Check if the request is for an API endpoint
    if (event.url.pathname.startsWith("/api")) {
        console.log("API REQUEST MADE!");
        return await resolve(event);
    }

    const sid = event.cookies.get("HCST_SID");
    const res = await event.fetch(`/api/testing/check-auth`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            HCST_SID: sid 
        }),
    }).then(r => r.json());
    
    if (res.success) {
        event.locals = {
            signedIn: true,
            session: res.data,
        };
    } else if (urlNeedsAuth(event.url.pathname)) { 
        redirect(303, "/");
    } else {
        event.locals = {
            signedIn: false,
        }
    }

    return await resolve(event);
};
