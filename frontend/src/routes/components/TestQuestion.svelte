<script lang="ts">
    const { questionString, descriptor } = $props();
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
    <textarea class="answer-textarea box"></textarea>
    <hr>
</div>