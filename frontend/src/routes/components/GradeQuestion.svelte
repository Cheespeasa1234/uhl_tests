<script lang="ts">
    const { question, number } = $props();
    const { correctAnswer, userAnswer, correct } = question;
    const { descriptor, questionString } = question.question;
</script>

<div>
    <div class="carousel-item {number === 0 ? 'active' : ''}">
        <h5>{number + 1}. {descriptor}</h5>
        <pre class="code-format">
            {questionString}
        </pre>
        <div class="comparison">
            <div class="response-format {correct ? 'correct' : 'incorrect'}">
                {userAnswer}
            </div>
            <div class="response-format correct">
                {correctAnswer}
            </div>
            <em>
                {#if correct}
                    <span class="gs">Correct</span>
                {:else}
                    <span class="rs">Incorrect</span>
                {/if}
            </em>
        </div>
    </div>
</div>

<style>
    .rs {
        color: red;
    }

    .gs {
        color: green;
    }
</style>