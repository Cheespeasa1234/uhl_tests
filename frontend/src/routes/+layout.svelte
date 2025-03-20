<script lang="ts">
    import { onMount } from "svelte";
    import { Toaster, toast } from "svelte-french-toast";
    import "./admin.css";
    import "./quiz.css";
    import "./style.css";

    const { children } = $props();

    onMount(() => {
        toast.success("Mounted");
    });
</script>

{@render children()}
<Toaster />