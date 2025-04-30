<script lang="ts">
    import { type Grade } from "$lib/types";
    import GradeQuestion from "./GradeQuestion.svelte";

    const props = $props();
    console.log("Props", props);
    const { grade }: { grade: Grade } = props;
    
    const { name, questions, numberCorrect, timeDue, timeStart, timeSubmitted } = grade;
    const { correct, incorrect } = numberCorrect;
    
    const startDate = new Date(timeStart);
    const submittedDate = new Date(timeSubmitted);
    const dueDate = new Date(timeDue);

    const percentage = correct / questions.length * 100;
    const secondsRemaining = (dueDate.getTime() - submittedDate.getTime()) / 1000;
    const secondsElapsed = (submittedDate.getTime() - startDate.getTime()) / 1000;

    let carouselElement: HTMLDivElement;
    let carouselBs;
</script>

<div>
    <div>
        <h4>{name}: {correct} / {questions.length} ({percentage.toFixed(2)}%)</h4>
        <p>Started: {startDate.toLocaleString()} Submitted: {submittedDate.toLocaleString()} Due: {dueDate.toLocaleString()}</p>
        {#if secondsRemaining > 0}
            <p>Submitted {secondsRemaining} seconds
                <span style="color: blue">early</span>
            </p>
        {:else}
            <p>Submitted {Math.abs(secondsRemaining)} seconds
                <span style="color: red">late</span>
            </p>
        {/if}
    </div>
</div>

<div id="gradeCarousel" class="carousel slide">
    <button class="carousel-control-prev carousel-control" type="button" data-bs-target="#gradeCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon carousel-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
    </button>
    <div class="carousel-inner">
        {#each questions as question, index}
            <GradeQuestion question={question} number={index} />
        {/each}
    </div>
    <button class="carousel-control-next carousel-control" type="button" data-bs-target="#gradeCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon carousel-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
    </button>
</div>