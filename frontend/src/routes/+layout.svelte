<script lang="ts">
    import { onMount } from "svelte";
    import { Toaster, toast } from "svelte-hot-french-toast";

    // Tooltips
    import tippy from 'tippy.js';
    import 'tippy.js/dist/tippy.css';
    import 'tippy.js/animations/scale.css';
    import Footer from "./components/Footer.svelte";

    const { children } = $props();

    let mounted: boolean = $state(false);
    onMount(() => {
        // Take all elements with a data attribute `data-tippy-content` and set the tooltip with tippy
        tippy("[data-tippy-content]", {
            appendTo: document.body,
            inertia: true,
            animation: "scale",
        });
        mounted = true;
        toast.success("Mounted");
    });
</script>

<svelte:head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<div class="">
    <div class="" style="display: {mounted ? "block" : "none"}">
        {@render children()}
    </div>
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