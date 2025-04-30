<script lang="ts">
    import { showNotifToast } from "$lib/popups";
    import { postJSON, getJSON } from "$lib/util";
    import { onMount } from "svelte";
    import TestQuestion from "./components/TestQuestion.svelte";

    import "./style.css";
    import ConfirmModal from "./components/modal/ConfirmModal.svelte";

    let submissionPopupModal: ConfirmModal;
    let cookiePopupModal: ConfirmModal;

    let submissionSuccess: boolean = $state(false);
    let submissionMessage: string = $state("");
    let submissionAnswerCode: string = $state("");
    let submissionFormUrl: string = $state("");

    let nameInputValue: string = $state("");
    let testCodeInputValue: string = $state("");
    let studentSelf = $state(undefined);

    let testQuestions: any[] = $state([]);
    let testQuestionEls: TestQuestion[] = $state([]);

    let bookmarkCount: number = $derived(testQuestionEls.reduce((sum, item) => sum + (item.getBookmarked() ? 1 : 0), 0));
    let completeCount: number = $derived(testQuestionEls.reduce((sum, item) => sum + (item.getComplete() ? 1 : 0), 0));
    let totalCount: number = $derived(testQuestionEls.length);

    let takeTestBtn: HTMLButtonElement;
    let submitTestBtn: HTMLButtonElement;

    function submissionPopupOpen() {
        submitTestBtn.disabled = true;
        const answers = [];
        for (const question of testQuestionEls) {
            answers.push(question.getResponse());
        }

        postJSON("./api/testing/submit-test", {
            "answers": answers,
            "studentSelf": studentSelf,
        }).then(json => {
            const { success, message, data } = json;
            const { answerCode, formUrl } = data;
            submissionSuccess = success;
            submissionMessage = message;
            submissionAnswerCode = answerCode;
            submissionFormUrl = formUrl;
            submissionPopupModal.show(() => {});
            clearDocument();
            submitTestBtn.disabled = false;
        });
    }

    /**
     * Gets a cookie's value from the browser. Returns an empty string if none found.
     * @param name The key of the cookie
     * @returns The cookie's content, or an empty string if none found.
     */
    function getCookie(name: string): string {
        const z = name + "=";
        const w = decodeURIComponent(document.cookie).split(";");
        for (let i = 0; i < w.length; i++) {
            let c = w[i];
            while (c.charAt(0) == " ") c = c.substring(1);
            if (c.indexOf(z) == 0) return c.substring(z.length, c.length);
        }
        return "";
    }

    onMount(() => {
        // Get the ID cookie, if not there, ask for approval.
        const hcsid = getCookie("HCS_ID");
        if (!hcsid) {
            cookiePopupModal.show(success => {
                if (!success) {
                    window.close();
                }
            });
        }

        // Konami code detector
        let konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
        let recentKeys = [];
        document.addEventListener("keydown", (event) => {
            recentKeys.push(event.key);
            if (recentKeys.length > konamiCode.length) {
                recentKeys.shift();
            }
            if (JSON.stringify(recentKeys) === JSON.stringify(konamiCode)) {
                showNotifToast({ success: true, message: "Konami code detected!" });
                window.open("./admin", "_blank")?.focus();
            }
        });
    });

    // The student has submitted their answers- clear the screen
    function clearDocument() {
        testQuestions = [];
        nameInputValue = "";
        testCodeInputValue = "";
        studentSelf = undefined;
    }

    // Get a new test and place it on the screen
    function takeTest() {
        takeTestBtn.disabled = true
        postJSON("./api/testing/new-test", {
            "name": nameInputValue,
            "code": testCodeInputValue,
        }).then(json => {
            const { success, data } = json;

            if (!success) {
                takeTestBtn.disabled = false
                return;
            }

            const { questions, student, timeStarted, timeToEnd } = data;
            showNotifToast({ success: true, message: `Test started: ${timeStarted}<br>Time ends: ${timeToEnd}` });
            studentSelf = student;
            testQuestions = questions;
            takeTestBtn.disabled = false
        });
    }
</script>

<svelte:head>
    <title>Students | Uhl Tests</title>
</svelte:head>

<ConfirmModal bind:this={cookiePopupModal}>
    {#snippet header()}
        <h2>Cookies?!</h2>
    {/snippet}
    
    {#snippet children()}
        <div>Cookiees!! ACCEPT THEM!</div>
    {/snippet}
</ConfirmModal>

<ConfirmModal bind:this={submissionPopupModal}>
    {#snippet header()}
        <h2>Submission Complete</h2>
    {/snippet}
    
    {#snippet children()}
        {#if submissionSuccess}
            <p>Your responses have been submitted. Please copy your answer code. Then, submit it <a target="_blank" href={submissionFormUrl}>here</a>.</p>
            <h3>Your answer code:</h3>
            <h2 id="answer-code-popup">{submissionAnswerCode}</h2>
        {:else}
            <p>Something went wrong: {submissionMessage}</p>
        {/if}
    {/snippet}
</ConfirmModal>

<div>
    <h2>Request Quiz</h2>
    <div class="input-group mb-3">
        <span class="input-group-text" id="name-lbl">School Email</span>
        <input bind:value={nameInputValue} type="email" placeholder="NameYear@pascack.org" class="form-control" id="name" aria-describedby="name-lbl">
    </div>
    <div class="input-group mb-3">
        <span class="input-group-text" id="testcode-lbl">Test Code</span>
        <input bind:value={testCodeInputValue} type="text" placeholder="practice2025" class="form-control" id="testcode" aria-describedby="testcode-lbl">
    </div>
    <label for="take-test">Make sure you can sign in to this email, or your test results will be lost!</label>
    <div>
        <button class="btn btn-primary" bind:this={takeTestBtn} onclick={takeTest} id="take-test">Submit</button>
    </div>
</div>

<div>
    <h2>Quiz</h2>
    <div id="test">
        {#if !testQuestions || testQuestions.length == 0}
            <div>Please request a quiz first.</div>
        {:else}
            {#each testQuestions as question, index}
                <div>
                    <TestQuestion bind:this={testQuestionEls[index]} questionString={question.questionString} descriptor={question.descriptor} />
                </div>
            {/each}
            <div>
                <div>{completeCount}/{totalCount} Completed</div>
                <div>{bookmarkCount} Bookmarked</div>

                <div>
                    {#each testQuestions as question, index}
                        <div>{index + 1}</div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
    <button class="btn btn-primary" bind:this={submitTestBtn} onclick={submissionPopupOpen} id="submission-popup-open">Submit</button>
</div>