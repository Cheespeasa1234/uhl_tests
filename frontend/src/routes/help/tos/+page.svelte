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
        <h2>Terms of Service</h2>
        <a href="/help"
            ><button class="btn btn-outline-secondary mb-4">Back</button></a
        >
        <p><strong>1. Acceptance of Terms</strong></p>
        <p>
            By accessing or using our services, you agree to comply with and be
            bound by these Terms of Service. If you do not agree to these terms,
            you may not use our services.
        </p>

        <p><strong>2. Prohibited Activities</strong></p>
        <p>You agree not to engage in any of the following activities:</p>
        <ul>
            <li>
                <strong>Cheating</strong>: Using any method to gain an unfair
                advantage in our services.
            </li>
            <li>
                <strong>Exploits</strong>: Taking advantage of bugs, glitches,
                or vulnerabilities in our services.
            </li>
            <li>
                <strong>Distributing Methods of Cheating</strong>: Sharing,
                selling, or distributing methods, tools, or information that
                enable cheating or exploits.
            </li>
        </ul>

        <p><strong>3. Privacy Policy</strong></p>
        <p>
            Your use of our services is also governed by our <a
                href="/help/privacy">Privacy Policy</a
            >, which is incorporated by reference into these Terms of Service.
            By using our services, you consent to the collection, use, and
            disclosure of your information as described in our Privacy Policy.
        </p>

        <p><strong>4. Tracking and Monitoring</strong></p>
        <p>
            You acknowledge that we may track and monitor your activities on our
            services to:
        </p>
        <ul>
            <li>Prevent cheating and exploits.</li>
            <li>Administer and improve our services.</li>
            <li>Ensure compliance with these Terms of Service.</li>
        </ul>

        <p><strong>5. Termination</strong></p>
        <p>
            We reserve the right to terminate or suspend your access to our
            services at any time, without notice, for any reason, including but
            not limited to a violation of these Terms of Service.
        </p>

        <p><strong>6. Changes to Terms of Service</strong></p>
        <p>
            We reserve the right to modify these Terms of Service at any time.
            Your continued use of our services after any such changes
            constitutes your acceptance of the new Terms of Service.
        </p>

        <p><strong>7. Governing Law</strong></p>
        <p>
            These Terms of Service shall be governed and construed in accordance
            with the laws of New Jersey, without regard to its conflict of law
            provisions.
        </p>

        <p><strong>8. Contact Information</strong></p>
        <p>
            If you have any questions about these Terms of Service, please
            contact us at <a href="mailto:natelevison@gmail.com"
                >natelevison@gmail.com</a
            >.
        </p>
    </div>
</div>
