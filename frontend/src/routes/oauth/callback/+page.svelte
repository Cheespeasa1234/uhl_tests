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

            if (res.success) {
                window.location.href = "/";
            }
        }
    });

</script>

<svelte:head>
    <title>Logging you in... | Uhl Tests</title>
</svelte:head>

<h1>Logging you in...</h1>