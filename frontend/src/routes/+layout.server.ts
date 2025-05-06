import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
	const sid = cookies.get("HCST_SID");
    const json = await fetch("/api/testing/check-auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            HCST_SID: sid 
        }),
    }).then(r => r.json());

    console.log(json);

    if (json.success) {
        return {
            signedIn: true,
            session: json.data,
        };
    } else {
        return {
            signedIn: false,
        }
    }
};