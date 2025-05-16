<script>
    import Faq from "../../components/faq/Faq.svelte";
    import FaqAnswer from "../../components/faq/FaqAnswer.svelte";
    import FaqEntry from "../../components/faq/FaqEntry.svelte";
    import FaqQuestion from "../../components/faq/FaqQuestion.svelte";

</script>

<svelte:head>
    <title>Help for Students | Uhl Tests</title>
</svelte:head>

<div style="margin: auto; margin-top: 20px; width: 800px;">
    <div class="row justify-content-center">
        <h2>Student Help</h2>
        <a href="/help"><button class="btn btn-outline-secondary mb-4">Back</button></a>
        <section>
            <h3 class="mb-4">Taking a test</h3>
            <p>
                Taking a test is rather simple. After signing in, open the Take Test page. You will be asked for a test code. This test code can either be the practice code, or a secret code your teacher shares with you right before the test. This code is associated with a given test type and setting, so make sure to use the right one if you want it graded.
            </p>
            <p>
                Once you fill in the form and agree to not cheat, you will be given some information about what the test will contain. Here is what it will say:
            </p>
            <div class="d-flex mb-4">
                <div style="background-color: #8d8d8d; width: 15px; margin-right: 10px; border-radius: 5px;"></div>
                <p class="text-muted fst-italic mb-0">
                    You have selected the test (<b>TEST NAME</b>). You have been given (<b>TIME LIMIT</b>) minutes to complete this test. There will be (<b>NUMBER OF QUESTIONS</b>) questions.
                    <br>
                    <br>
                    When you begin, the timer will start. If you submit after the time limit, you will be marked as late and your final score may change. If you have any accommodations that apply, these can be taken into account.
                    <br>
                    <br>
                    The questions will appear before you in order. Do not provide notes, extra commentary, or anything other than your exact answer in the answer boxes. This will cause your answer to be marked as incorrect. Include newlines, and ensure you do not leave any extra spaces or tabs. Capitalization matters.
                    <br>
                    <br>
                    You can bookmark the question, and at the end of the page, you will be notified of each bookmarked question. At that point, you may go back and change your answer.
                    <br>
                    <br>
                    At the end of the page, you will be presented with icons for each question, that will tell you how many questions you've completed, and how many unresolved bookmarks you have. You can check how much time you have left, and if you have put an answer for every question, you can submit your test. At this point, your testing will conclude.
                    <br>
                    <br>
                    Select Begin to begin testing, and start the timer.
                    <br>
                    <br>
                    Select Cancel to cancel, and go back to the main menu.
                </p>
            </div>
            <p>
                You can then confirm and move on to taking the test. You will see all the questions in a list and you should start answering them. There is a prompt and a stimulus (the piece of code to analyze), and you need to type your answer in the blank text box for each question.
            </p>
            <p>
                When you are done, go to the bottom and submit. You will be presented with a confirmation page to decide whether or not you really want to submit. If you confirm, your test will be submitted and you will be sent back to the home page.
            </p>
        </section>
        <section>
            <Faq>
                <FaqEntry>
                    <FaqQuestion>How do I log in?</FaqQuestion>
                    <FaqAnswer>You can log in by going to the Home page, where you will be prompted to sign in with google. If you are taking this test as a member of an organization, use that email.</FaqAnswer>
                </FaqEntry>
                <FaqEntry>
                    <FaqQuestion>Are my answers saved?</FaqQuestion>
                    <FaqAnswer>Your answers will be saved if you close the tab or anything like that. However, the timer will continue, and your most recently synced answers will be submitted if the timer runs out.</FaqAnswer>
                </FaqEntry>
                <FaqEntry>
                    <FaqQuestion>How do I practice?</FaqQuestion>
                    <FaqAnswer>There is a practice exam using the test code <code>practice2025</code>. When you go to take a test, you can select this test code.</FaqAnswer>
                </FaqEntry>
                <FaqEntry>
                    <FaqQuestion>What is the PHHS Testing Code of Conduct?</FaqQuestion>
                    <FaqAnswer>It basically just means you agree to not cheat, to play fair, and that you could get in some trouble if you are caught manipulating the system. And by the way, if you actually need to cheat on this testing program, just study, bro. It's not that hard.</FaqAnswer>
                </FaqEntry>
                <FaqEntry>
                    <FaqQuestion>Where can I learn about how this works?</FaqQuestion>
                    <FaqAnswer>You can read up on the <a href="https://github.com/Cheespeasa1234/uhl_tests">GitHub</a> page, which is the repository where all the source code for this project is stored. This means this project is fully open sourced, and it uses the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Public License.</FaqAnswer>
                </FaqEntry>
            </Faq>
        </section>
    </div>
</div>