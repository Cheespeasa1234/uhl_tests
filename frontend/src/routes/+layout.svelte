<script lang="ts">
    import { onMount } from "svelte";
    import { Toaster, toast } from "svelte-hot-french-toast";

    // import { Styles } from '@sveltestrap/sveltestrap';

    const { children } = $props();

    let mounted: boolean = $state(false);
    onMount(() => {
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

{#if mounted}
    {@render children()}
{/if}
<Toaster />
<!-- <Styles /> -->
