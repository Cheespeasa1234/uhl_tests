<script lang="ts">
    import { showNotifToast } from "$lib/popups";
    import { postJSON, getJSON } from "$lib/util";
    import { onMount } from "svelte";
    import TestQuestion from "./components/TestQuestion.svelte";

    import "./style.css";

    let cookiePopup: HTMLDialogElement;
    let submissionPopup: HTMLDialogElement;

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

    function cookiePopupOpen() {
        cookiePopup.showModal();
    }

    function cookiePopupClose() {
        cookiePopup.close();
    }

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
            submissionPopup.showModal();
            clearDocument();
            submitTestBtn.disabled = false;
        });
    }

    function submissionPopupClose() {
        const res = confirm("Are you sure you copied the code? You will never be able to see it again!");
        if (res) {
            submissionPopup.close();
        }
        showNotifToast({ success: true, message: "Cancelled submission" });
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
            cookiePopupOpen();
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
                window.location.href = "./admin";
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
            const { success, message, data } = json;

            if (!success) {
                console.error("Not success: " + message);
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

<dialog bind:this={cookiePopup} id="cookie-popup">
    <h2>Warning</h2>
    <p>This website uses cookies to track, identify, and verify users and their responses. If you deny, you will not be permitted to access the page.</p>
    <p>To refuse, simply close this page.</p>
    <button class="button" onclick={cookiePopupClose} id="cookie-popup-close">Accept tracking</button>
</dialog>

<fieldset>
    <legend>Request Quiz</legend>
    <label for="name">School Email</label>
    <input bind:value={nameInputValue} id="name" type="email" placeholder="johndoe@example.com">
    <br>
    <label for="testcode">Test Code</label>
    <input bind:value={testCodeInputValue} id="testcode" type="text" placeholder="practice2025">
    <br>
    <i>Make sure you can sign in to this email, or your test results will be lost!</i>
    <button bind:this={takeTestBtn} onclick={takeTest} id="take-test">Submit</button>
</fieldset>

<fieldset>
    <legend>Quiz</legend>
    <div style="margin-bottom: 10px;" id="test">
        {#if !testQuestions || testQuestions.length == 0}
            <em style="font-size: 1em;">Please request a quiz first.</em>
        {:else}
            {#each testQuestions as question, index}
                <div class="mb-2">
                    <TestQuestion bind:this={testQuestionEls[index]} questionString={question.questionString} descriptor={question.descriptor} />
                </div>
            {/each}
            <div class="mb-2 p-4 bottom-status">
                <div class="h3">{completeCount}/{totalCount} Completed</div>
                <div class="h4">{bookmarkCount} Bookmarked</div>

                <div class="question-overviews">
                    {#each testQuestions as question, index}
                        <div class="question-overview">{index + 1}</div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
    <button bind:this={submitTestBtn} onclick={submissionPopupOpen} id="submission-popup-open">Submit</button>
</fieldset>

<dialog bind:this={submissionPopup} id="submission-popup">
    <p>Your responses have been submitted. Please copy your answer code.</p>
    <p>Then, submit it <a target="_blank" href={submissionFormUrl}>here</a>.</p>
    {#if submissionSuccess}
        <h3>Your answer code:</h3>
        <h2 id="answer-code-popup">{submissionAnswerCode}</h2>
    {:else}
        <p style="color: red;">Something went wrong: {submissionMessage}</p>
    {/if}
    <button onclick={submissionPopupClose} id="submission-popup-close">Okay</button>
</dialog>

<style>
    .bottom-status {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: white;
        border: 2px solid lightgray;
    }

    .question-overviews {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    .question-overview {
        width: 100px;
        height: 100px;
    }
</style>