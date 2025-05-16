<script lang="ts">
    const { data } = $props();
</script>

<svelte:head>
    <title>Success | Uhl Tests</title>
</svelte:head>

{#if data.signedIn && data.session}
    <div class="p-4">
        <h2>Your test has been submitted successfully.</h2>
        <h3>Good luck, {data.session.name}!</h3>
    </div>
{/if}