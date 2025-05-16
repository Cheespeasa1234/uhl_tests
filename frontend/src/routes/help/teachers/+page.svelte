<script>

    import Faq from "../../components/faq/Faq.svelte";
    import FaqAnswer from "../../components/faq/FaqAnswer.svelte";
    import FaqEntry from "../../components/faq/FaqEntry.svelte";
    import FaqQuestion from "../../components/faq/FaqQuestion.svelte";

    import DemoBtn from "../../components/DemoBtn.svelte";

</script>

<svelte:head>
    <title>Help for Teachers | Uhl Tests</title>
</svelte:head>

<div style="margin: auto; margin-top: 20px; width: 800px;">
    <div class="row justify-content-center">
        <h2>Teacher Help</h2>
        <a href="/help"><button class="btn btn-outline-secondary mb-4">Back</button></a>
        <section>
            <h3 class="mb-4">Logging in to the admin portal</h3>
            <p>
                First, log into the admin portal. Navigate to /admin, and enter the correct password. It will then authenticate you and give you access to the admin panel.
            </p>
            <p>
                Sometimes, if you go inactive for a very long time, you will be logged out. You can tell this if the toast messages on the top right say <code>Invalid session id</code>, or anything similar. In this case, you should refresh, and enter the password again.
            </p>
        </section>

        <section>
            <h3 class="mb-4">Configure Test Submission</h3>
            <p>
                This tab of the admin panel allows you to configure how the tests behave and provides all the configuration options available to the administrator. This page has three sections.
            </p>
            <p>
                The <b>Configure test submission</b> section is for general testing options, that apply globally. <i>Enable student testing</i> to allow students to start tests. They will still be able to submit if you disable it. <i>Time limit</i> is the amount of minutes from starting a test they will have to complete it. If they run out of time without voluntarily submitting their test, the test will be ended and their answers as they were will be submitted.
            </p>
            <p>
                The <b>Configure test contents</b> section is for managing <b>presets</b>. Presets are sets of configuration options that store how many of each question are in a quiz. Set the values of each question type as you see fit, then you can save, load, or load from default. To save to a preset, press <DemoBtn>Save to preset</DemoBtn>, and you will choose a preset to write the data to. To load a preset, press <DemoBtn>Load from preset</DemoBtn> your changes will be erased and set to the values of a given preset. To load from default, press <DemoBtn>Load from default</DemoBtn> it will load from the <code>DEFAULT</code> preset.
            </p>
            <p>
                For example, if you want to create a new preset that has one of each question, set each text box value to 1, press <DemoBtn>Save to preset</DemoBtn>, go to the new tab and give it a new name. Then, press okay and the data will be saved.
            </p>
            <p>
                The <b>Configure test codes</b> section is for managing <b>test codes</b>. Test codes are configurations for tests. Each type of test you want to operate for students are individually stored here. For each test code, you can enable or disable it, change the name, change the preset, or delete it. The <code>code</code> value is what students will type into their page to choose a test to take. The <code>preset</code> value is the amount of each question that will be part of each test. If you disable a code, students will be unable to start tests with it.
            </p>
            <p>
                To save changes to test codes, <b>you MUST press</b> <DemoBtn>Save Changes</DemoBtn>. Only then will the data for the test codes be saved. To reset changes, press <DemoBtn>Undo Changes</DemoBtn>, and your changes will be replaced with the previous data. To create a brand new test code, press <DemoBtn>New test code</DemoBtn>.
            </p>
        </section>

        <section>
            <h3 class="mb-4">View Status</h3>
            <p>
                Here, you can view a list of submissions currently stored in the database. You can use this as reference to determine what students to grade. Press <DemoBtn>Refresh</DemoBtn> to refresh the table.</p>
            <p>
                If there are too many submissions to fit on one page, you can press <DemoBtn>Previous</DemoBtn> or <DemoBtn>Next</DemoBtn> to move to the next page of entries. Use the arrows next to each column header to sort by that column, and more easily find relevant submissions.
            </p>
        </section>

        <section>
            <h3 class="mb-4">Grade Tests</h3>
            <p>
                The grading panel is where you can analyze student responses. In the input box, type in the full email of a student you want to grade- you can find some emails in the View Status panel.
            </p>
            <p>
                After typing in the email, press <DemoBtn>Search</DemoBtn>, and it will search for the student. It will preset the results for the most recent test that follows the following requirements:
            </p>
            <ol>
                <li>It must have a valid schema response</li>
                <li>The emails must match</li>
                <li>The time of submission must match</li>
                <li>The answer code must match</li>
            </ol>
            <p>
                Once it finds the most recent valid response, it will grade it and present it to you.
            </p>
            <p>
                The top of the grade result displays the email of the student, the amount of questions they got correct, and a percentage grade as well. Below this is some information about when they submitted their test, as well as when it was due for submission. Below this is some information about how much time was remaining when the student submitted their test. This is not factored into the grade at all.
            </p>
            <p>
                In the box, you will see the grade of the first question. It will tell you the question number, the prompt, and the code provided to the student. Below this are two boxes. The first box is what the student typed in as their response, and the second is what the computer says is the correct answer. If the left border is red on the first box, the answer is incorrect. There is also some text below this to tell you.
            </p>
            <p>
                On the left and right are buttons to scroll through the questions. Press the right arrow button to get the next question. This cycles through, so you can press right on the last question to get to the first.
            </p>
        </section>
        <section>
            <Faq>
                <FaqEntry>
                    <FaqQuestion>Question</FaqQuestion>
                    <FaqAnswer>Answer</FaqAnswer>
                </FaqEntry>
            </Faq>
        </section>
    </div>
</div>