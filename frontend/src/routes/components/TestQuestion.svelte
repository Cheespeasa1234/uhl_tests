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
<div>
    <div>
        <div bind:this={side}></div>
        
        <div>
            <h2>Question n</h2>
            <h3>{descriptor}</h3>
        </div>

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
    <div>
        <pre>{questionString}</pre>
    </div>
    <textarea bind:value={text} class="answer-textarea"></textarea>
</div>

<style>
    .bookmark-btn {
        border: 2px solid lightgray;
        border-left: none;
        background: white;
        font-size: 2em;
        font-weight: 100;
        width: 2.5em;
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