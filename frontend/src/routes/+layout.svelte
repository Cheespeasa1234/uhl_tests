<script lang="ts">
    import { onMount } from "svelte";
    import { Toaster, toast } from "svelte-hot-french-toast";

    // Tooltips
    import tippy from 'tippy.js';
    import 'tippy.js/dist/tippy.css';
    import 'tippy.js/animations/scale.css';

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
</svelte:head>

<style>
    @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
</style>

{#if !mounted}
    Loading...
{/if}

<div style="display: {mounted ? "block" : "none"}">
    {@render children()}
</div>

<Toaster />