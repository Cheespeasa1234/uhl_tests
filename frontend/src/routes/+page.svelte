<script lang="ts">
    import { showNotifToast } from "$lib/popups";
    import { postJSON, getJSON } from "$lib/util";
    import { onMount } from "svelte";
    import TestQuestion from "./components/TestQuestion.svelte";

    import "./style.css";
    import "./quiz.css";

    let cookiePopup: HTMLDialogElement;
    let submissionPopup: HTMLDialogElement;

    let submissionSuccess: boolean = $state(false);
    let submissionMessage: string = $state("");
    let submissionAnswerCode: string = $state("");

    let nameInputValue: string = $state("");
    let testCodeInputValue: string = $state("");
    let studentSelf = $state(undefined);

    let testQuestions: any[] = $state([]);

    function cookiePopupOpen() {
        cookiePopup.showModal();
    }

    function cookiePopupClose() {
        cookiePopup.close();
    }

    function submissionPopupOpen() {
        const answerElements = document.querySelectorAll("textarea.answer-textarea");
        const answers = [];
        for (const answer of answerElements) {
            answers.push(answer.nodeValue);
        }

        postJSON("./api/testing/submit-test", {
            "answers": answers,
            "studentSelf": studentSelf,
        }).then(json => {
            const { success, message, answerCode } = json;
            submissionSuccess = success;
            submissionMessage = message;
            submissionAnswerCode = answerCode;
            submissionPopup.showModal();
            clearDocument();
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
        postJSON("./api/testing/new-test", {
            "name": nameInputValue,
            "code": testCodeInputValue,
        }).then(json => {
            const { success, message, data } = json;

            if (!success) {
                console.error("Not success: " + message);
                return;
            }

            const { questions, student, timeStarted, timeToEnd } = data;
            showNotifToast({ success: true, message: `Test started: ${timeStarted}<br>Time ends: ${timeToEnd}` });
            studentSelf = student;
            testQuestions = questions;
        })
    }

</script>

<dialog bind:this={cookiePopup} id="cookie-popup">
    <h2>Warning</h2>
    <p>This website uses cookies to track, identify, and verify users and their responses. If you deny, you will not be permitted to access the page.</p>
    <p>To refuse, simply close this page.</p>
    <button onclick={cookiePopupClose} id="cookie-popup-close">Accept tracking</button>
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
    <button onclick={takeTest} id="take-test">Submit</button>
</fieldset>

<fieldset>
    <legend>Quiz</legend>
    <div style="margin-bottom: 10px;" id="test">
        {#if !testQuestions || testQuestions.length == 0}
            <em style="font-size: 1em;">Please request a quiz first.</em>
        {:else}
            {#each testQuestions as question}
                <TestQuestion questionString={question.questionString} descriptor={question.descriptor} />
            {/each}
        {/if}
    </div>
    <button onclick={submissionPopupOpen} id="submission-popup-open" disabled>Submit</button>
</fieldset>

<dialog bind:this={submissionPopup} id="submission-popup">
    <p>Your responses have been submitted. Please copy your answer code.</p>
    <p>Then, submit it <a target="_blank" href="https://forms.gle/gs4vUFTovo7db84D8">here</a>.</p>
    {#if submissionSuccess}
        <h3>Your answer code:</h3>
        <h2 id="answer-code-popup">{submissionAnswerCode}</h2>
    {:else}
        <p style="color: red;">Something went wrong: {submissionMessage}</p>
    {/if}
    <button onclick={submissionPopupClose} id="submission-popup-close">Okay</button>
</dialog>