<script lang="ts">
    import { fetchToJsonMiddleware, type API_Response } from "$lib/util";
    import { showNotifToast } from "$lib/popups";
    import { sanitize } from "$lib/util";
    import { onMount } from "svelte";
    import { type Grade } from "$lib/grade";

    import "../admin.css"
    import "../quiz.css"

    import DataDisplayTable from "./DataDisplayTable.svelte";
    import StudentGrade from "./StudentGrade.svelte";

    let passwordInputValue: string = $state("");
    let signedIn: boolean = $state(true);
    let gradeStudentEmailInputValue: string = $state("");

    let googleFormTable: DataDisplayTable;
    let testProgramTable: DataDisplayTable;
    
    let graded: boolean = $state(true);
    let gradeData: Grade | undefined = $state(undefined);

    async function onSignIn() {
        googleFormTable.refresh();
        testProgramTable.refresh();

        setInterval(async () => {
            const json = await fetch("./api/grading/notifications")
                .then(fetchToJsonMiddleware);
            const notifications: API_Response[] = json.data.notifications;
            notifications.forEach(notif => {
                showNotifToast(notif);
            });
        }, 5000);
    }

    async function getPresetList(): Promise<string[]> {
        const response = await fetch("./api/grading/config/list_of_presets")
            .then(fetchToJsonMiddleware);

        const presetList = response.data.presets;
        return presetList;
    }

    async function getManualConfig(key: string) {
        const sanitizedKey = sanitize(key);
        const response = await fetch("./api/grading/manualConfig/" + sanitizedKey)
            .then(fetchToJsonMiddleware);

        return response.data.value;
    }

    async function setManualConfig(key: string, value: string, type: string) {
        const sanitizedKey = sanitize(key);
        const sanitizedValue = sanitize(value);
        const sanitizedType = sanitize(type);
        const response = await fetch("./api/grading/manualConfig/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key: sanitizedKey,
                value: sanitizedValue,
                type: sanitizedType,
            }),
        }).then(fetchToJsonMiddleware);
    }

    function loginButtonClick() {
        fetch("./api/grading/get_session_id", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                pass: passwordInputValue,
            }),
        }).then(fetchToJsonMiddleware).then(json => {
            const { success } = json;
            signedIn = success;
            if (success) {
                onSignIn();
            }
        });
    }

    async function gradeStudent() {
        fetch("./api/grading/grade/" + gradeStudentEmailInputValue)
        .then(fetchToJsonMiddleware)
        .then(json => {
            const { success, data } = json;
            
            if (success) {
                graded = true;
                gradeData = data.grade;
            } else {
                graded = false;
            }
        });
    }

    onMount(() => {
        fetch("./api/grading/am_i_signed_in")
        .then(fetchToJsonMiddleware)
        .then(json => {
            const { success } = json;
            signedIn = success;
            if (success) {
                onSignIn();
            }
        });
    });
</script>

