<script lang="ts">
    import { showNotifToast } from "$lib/popups";
    import { postJSON, getJSON } from "$lib/util";
    import { onMount } from "svelte";
    import TestQuestion from "./components/TestQuestion.svelte";

    import "./style.css";
    import ConfirmModal from "./components/modal/ConfirmModal.svelte";
    import Footer from "./components/Footer.svelte";

    let cookiePopupModal: ConfirmModal;
    let submissionConfirmModal: ConfirmModal;
    let submissionPopupModal: ConfirmModal;

    let submissionSuccess: boolean = $state(false);
    let submissionMessage: string = $state("");
    let submissionAnswerCode: string = $state("");
    let submissionFormUrl: string = $state("");

    let nameInputValue: string = $state("");
    let testCodeInputValue: string = $state("");
    let studentSelf = $state(undefined);

    let testQuestions: any[] = $state([]);
    let testQuestionEls: TestQuestion[] = $state([]);
    let previewTestName: string = $state("");
    let previewTestMins: number = $state(0);
    let previewTestCount: number = $state(0);
    let previewTestLimEnabled: boolean = $state(false);

    let bookmarkCount: number = $derived(testQuestionEls.reduce((sum, item) => sum + (item.getBookmarked() ? 1 : 0), 0));
    let completeCount: number = $derived(testQuestionEls.reduce((sum, item) => sum + (item.getComplete() ? 1 : 0), 0));
    let totalCount: number = $derived(testQuestionEls.length);

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

    function submissionPopupOpen() {
        submissionConfirmModal.show(success => {
            if (success) {
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
                    if (success) {
                        submissionAnswerCode = answerCode;
                        submissionFormUrl = formUrl;
                    }
                    submissionPopupModal.show(() => {});
                    clearDocument();
                    submitTestBtn.disabled = false;
                });     
            }
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
        setPage(0);
        // Get the ID cookie, if not there, ask for approval.
        const hcsid = getCookie("HCS_ID");
        if (!hcsid) {
            cookiePopupModal.show(success => {
                if (!success) {
                    window.close();
                }
            });
        }

        // Konami code detector and page switcher (DEV)
        const enablePageSwitcher = false;
        const enableKonami = false;
        const nums = "0123456789".split("");
        let konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
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
                    showNotifToast({ success: true, message: "Konami code detected!" });
                    window.open("./admin", "_blank")?.focus();
                }
            }
        });
    });

    // The student has submitted their answers- clear the screen
    function clearDocument() {
        testQuestions = [];
        nameInputValue = "";
        testCodeInputValue = "";
        previewTestCount = 0;
        previewTestName = "";
        previewTestMins = 0;
        setPage(0);
        studentSelf = undefined;
    }

    async function previewTest() {
        const json = await postJSON("./api/testing/test-info", {
            name: nameInputValue,
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
            "name": nameInputValue,
            "code": testCodeInputValue,
        }).then(json => {
            const { success, data } = json;

            if (!success) {
                return;
            }

            setPage(2);

            const { questions, student, timeStarted, timeToEnd } = data;
            showNotifToast({ success: true, message: `Test started: ${timeStarted}<br>Time ends: ${timeToEnd}` });
            studentSelf = student;
            testQuestions = questions;
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

<ConfirmModal showCancel bind:this={submissionConfirmModal}>
    {#snippet header()}
        <h2>Are you sure?</h2>
    {/snippet}
    {#snippet children()}
        <p>Are you sure you want to submit the quiz? You will not be able to change your answers!</p>
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

<div class="p-3" style="margin: auto; max-width: 50%;">
    <div bind:this={page0} style="display: none">
        <h2>Request Quiz</h2>
        <div class="input-group mb-1">
            <span class="input-group-text" id="name-lbl">School Email</span>
            <input bind:value={nameInputValue} type="email" placeholder="NameYear@pascack.org" class="form-control" id="name" aria-describedby="name-lbl">
        </div>
        <div class="input-group mb-2">
            <span class="input-group-text" id="testcode-lbl">Test Code</span>
            <input bind:value={testCodeInputValue} type="text" placeholder="practice2025" class="form-control" id="testcode" aria-describedby="testcode-lbl">
        </div>
        <label for="take-test">Make sure you can sign in to this email, or your test results will be lost!</label>
        <div>
            <button class="btn btn-primary" bind:this={takeTestBtn} onclick={previewTest} id="take-test">Submit</button>
        </div>
    </div>

    <div bind:this={page1} style="display: none">
        <h2>Wait! Before you start...</h2>
        <p>
            You have selected the test <b>{previewTestName}</b>.
            {#if previewTestLimEnabled}
                You have been given <b>{previewTestMins} minutes</b> to complete this test.
            {:else}
                There is no time limit for this test.
            {/if}
            There will be <b>{previewTestCount} questions</b>.
        </p>
        <p>
            When you begin, the timer will start. If you submit after the time limit, you will be marked as late and your final score may change. If you have any accommodations that apply, these can be taken into account.
        </p>
        <p>
            The questions will appear before you in order. Do not provide notes, extra commentary, or anything other than your exact answer in the answer boxes. This will cause your answer to be marked as <b>incorrect</b>. Include newlines, and ensure you do not leave any extra spaces or  tabs. <b>Capitalization matters</b>.
        </p>
        <p>
            You can bookmark the question, and at the end of the page, you will be notified of each bookmarked question. At that point, you may go back and change your answer.
        </p>
        <p>
            At the end of the page, you will be presented with icons for each question, that will tell you how many questions you've completed, and how many unresolved bookmarks you have. You can check how much time you have left, and if you have put an answer for every question, you can submit your test. At this point, your testing will conclude.
        </p>
        <p>
            Select <b>Begin</b> to begin testing, and start the timer.
        </p>
        <p>
            Select <b>Cancel</b> to cancel, and go back to the main menu.
        </p>
        <div class="button-group">
            <button class="btn btn-outline-secondary" onclick={takeTest}>Begin</button>
            <button class="btn btn-outline-primary" onclick={() => clearDocument()} >Cancel</button>
        </div>
    </div>

    <div bind:this={page2} style="display: none">
        <h2>Quiz</h2>
        <div>
            {#if !testQuestions || testQuestions.length == 0}
                <div>Please request a quiz first.</div>
            {:else}
                {#each testQuestions as question, index}
                    <div>
                        <TestQuestion bind:this={testQuestionEls[index]} questionString={question.questionString} descriptor={question.descriptor} />
                    </div>
                {/each}
                
            {/if}
        </div>
        <div class="button-group">
            <button class="btn btn-outline-primary" onclick={() => setPage(3)}>Review Answers</button>
        </div>
    </div>

    <div bind:this={page3} style="display: none">
        <h3>Review Your Answers</h3>
        <div>
            <div>{completeCount}/{totalCount} Completed</div>
            <div>{bookmarkCount} Bookmarked</div>
        </div>
        <button class="btn btn-primary" onclick={() => setPage(2)}>Go Back</button>
        <button class="btn btn-outline-primary" bind:this={submitTestBtn} onclick={submissionPopupOpen}>Submit</button>
    </div>
</div>

<Footer />