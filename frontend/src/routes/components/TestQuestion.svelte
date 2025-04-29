<script lang="ts">
    const { questionString, descriptor } = $props();

    const sideColor0 = "#dd6f22";
    const sideColor1 = "#ff1a12";
    const sideColor2 = "#125adf";
    const sideColors = [ sideColor0, sideColor1, sideColor2 ];

    let side: HTMLDivElement;

    let bookmarked: boolean = $state(false);
    let text: string = $state("");
    let status: number = $derived(text.length > 0 ? 2 : 0);
    let sideStyleParams: string = $derived(`--code-block-side-color: ${sideColors[status]}dd; --code-block-side-color-tr: ${sideColors[status]}99`);

    $inspect(status);
    $inspect(sideStyleParams);

    $effect(() => {
        side.style = sideStyleParams;
    });

    export function getStatus(): number {
        return status;
    }

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
<div class="box p-3" style="display: flex; flex-direction: column; gap: 10px;">
    <div class="question-container">
        <div class="side" bind:this={side}></div>
        
        <div class="title box">
            <h2 class="m-0">Question n</h2>
            <h3 class="h6 text-muted m-0">{descriptor}</h3>
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
    <div class="box">
        <pre class="code-box mb-0">
{questionString}</pre>
    </div>
    <textarea bind:value={text} class="answer-textarea"></textarea>
</div>

<style>
    .side {
        --code-block-side-size: 10px;
    }

    .question-container {
        display: flex;
        height: fit-content;
    }

    .side {
        width: var(--code-block-side-size);
        background: var(--code-block-side-color-tr);
        border: 2px solid var(--code-block-side-color);
    }

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

    .box, .answer-textarea {
        width: 100%;
        border: 2px solid lightgray;
        background: white;
        padding: 5px;
    }

    .title {
        border-left: none;
        border-right: none;
        padding-left: 10px;
    }

</style>