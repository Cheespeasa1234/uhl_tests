<script lang="ts">
    import { showNotifToast } from "$lib/popups";
    import { postJSON, getJSON } from "$lib/util";
    import { onMount } from "svelte";
    import TestQuestion from "../components/TestQuestion.svelte";
    import Timer from "../components/Timer.svelte";

    import ConfirmModal from "../components/modal/ConfirmModal.svelte";
    import Footer from "../components/Footer.svelte";
    import type { EventLocals } from "$lib/types";

    const { data } = $props();
    let sessionData: EventLocals = $state({ signedIn: false });

    const STATE_DONE = 0;
    const STATE_DONE_BM = 1;
    const STATE_BLANK = 2;
    const STATE_BLANK_BM = 3;

    let cookiePopupModal: ConfirmModal;
    let submissionConfirmModal: ConfirmModal;
    let submissionPopupModal: ConfirmModal;

    let submissionSuccess: boolean = $state(false);
    let submissionMessage: string = $state("");

    let testCodeInputValue: string = $state("");
    let agree: boolean = $state(false);

    let testQuestions: any[] = $state([]);
    let testQuestionEls: TestQuestion[] = $state([]);
    let timer: Timer;
    let previewTestName: string = $state("");
    let previewTestMins: number = $state(0);
    let previewTestCount: number = $state(0);
    let previewTestLimEnabled: boolean = $state(false);

    let progress = $derived(testQuestionEls.reduce((sum, item) => sum + (item.getComplete() ? 1 : 0), 0) / testQuestionEls.length);
    let reviewPageData: { completed: number, uncompleted: number, bookmarked: number, states: number[] } = $state(
        {
            completed: 6,
            uncompleted: 1,
            bookmarked: 2,
            states: [ STATE_DONE, STATE_DONE, STATE_DONE_BM, STATE_DONE, STATE_DONE, STATE_BLANK_BM, STATE_DONE] 
        });

    let takeTestBtn: HTMLButtonElement;
    let submitTestBtn: HTMLButtonElement;

    let page0: HTMLDivElement;
    let page1: HTMLDivElement;
    let page2: HTMLDivElement;
    let page3: HTMLDivElement;

    function setPage(pageIndex: number) {
        let pages: HTMLDivElement[] = [page0, page1, page2, page3];
        if (pageIndex < 0 || pageIndex >= pages.length) return;
        try {
            for (let i = 0; i < pages.length; i++) {
                if (i === pageIndex) {
                    pages[i].style.display = "block";
                } else {
                    pages[i].style.display = "none";
                }
            }
        } catch {}
    }

    async function changedAnAnswer() {
        const answers = [];
        for (const question of testQuestionEls) {
            answers.push(question.getResponse());
        }
        await postJSON("./api/testing/sync-answers", {
            answers: answers,
        });
    }

    function submissionPopupOpen() {
        submissionConfirmModal.show(async (success) => {
            if (success) {
                await changedAnAnswer()
                const json = await getJSON("./api/testing/submit-test");
                const { success, message } = json;
                clearDocument();
                window.location.href = "/test/success";
            }
        });
    }

    function setReviewPageData() {
        let completed = 0;
        let bookmarked = 0;
        let uncompleted = 0;
        const states = [];
        for (const questionEl of testQuestionEls) {
            const bm = questionEl.getBookmarked();
            if (bm) {
                bookmarked++;
            }
            if (questionEl.getComplete()) {
                completed++;
                states.push(bm ? STATE_DONE_BM : STATE_DONE);
            } else {
                uncompleted++;
                states.push(bm ? STATE_BLANK_BM : STATE_BLANK);
            }
        }

        reviewPageData = {
            completed,
            uncompleted,
            bookmarked,
            states,
        }

    }

    onMount(() => {
        setPage(0);

        // Konami code detector and page switcher (DEV)
        const enablePageSwitcher = false;
        const enableKonami = false;
        const nums = "0123456789".split("");
        let konamiCode = [
            "ArrowUp",
            "ArrowUp",
            "ArrowDown",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "ArrowLeft",
            "ArrowRight",
            "b",
            "a",
        ];
        let recentKeys = [];
        document.addEventListener("keydown", (event) => {
            if (enablePageSwitcher) {
                if (nums.indexOf(event.key) !== -1) {
                    const num = parseInt(event.key);
                    setPage(num);
                }
            }

            if (enableKonami) {
                recentKeys.push(event.key);
                if (recentKeys.length > konamiCode.length) {
                    recentKeys.shift();
                }
                if (JSON.stringify(recentKeys) === JSON.stringify(konamiCode)) {
                    showNotifToast({
                        success: true,
                        message: "Konami code detected!",
                    });
                    window.open("./admin", "_blank")?.focus();
                }
            }
        });
    });

    // The student has submitted their answers- clear the screen
    function clearDocument() {
        testQuestions = [];
        testCodeInputValue = "";
        previewTestCount = 0;
        previewTestName = "";
        previewTestMins = 0;
        setPage(0);
    }

    async function previewTest() {
        const json = await postJSON("./api/testing/test-info", {
            code: testCodeInputValue,
        });

        const { success, data } = json;
        if (!success) {
            setPage(0);
            return;
        }

        const { timeLimit, enableTimeLimit, count } = data;
        previewTestMins = timeLimit;
        previewTestLimEnabled = enableTimeLimit;
        previewTestCount = count;
        previewTestName = testCodeInputValue;

        setPage(1);
    }

    // Get a new test and place it on the screen
    function takeTest() {
        postJSON("./api/testing/new-test", {
            code: testCodeInputValue,
        }).then((json) => {
            const { success, data } = json;

            if (!success) {
                return;
            }

            setPage(2);

            const { questions, student, timeStarted, timeToEnd } = data;
            localStorage.setItem("testData", JSON.stringify(data));
            showNotifToast({
                success: true,
                message: `Test started: ${timeStarted}<br>Time ends: ${timeToEnd}`,
            });
            testQuestions = questions;
            timer.setTimeEnd(timeToEnd);
        });
    }