<div class="modal" tabindex="-1" id="modal" data-bs-backdrop="static">
    <div class="modal-dialog d-none" id="selectPresetModalDialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Select a preset</h5>
            </div>
            <div class="modal-body">
                <ul class="nav nav-tabs" id="selectPresetTabsList" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="selectPresetPreTab" data-bs-toggle="tab"
                            data-bs-target="#preTab" type="button" role="tab" aria-controls="preTab"
                            aria-selected="true" data-tippy-content="A preset that has already been saved in the system">Pre-existing</button>

                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="selectPresetNewTab" data-bs-toggle="tab"
                            data-bs-target="#newTab" type="button" role="tab" aria-controls="newTab"
                            aria-selected="false" data-tippy-content="A new preset that will be created with the given name">New</button>

                    </li>
                </ul>
                <div class="tab-content" id="selectPresetTabsContent">
                    <div class="tab-pane fade show active" id="preTab" role="tabpanel"
                        aria-labelledby="selectPresetPreTab">
                        <select class="form-select" aria-label="Select a pre-existing preset to use"
                            id="selectPresetModalPreExistInput">
                        </select>
                    </div>

                    <div class="tab-pane fade" id="newTab" role="tabpanel" aria-labelledby="selectPresetNewTab">
                        <div class="input-group">
                            <span class="input-group-text col-sm-6" id="selectPresetModalNameLabel">Name</span>
                            <input type="text" class="form-control" id="selectPresetModalNameInput"
                                aria-describedby="selectPresetModalNameLabel">
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="selectPresetOkayBtn">Okay</button>
                <button type="button" class="btn btn-secondary" id="selectPresetCancelBtn">Cancel</button>
            </div>
        </div>
    </div>

    <div class="modal-dialog d-none" id="selectPresetOnlyPreModalDialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Select a preset</h5>
            </div>
            <div class="modal-body">
                <div class="tab-pane fade show active" id="preTab" role="tabpanel"
                    aria-labelledby="selectPresetPreTab">
                    <select class="form-select" aria-label="Select a pre-existing preset to use"
                        id="selectPresetModalPreExistInput">
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary okaybtn" data-bs-dismiss="modal">Okay</button>
                <button type="button" class="btn btn-secondary notokaybtn" data-bs-dismiss="modal">Cancel</button>
            </div>
        </div>
    </div>

    <div class="modal-dialog d-none" id="oopsModalDialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Oops!</h5>
            </div>
            <div class="modal-body">
                <div id="oopsModalBody">
                    Information goes here.
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="oopsOkayBtn">Okay</button>
            </div>
        </div>
    </div>

    <div class="modal-dialog d-none" id="confirmationModalDialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Are you sure?</h5>
            </div>
            <div class="modal-body">
                <div id="confirmationModalMessage">
                    Some information goes here.
                </div>
                <div id="confirmationModalMessage2">
                    More information goes here.
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="confirmationOkayBtn">Okay</button>
            </div>
        </div>
    </div>
</div>

<div id="admin-signin" class="container-fluid border border-2 { signedIn ? 'd-none' : '' }">
    <h3 class="float-none w-auto">Admin Sign In</h3>
    <div>
        <label for="password" class="form-label">Password</label>
        <input bind:value={passwordInputValue} type="password" id="password" class="form-control">
        <button onclick={loginButtonClick} id="login">Login</button>
    </div>
</div>

