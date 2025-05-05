<script lang="ts">
    const { questionString, descriptor } = $props();

    let side: HTMLDivElement;

    let bookmarked: boolean = $state(false);
    let text: string = $state("");

    export function getResponse(): string {
        return text;
    }

    export function getBookmarked(): boolean {
        return bookmarked;
    }

    export function getComplete(): boolean {
        return text.length > 0;
    }
</script>
<div class="card p-3">
    <div class="d-flex mb-2" style="align-items: center">
        <span class="h6 m-0">{descriptor}</span>
        <button class="bookmark-btn" onclick={() => { bookmarked = !bookmarked }}>
            {#if bookmarked}
                <i class="fa-solid fa-bookmark"></i>
            {:else if !bookmarked}
                <i class="fa-regular fa-bookmark"></i>
            {:else}
                THIS WILL NEVER HAPPEN.
            {/if}
        </button>
    </div>
        
    <pre class="card p-2">{questionString}</pre>

    <textarea placeholder="Your answer" bind:value={text} class="card p-1"></textarea>
</div>

<style>
    .bookmark-btn {
        border: none;
        background: none;
        font-size: 1em;
        font-weight: 100;
    }

    .fa-bookmark {
        transition: all 0.25s ease;
        transform: translateY(1px);
        scale: 1;
    }

    .bookmark-btn:hover .fa-bookmark {
        color: #1776b6;
        transform: translateY(-2.5px);
    }
</style>