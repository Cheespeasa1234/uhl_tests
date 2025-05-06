<script lang="ts">

    import { postJSON } from "$lib/util";
    import { onMount } from "svelte";

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
    
        // validate the state parameter
        if (state !== localStorage.getItem("latestCSRFToken")) {
            console.log("CSRF DETECTED!");
            localStorage.removeItem("latestCSRFToken");
        } else {
            // send the code to the backend
            const res = await postJSON("/api/testing/oauth-token", {
                code
            });
        }
    });

</script>