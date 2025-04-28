<script lang="ts">
    const { questionString, descriptor } = $props();

    let area: HTMLTextAreaElement;

    export function getResponse(): string {
        return area.value;
    }
</script>

<div class="question-container">
    <div class="question-descriptor">
        {descriptor}
    </div>
    <div class="question-box">
        <pre class="code-box box">
            {questionString}
        </pre>
    </div>
    <textarea bind:this={area} class="answer-textarea box"></textarea>
    <hr>
</div>