<script lang="ts">
    const { data } = $props();
</script>

<div class="p-4">
    <h2>Your test has been submitted successfully.</h2>
    <h3>Good luck, {data.session.name}!</h3>
</div>