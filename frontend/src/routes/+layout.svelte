<script lang="ts">
    import { onMount } from "svelte";
    import { Toaster, toast } from "svelte-hot-french-toast";

    // Tooltips
    import tippy from 'tippy.js';
    import 'tippy.js/dist/tippy.css';
    import 'tippy.js/animations/scale.css';
    import Footer from "./components/Footer.svelte";

    const { data, children } = $props();

    onMount(() => {
        // Take all elements with a data attribute `data-tippy-content` and set the tooltip with tippy
        tippy("[data-tippy-content]", {
            appendTo: document.body,
            inertia: true,
            animation: "scale",
        });
    });
</script>

<svelte:head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
        <a class="navbar-brand" href="/">Uhl Tests</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                {#if data.signedIn}
                    <li class="nav-item">
                        <a class="nav-link active" href="/test">Take Test</a>
                    </li>
                {/if}
                <li class="nav-item">
                    <a class="nav-link active" href="/">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link active" target="_blank" href="https://github.com/Cheespeasa1234/uhl_tests">GitHub</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link active" target="_blank" href="https://natelevison.com">More</a>
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
    @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
    
    .maincont {
        display: flex;
        flex-direction: column;
        height: 100vw;
    }

    .content {
        flex: 1
    }

    .footer {
        padding: 10px;
    }
</style>