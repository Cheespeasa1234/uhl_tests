<script lang="ts">
    import { onMount } from "svelte";
    import { Toaster } from "svelte-hot-french-toast";

    // Tooltips
    import tippy from 'tippy.js';
    import 'tippy.js/dist/tippy.css';
    import 'tippy.js/animations/scale.css';
    import { getJSON } from "$lib/util";
    
    const { data, children } = $props();

    onMount(() => {
        // Take all elements with a data attribute `data-tippy-content` and set the tooltip with tippy
        tippy("[data-tippy-content]", {
            appendTo: document.body,
            inertia: true,
            animation: "scale",
        });

        const lightFavicon = '/icons/PNG/light.png';
        const darkFavicon = '/icons/PNG/dark.png';

        console.log("Setting favicon!");
        var favicon = document.querySelector("link[rel='icon']");
 
        const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/png';
        link.rel = 'icon';
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDarkMode) {
            link.href = lightFavicon;
        } else {
            link.href = darkFavicon;
        }
        document.head.appendChild(link);

    });
</script>

<svelte:head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet">
</svelte:head>

<nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
        <a class="navbar-brand" href="/">
            <img src="/icons/PNG/dark.png" alt="Uhl Tests" height="24" class="d-inline-block align-text-top" style="margin-right: 5px;">
            Uhl Tests
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                {#if data.signedIn}
                    <li class="nav-item">
                        <a class="nav-link" href="/test">Take Test</a>
                    </li>
                    {#if data.session?.email === "natelevison@gmail.com"}
                    <li class="nav-item">
                        <a class="nav-link" href="/admin">Admin (TEMP)</a>
                    </li>
                    {/if}
                {/if}
                <li class="nav-item">
                    <a class="nav-link" href="/help">Help</a>
                </li>
                <li class="nav-item">
                    <button class="nav-link" onclick={() => getJSON("/api/testing/ping")}>Ping</button>
                </li>
                <li class="nav-item">
                    <a class="nav-link" target="_blank" href="https://github.com/Cheespeasa1234/uhl_tests">GitHub</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" target="_blank" href="https://natelevison.com">More</a>
                </li>
            </ul>
        </div>
    </div>
</nav>
<div>
    {@render children()}
</div>

<Toaster />

<style>
    :global {
        h1, h2, h3, h4, h5, h6,
        .h1, .h2, .h3, .h4, .h5, .h6,
        .display-1, .display-2, .display-3,
        .display-4, .display-5, .display-6 {
            font-family: "Source Sans 3", sans-serif;
        }
    }
</style>