<div id="adminelements" class="container-fluid h-100 border border-2 border-red { signedIn ? '' : 'd-none' }">
    <div class="row h-100">

        <nav class="col-sm-2 border border-1 rounded m-1 p-1">
            <div class="nav nav-pills flex-column" id="nav-tab" role="tablist">
                <button class="nav-link active" id="nav-p1-tab" data-bs-toggle="tab" data-bs-target="#nav-p1"
                    type="button" role="tab" aria-controls="nav-home" aria-selected="true">Configure
                    Test</button>
                <button class="nav-link" id="nav-p2-tab" data-bs-toggle="tab" data-bs-target="#nav-p2" type="button"
                    role="tab" aria-controls="nav-profile" aria-selected="false">View
                    Status</button>
                <button class="nav-link" id="nav-p3-tab" data-bs-toggle="tab" data-bs-target="#nav-p3" type="button"
                    role="tab" aria-controls="nav-contact" aria-selected="false">Grade
                    Tests</button>
            </div>
        </nav>

        <div class="tab-content col border border-1 rounded m-1 p-2" id="nav-tabContent">
            <div style="width: 50%" class="tab-pane fade show active" id="nav-p1" role="tabpanel"
                aria-labelledby="nav-p1-tab">

                <div class="p-3">
                    <h3>Configure test submission</h3>
                    <div class="form-check" data-tippy-content="If enabled, students will be able to access the student portal, take tests, and submit their results.">
                        <input class="form-check-input" type="checkbox" value="" id="enable-testing">
                        <label class="form-check-label" for="enable-testing">
                            Enable student testing
                        </label>
                    </div>

                    <div class="form-check" data-tippy-content="If enabled, from the time a student requests a quiz, they only have a certain amount of time provided to submit their results before it becomes invalid. Students can still submit late answers, but the grading system will notify you.">
                        <input class="form-check-input" type="checkbox" value="" id="enable-time-lim">
                        <label class="form-check-label" for="enable-time-lim">
                            Enable time limit
                        </label>
                    </div>

                    <div class="input-group">
                        <span class="input-group-text" id="basic-addon1">Time limit</span>
                        <input type="number" value="40" id="time-lim" class="form-control" aria-label="Username"
                            aria-describedby="basic-addon1">
                        <span class="input-group-text" id="basic-addon1">minutes</span>
                    </div>

                    <button class="btn btn-primary mt-2" id="configure-test-submission-refresh" data-tippy-content="Save changes to student testing, and time limit.">Update</button>
                </div>

                <div class="p-3">
                    <h3>Configure test contents</h3>

                    <div class="btn-group mb-2">
                        <button id="save-preset" type="button" class="btn btn-outline-secondary" data-tippy-content="Save the below configuration values to a given preset, either new or pre-existing.">Save
                            to preset</button>
                        <button id="load-preset" type="button" class="btn btn-outline-secondary" data-tippy-content="Set the below configuration values to the values of a given pre-existing preset.">Load
                            from preset</button>
                        <button id="reset-preset" type="button" class="btn btn-outline-secondary" data-tippy-content="Set the below configuration values to the values of the hard-coded default preset.">Load
                            from default</button>
                        <button id="undo-preset" type="button" class="btn btn-outline-secondary" data-tippy-content="Set the below configuration values to the values currently in use by the server.">Load from current</button>
                    </div>

                    <div id="config-area">

                    </div>

                    <div class="btn-group mb-2">
                        <button id="save-config" type="button" class="btn btn-primary" data-tippy-content="Sets the configuration that new tests are created with to the above configuration values.">Set
                            configuration</button>
                    </div>
                </div>

                <div class="p-3">
                    <h3>Configure Test Codes</h3>
                    
                    <div class="btn-group mb-2">
                        <button id="save-test-code-config" type="button" class="btn btn-outline-secondary" data-tippy-content="Save the below test code values to the server.">Save changes</button>
                        <button id="reset-test-code-config" type="button" class="btn btn-outline-secondary" data-tippy-content="Set the below test code values to the values stored on the server.">Undo changes</button>
                    </div>
                    
                    <div id="test-code-config-area">

                    </div>
                    
                    <button id="reset-test-code-config" class="btn btn-secondary" data-tippy-content="Resets all your changes to the test codes.">Reset</button>
                </div>

            </div>
            <div class="tab-pane fade" id="nav-p2" role="tabpanel" aria-labelledby="nav-p2-tab">

                <DataDisplayTable name="Google form table" url="./api/grading/google_form" bind:this={googleFormTable} />
                <DataDisplayTable name="Quiz submissions table" url="./api/grading/test_program" bind:this={testProgramTable} />

            </div>
            <div class="tab-pane fade" id="nav-p3" role="tabpanel" aria-labelledby="nav-p3-tab">

                <div class="p-3">
                    <h4>Grade student by email</h4>
                    <div class="input-group">
                        <span class="input-group-text">Student Email</span>
                        <input bind:value={gradeStudentEmailInputValue} type="text" class="form-control" id="student-to-grade" autocomplete="off">
                        <button onclick={gradeStudent} class="btn btn-outline-primary" type="button" id="grade-student">Search</button>
                    </div>

                    {#if graded}
                        <StudentGrade grade={gradeData!}/>
                    {/if}
                </div>

            </div>
        </div>

    </div>

</div>
