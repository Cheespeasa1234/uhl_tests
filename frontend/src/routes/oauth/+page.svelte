<script lang="ts">
    import { onMount } from "svelte";

	let { data }: { data: { state: string, redirect_uri: string, client_id: string } } = $props();

    let btn: HTMLButtonElement;

    onMount(() => {
        localStorage.setItem("latestCSRFToken", data.state);
            
        // redirect the user to Google
        const params = new URLSearchParams({
            scope: "email profile", // Specify the scope
            response_type: "code", // Set the response type
            access_type: "offline", // Request offline access
            state: data.state, // Include the state parameter
            redirect_uri: data.redirect_uri, // Include the redirect URI
            client_id: data.client_id // Include the client ID
        });
        const link = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
        window.location.assign(link);
    });
</script>

<button bind:this={btn}>Sign In</button>