</script>

<svelte:head>
    <title>Testing | Uhl Tests</title>
</svelte:head>

<ConfirmModal showCancel bind:this={submissionConfirmModal}>
    {#snippet header()}
        <h2>Are you sure?</h2>
    {/snippet}
    {#snippet children()}
        <p>
            Are you sure you want to submit the quiz? You will not be able to
            change your answers!
        </p>
    {/snippet}
</ConfirmModal>

<div class="p-3 mt-3" style="margin: auto; max-width: 50%;">
    <div bind:this={page0} style="display: none">
        <h2>{data.session ? data.session.name : "Anon"}, lock in.</h2>
        <form class="row g-3 mb-2">
            <div class="col-md-6">
                <label for="inputTc" class="form-label">Test Code</label>
                <input
                    placeholder="practice2025"
                    bind:value={testCodeInputValue}
                    type="text"
                    class="form-control"
                    id="inputTc"
                />
            </div>
        </form>

        <div class="col-12">
            <div class="form-check">
                <input
                    bind:checked={agree}
                    class="form-check-input"
                    type="checkbox"
                    id="gridCheck"
                />
                <label class="form-check-label" for="gridCheck">
                    I agree to the PHHS Testing Code of Conduct
                </label>
            </div>
        </div>

        <label class="mt-2 mb-2" for="take-test"
            >Make sure you can sign in to this email, or your test results will
            be lost!</label
        >
        <div>
            <button
                disabled={!agree || testCodeInputValue === ""}
                class="btn btn-primary"
                bind:this={takeTestBtn}
                onclick={previewTest}
                id="take-test">Submit</button
            >
        </div>
    </div>

    <div bind:this={page1} style="display: none">
        <h2>Wait! Before you start...</h2>
        <p>
            You have selected the test <b>{previewTestName}</b>.
            {#if previewTestLimEnabled}
                You have been given <b>{previewTestMins} minutes</b> to complete
                this test.
            {:else}
                There is no time limit for this test.
            {/if}
            There will be <b>{previewTestCount} questions</b>.
        </p>
        <p>
            When you begin, the timer will start. If you submit after the time
            limit, you will be marked as late and your final score may change.
            If you have any accommodations that apply, these can be taken into
            account.
        </p>
        <p>
            The questions will appear before you in order. Do not provide notes,
            extra commentary, or anything other than your exact answer in the
            answer boxes. This will cause your answer to be marked as <b
                >incorrect</b
            >. Include newlines, and ensure you do not leave any extra spaces or
            tabs. <b>Capitalization matters</b>.
        </p>
        <p>
            You can bookmark the question, and at the end of the page, you will
            be notified of each bookmarked question. At that point, you may go
            back and change your answer.
        </p>
        <p>
            At the end of the page, you will be presented with icons for each
            question, that will tell you how many questions you've completed,
            and how many unresolved bookmarks you have. You can check how much
            time you have left, and if you have put an answer for every
            question, you can submit your test. At this point, your testing will
            conclude.
        </p>
        <p>
            Select <b>Begin</b> to begin testing, and start the timer.
        </p>
        <p>
            Select <b>Cancel</b> to cancel, and go back to the main menu.
        </p>
        <div class="button-group">
            <button class="btn btn-outline-secondary" onclick={takeTest}
                >Begin</button
            >
            <button
                class="btn btn-outline-primary"
                onclick={() => clearDocument()}>Cancel</button
            >
        </div>
    </div>

    <div bind:this={page2} style="display: none">
        <div>
            <div class="d-flex" style="gap: 2px;">
                <div class="h3 m-0 mr-2">Quiz</div>
                <div class="m-0"><Timer bind:this={timer} /></div>
            </div>
        </div>
        <div>
            {#if !testQuestions || testQuestions.length == 0}
                <div>Please request a quiz first.</div>
            {:else}
                {#each testQuestions as question, index}
                    <div>
                        <span class="h5 mb-1 mt-3">Question {index + 1}</span>
                        <TestQuestion
                            bind:this={testQuestionEls[index]}
                            questionString={question.questionString}
                            descriptor={question.descriptor}
                            changedCb={changedAnAnswer}
                        />
                    </div>
                {/each}
                <div
                    class="progress"
                    role="progressbar"
                    aria-label="Basic example"
                    aria-valuenow="0"
                    aria-valuemin="0"
                    aria-valuemax="100"
                >
                    <div
                        class="progress-bar"
                        style="width: {progress * 100}%"
                    ></div>
                </div>
            {/if}
        </div>
        <div class="button-group">
            <button class="btn btn-outline-primary" onclick={() => { setPage(3); setReviewPageData() } }
                >Review Answers</button
            >
        </div>
    </div>

    <div bind:this={page3} style="display: none">
        <div class="d-flex justify-content-center flex-column align-items-center text-center" style="width: fit-content; margin: auto;">
            <h3>Review Your Answers</h3>
            <div class="mb-2">
                <div class="text-muted">{reviewPageData.completed}/{reviewPageData.completed + reviewPageData.uncompleted} Completed</div>
                <div class="text-muted">{reviewPageData.bookmarked} Bookmarks</div>
            </div>
    
            <div class="answer-review-grid-container mb-4">
                {#each reviewPageData.states as state, index}
                    <div class="answer-review-grid-item state-{state}">
                        {index + 1}
                        {#if state === STATE_BLANK_BM || state === STATE_DONE_BM}
                            <i class="fa-solid fa-bookmark bookmarked-indicator"></i>
                        {/if}
                    </div>
                {/each}
            </div>
    
            {#if reviewPageData.uncompleted != 0}
                <i class="mb-2">You can not submit yet. You have {reviewPageData.uncompleted} incomplete questions.</i>
            {/if}
            <div>
                <button class="btn btn-secondary" style="width: 100px" onclick={() => setPage(2)}>Go Back</button>
                <button
                    class="btn btn-outline-primary"
                    style="width: 100px"
                    bind:this={submitTestBtn}
                    disabled={reviewPageData.uncompleted != 0}
                    onclick={submissionPopupOpen}
                >
                    Submit
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    .answer-review-grid-container {
        display: grid;
        grid-template-columns: repeat(4, 1fr); /* 4 columns */
        gap: 12px; /* Space between cells */
        padding: 10px;
    }

    .answer-review-grid-item {
        width: 65px;
        height: 65px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center; /* Left align text */
        font-size: 1.75em;
        position: relative;
        border-radius: 5px;
    }
    
    .state-0 {
        background-color: hsl(0, 0%, 94%);
        border: 1.75px solid hsl(0, 0%, 80%);
    }

    .state-1 {
        background-color: hsl(52, 100%, 72%);
        border: 1.75px solid hsl(52, 100%, 58%);
    }
    
    .state-2, .state-3 {
        background-color: hsl(4, 100%, 72%);
        border: 1.75px solid hsl(4, 100%, 58%);
    }

    .bookmarked-indicator {
        position: absolute;
        color: hsl(0, 0%, 30%);
        top: -6px;
        right: -6px;
    }
</style>