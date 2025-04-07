<script lang="ts">
    import { fetchToJsonMiddleware, sanitize } from "$lib/util";
    import { type Grade } from "$lib/grade";
    import type { Preset } from "$lib/preset";
    import { onMount } from "svelte";
    
    import "../admin.css"
    import "../quiz.css"
    
    import ConfigInputs from "../components/ConfigInputs.svelte";
    import DataDisplayTable from "../components/DataDisplayTable.svelte";
    import StudentGrade from "../components/StudentGrade.svelte";
    import Modal from "../components/modal/Modal.svelte";
    import SelectPresetModal from "../components/modal/SelectPresetModal.svelte";
    import { showNotifToast } from "$lib/popups";

    const googleFormHeader = [
        { key: "timestamp", name: "Timestamp" },
        { key: "email", name: "Email" },
        { key: "answerCode", name: "Answer Code" },
        { key: "rating", name: "Difficulty Rating" },
    ];

    const testProgramHeader = [
        { key: "time", name: "Start Time" },
        { key: "due", name: "Due Time" },
        { key: "email", name: "Email" },
        { key: "answerCode", name: "Answer Code" },
        { key: "idCookie", name: "ID Cookie" },
    ];

    let passwordInputValue: string = $state("");
    let signedIn: boolean = $state(true);
    let gradeStudentEmailInputValue: string = $state("");

    let googleFormTable: DataDisplayTable;
    let testProgramTable: DataDisplayTable;
    
    let graded: boolean = $state(true);
    let gradeData: Grade | undefined = $state(undefined);

    let enableTestingInputValue: boolean = $state(false);
    let enableTestingInputIsNew: boolean = $state(false);
    let enableTestingInputValueChanged: number = $state(0);
    let enableTimeLimitInputValue: boolean = $state(true);
    let enableTimeLimitInputIsNew: boolean = $state(false);
    let enableTimeLimitInputValueChanged: number = $state(0);
    let timeLimitInputValue: number = $state(40);
    let timeLimitInputIsNew: boolean = $state(false);
    let timeLimitInputValueChanged: number = $state(0);
    
    async function onSignIn() {
        googleFormTable.refresh();
        testProgramTable.refresh();

        enableTestingInputValue = Boolean(await getManualConfig("enableStudentTesting"));
        enableTestingInputValueChanged = Date.now();
        enableTimeLimitInputValue = Boolean(await getManualConfig("enableTimeLimit"));
        enableTimeLimitInputValueChanged = Date.now();
        timeLimitInputValue = Number(await getManualConfig("timeLimit"));
        timeLimitInputValueChanged = Date.now();

        resetPreset();
        
        setInterval(() => {
            const now = Date.now();

            // See how long ago
            if (enableTestingInputIsNew && (now - enableTestingInputValueChanged) >= 1000) {
                enableTestingInputIsNew = false;
                setManualConfig("enableStudentTesting", enableTestingInputValue, "boolean");
            }
            if (enableTimeLimitInputIsNew && (now - enableTimeLimitInputValueChanged) >= 1000) {
                enableTimeLimitInputIsNew = false;
                setManualConfig("enableTimeLimit", enableTimeLimitInputValue, "boolean");
            }
            if (timeLimitInputIsNew && (now - timeLimitInputValueChanged) >= 1000) {
                timeLimitInputIsNew = false;
                setManualConfig("timeLimit", timeLimitInputValue, "number");
            }
        }, 1000 * 2);
        
        // setInterval(async () => {
        //     const json = await fetch("./api/grading/notifications")
        //         .then(fetchToJsonMiddleware);
        //     const notifications: API_Response[] = json.data.notifications;
        //     notifications.forEach(notif => {
        //         showNotifToast(notif);
        //     });
        // }, 5000);
    }

    async function getPresetList(): Promise<string[] | undefined> {
        const response = await fetch("./api/grading/config/list_of_presets")
            .then(fetchToJsonMiddleware);

        if (response.success) {
            const presetList = response.data.presets;
            return presetList;
        } else {
            return undefined;
        }

    }

    async function getManualConfig(key: string) {
        const sanitizedKey = sanitize(key);
        const response = await fetch("./api/grading/manualConfig/" + sanitizedKey)
            .then(fetchToJsonMiddleware);

        return response.data.value;
    }

    async function setManualConfig(key: string, value: string | number | boolean, type: "string" | "number" | "boolean") {
        const sanitizedKey = sanitize(key);
        const sanitizedValue = sanitize(String(value));
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
            console.log("Grading data", json);
            
            if (success) {
                graded = true;
                gradeData = data.grade;
            } else {
                graded = false;
            }
        });
    }

    let resetPresetBtn: HTMLButtonElement;
    let savePresetBtn: HTMLButtonElement;
    let loadPresetBtn: HTMLButtonElement;
    let undoPresetBtn: HTMLButtonElement;
    let saveConfigBtn: HTMLButtonElement;

    let preset: Preset | undefined = $state(undefined);
    let presetEl: ConfigInputs;
    async function resetPreset() {
        resetPresetBtn.disabled = true;
        const json = await fetch("./api/grading/config/get_preset_default")
            .then(fetchToJsonMiddleware);
        
        const { success, data } = json;
        if (success) {
            preset = data.preset;
        }
        resetPresetBtn.disabled = false;
    }

    async function savePreset() {
        savePresetBtn.disabled = true;
        const preset: Preset = presetEl.getPresetValue();
        const presetList: string[] | undefined = await getPresetList();
        if (presetList === undefined) {
            savePresetBtn.disabled = false;
            return;
        }

        selectPresetModal.show(presetList, async (success, message, category, value) => {
            showNotifToast({ success, message });

            if (success) {
                await fetch("./api/grading/config/set_preset", {
                    method: "POST",
                    body: JSON.stringify({
                        presetName: value,
                        preset: preset,
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(fetchToJsonMiddleware);
            }
            savePresetBtn.disabled = false;
        });
    }

    async function loadPreset() {
        loadPresetBtn.disabled = true;

        const presetList: string[] | undefined = await getPresetList();
        if (presetList === undefined) {
            return;
        }
        selectPresetModal.show(presetList, async (success, message, category, value) => {
            if (success) {
                if (category != "pre") {
                    showNotifToast({ success: false, message: `Can only load from a pre-existing preset- attempted to load from a ${category} preset.`})
                } else {
                    const json = await fetch(`./api/grading/config/get_preset/${value}`)
                        .then(fetchToJsonMiddleware);

                    if (json.success) {
                        preset = JSON.parse(json.data.preset.blob);
                    }
                }
            }
        });
        
        loadPresetBtn.disabled = false;
    }

    async function undoPreset() {
        undoPresetBtn.disabled = true;

        const json = await fetch("./api/grading/config/get_config")
            .then(fetchToJsonMiddleware);
        
        if (json.success) {
            preset = JSON.parse(json.data.preset.blob);
        }

        undoPresetBtn.disabled = false;
    }

    async function saveConfig() {
        saveConfigBtn.disabled = true;
        const preset: Preset = presetEl.getPresetValue();

        const json = await fetch("./api/grading/config/set_config", {
            method: "POST",
            body: JSON.stringify({ preset }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(fetchToJsonMiddleware);
        saveConfigBtn.disabled = false;
    }

    let showSelectPresetModal: boolean = $state(false);
    let selectPresetModal: SelectPresetModal;

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

<SelectPresetModal bind:this={selectPresetModal} />

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
                        <input oninput={() => {
                            enableTestingInputValueChanged = Date.now();
                            enableTestingInputIsNew = true;
                        }} bind:checked={enableTestingInputValue} class="form-check-input" type="checkbox" id="enable-testing">
                        <label class="form-check-label" for="enable-testing">
                            Enable student testing
                        </label>
                    </div>

                    <div class="form-check" data-tippy-content="If enabled, from the time a student requests a quiz, they only have a certain amount of time provided to submit their results before it becomes invalid. Students can still submit late answers, but the grading system will notify you.">
                        <input oninput={() => {
                            enableTimeLimitInputValueChanged = Date.now();
                            enableTimeLimitInputIsNew = true;
                        }} bind:checked={enableTimeLimitInputValue} class="form-check-input" type="checkbox" id="enable-time-lim">
                        <label class="form-check-label" for="enable-time-lim">
                            Enable time limit
                        </label>
                    </div>

                    <div class="input-group">
                        <span class="input-group-text" id="basic-addon1">Time limit</span>
                        <input oninput={() => {
                            timeLimitInputValueChanged = Date.now();
                            timeLimitInputIsNew = true;
                        }} bind:value={timeLimitInputValue} type="number" id="time-lim" class="form-control" aria-label="Username"
                            aria-describedby="basic-addon1">
                        <span class="input-group-text" id="basic-addon1">minutes</span>
                    </div>

                    <button class="btn btn-primary mt-2" id="configure-test-submission-refresh" data-tippy-content="Save changes to student testing, and time limit.">Update</button>
                </div>

                <div class="p-3">
                    <h3>Configure test contents</h3>

                    <div class="btn-group mb-2">
                        <button bind:this={savePresetBtn} onclick={savePreset} type="button" class="btn btn-outline-secondary" data-tippy-content="Save the below configuration values to a given preset, either new or pre-existing.">Save
                            to preset</button>
                        <button bind:this={loadPresetBtn} onclick={loadPreset} id="load-preset" type="button" class="btn btn-outline-secondary" data-tippy-content="Set the below configuration values to the values of a given pre-existing preset.">Load
                            from preset</button>
                        <button bind:this={resetPresetBtn} onclick={resetPreset} type="button" class="btn btn-outline-secondary" data-tippy-content="Set the below configuration values to the values of the hard-coded default preset.">Load
                            from default</button>
                        <button bind:this={undoPresetBtn} onclick={undoPreset} id="undo-preset" type="button" class="btn btn-outline-secondary" data-tippy-content="Set the below configuration values to the values currently in use by the server.">Load from current</button>
                    </div>

                    {#if preset !== undefined}
                        <ConfigInputs bind:this={presetEl} preset={preset} />
                    {:else}
                        <p>Loading Presets...</p>
                    {/if}

                    <div class="btn-group mb-2">
                        <button bind:this={saveConfigBtn} onclick={saveConfig} id="save-config" type="button" class="btn btn-primary" data-tippy-content="Sets the configuration that new tests are created with to the above configuration values.">Set
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

                <DataDisplayTable row_heads={googleFormHeader} name="Google form table" url="./api/grading/google_form" bind:this={googleFormTable} />
                <DataDisplayTable row_heads={testProgramHeader} name="Quiz submissions table" url="./api/grading/test_program" bind:this={testProgramTable} />

            </div>
            <div class="tab-pane fade" id="nav-p3" role="tabpanel" aria-labelledby="nav-p3-tab">

                <div class="p-3">
                    <h4>Grade student by email</h4>
                    <div class="input-group">
                        <span class="input-group-text">Student Email</span>
                        <input bind:value={gradeStudentEmailInputValue} type="text" class="form-control" id="student-to-grade" autocomplete="off">
                        <button onclick={gradeStudent} class="btn btn-outline-primary" type="button" id="grade-student">Search</button>
                    </div>

                    {#if graded && gradeData !== undefined}
                        <StudentGrade grade={gradeData!}/>
                    {/if}
                </div>

            </div>
        </div>

    </div>

</div>
