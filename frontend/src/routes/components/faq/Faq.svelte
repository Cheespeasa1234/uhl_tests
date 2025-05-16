<script lang="ts">
    const { children } = $props();
</script>

<h3 class="mb-4">FAQs</h3>
<ul>
    {@render children()}
</ul>

<style>
    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }
</style>