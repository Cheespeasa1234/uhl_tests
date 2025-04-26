<script lang="ts">
    import { getJSON, postJSON, sanitize, type API_Response, getPresetList } from "$lib/util";
    import { type Grade, type Preset, type PresetListEntry, type Test } from "$lib/types";
    import { onMount } from "svelte";
    
    import "../admin.css"
    import "../quiz.css"
    
    import ConfigInputs from "../components/ConfigInputs.svelte";
    import DataDisplayTable from "../components/DataDisplayTable.svelte";
    import StudentGrade from "../components/StudentGrade.svelte";
    import Modal from "../components/modal/Modal.svelte";
    import SelectPresetModal from "../components/modal/SelectPresetModal.svelte";
    import { showNotifToast } from "$lib/popups";
    import TestCodeInputs from "../components/TestCodeInputs.svelte";

    // The first row of a table of the google form.
    const googleFormHeader = [
        { key: "timestamp", name: "Timestamp" },
        { key: "email", name: "Email" },
        { key: "answerCode", name: "Answer Code" },
        { key: "rating", name: "Difficulty Rating" },
    ];

    // The first row of a table of the student responses.
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
    
    // Run when access is granted to the administrator panel, after mount
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
        resetTestCodes();
        
        setInterval(() => {
            const now = Date.now();

            // If it has been 1000ms since any of the config inputs were changed, send the change to the server
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
        
        // // Every 5000ms, check the notifications and show them.
        // setInterval(async () => {
        //     const json = await fetch("./api/grading/notifications")
        //         .then(fetchToJsonMiddleware);
        //     const notifications: API_Response[] = json.data.notifications;
        //     notifications.forEach(notif => {
        //         showNotifToast(notif);
        //     });
        // }, 5000);
    }

    // Get the global configuration values from the server
    async function getManualConfig(key: string) {
        const sanitizedKey = sanitize(key);
        const response = await getJSON("./api/grading/manualConfig/" + sanitizedKey)

        return response.data.value;
    }

    // Set a configuration value to the server
    async function setManualConfig(key: string, value: string | number | boolean, type: "string" | "number" | "boolean") {
        const sanitizedKey = sanitize(key);
        const sanitizedValue = sanitize(String(value));
        const sanitizedType = sanitize(type);
        const response = await postJSON("./api/grading/manualConfig/", {
            key: sanitizedKey,
            value: sanitizedValue,
            type: sanitizedType,
        });
    }

    // When the LOGIN button is pressed
    function loginButtonClick() {
        postJSON("./api/grading/get_session_id", {
            pass: passwordInputValue,
        }).then(json => {
            const { success } = json;
            signedIn = success;
            if (success) {
                onSignIn();
            }
        });
    }

    // When the grade student button is pressed
    async function gradeStudent() {
        getJSON("./api/grading/grade/" + gradeStudentEmailInputValue)
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

    let resetTestCodesBtn: HTMLButtonElement;
    let saveTestCodesBtn: HTMLButtonElement;

    // Set the value of the preset in the component when the preset value changes
    let presetEl: ConfigInputs;
    let preset: Preset | undefined = $state(undefined);
    $effect(() => {
        if (preset !== undefined) {
            presetEl.setPresetValue(preset);
        }
    });

    let testListEl: TestCodeInputs;
    let testList: Test[] | undefined = $state(undefined);
    
    // Get the default preset
    async function resetPreset() {
        resetPresetBtn.disabled = true;
        const json = await getJSON("./api/grading/config/get_preset_default");
        const { success, data } = json;
        if (success) {
            preset = data.preset;
        }
        resetPresetBtn.disabled = false;
    }

    async function resetTestCodes() {
        resetTestCodesBtn.disabled = true;
        const json = await getJSON("./api/grading/config/testcodes");
        const { success, data } = json;
        if (success) {
            testList = data.tests;
            testListEl.setTestListValue(testList!);
        }
        resetTestCodesBtn.disabled = false;
    }

    async function saveTestCodes() {
        console.log("Test List:", testList);
        const json = await postJSON("./api/grading/config/update_testcodes", {
            testCodes: testList
        });
    }

    async function newTestCode() {
        const json = await getJSON("./api/grading/config/new_testcode");
        console.log(json.data.test);
        testList?.push(json.data.test);
        testListEl.setTestListValue(testList!);
    }

    // Save the config to a new preset
    async function savePreset() {
        savePresetBtn.disabled = true;
        
        const preset: Preset | undefined = presetEl.getPresetValue();
        if (preset === undefined) {
            savePresetBtn.disabled = false;
            showNotifToast({ success: false, message: "Preset is undefined."});
            return;
        }
        
        const presetList: PresetListEntry[] | undefined = await getPresetList();
        if (presetList === undefined) {
            savePresetBtn.disabled = false;
            showNotifToast({ success: false, message: "Preset list is undefined."});
            return;
        }

        selectPresetModal.show(presetList, async (success, message, category, value, presetData) => {
            showNotifToast({ success, message });

            if (success) {
                if (category === "new") {
                    if (!presetData || !presetData.name || !presetData.id) {
                        showNotifToast({ success: false, message: "Something went wrong" });
                        return;
                    }
                    const p = preset;
                    p.name = presetData.name;
                    await postJSON("./api/grading/config/new_preset", {
                        preset: p,
                    });
                } else if (category === "pre") {
                    await postJSON("./api/grading/config/set_preset", {
                        preset: preset,
                    });
                }
            }
            savePresetBtn.disabled = false;
        });
    }

    // Load the config of a preset into the component
    async function loadPreset() {
        loadPresetBtn.disabled = true;

        const presetList: PresetListEntry[] | undefined = await getPresetList();
        if (presetList === undefined) {
            return;
        }
        selectPresetModal.show(presetList, async (success, message, category, value) => {
            if (success) {
                if (category != "pre") {
                    showNotifToast({ success: false, message: `Can only load from a pre-existing preset- attempted to load from a ${category} preset.`})
                } else {
                    const json = await getJSON(`./api/grading/config/get_preset/${value}`);

                    if (json.success) {
                        preset = json.data.preset;
                    }
                }
            }
        });
        
        loadPresetBtn.disabled = false;
    }

    // Set the values of the preset component to the values the server is currently using
    // async function undoPreset() {
    //     undoPresetBtn.disabled = true;

    //     const { success, data }: API_Response = await getJSON("./api/grading/config/get_config");
        
    //     try {
    //         if (success) {
    //             preset = data.preset;
    //         }
    //     } catch (e) {
    //         console.error(e);
    //     }

    //     undoPresetBtn.disabled = false;
    // }

    // Set the config on the server to the config values in the component
    // async function saveConfig() {
    //     saveConfigBtn.disabled = true;
    //     const preset: Preset | undefined = presetEl.getPresetValue();

    //     if (preset === undefined) {
    //         saveConfigBtn.disabled = false;
    //         showNotifToast({ success: false, message: "Preset is undefined, can not save." });
    //         return;
    //     }

    //     await postJSON("./api/grading/config/set_config", { preset: preset });
    //     saveConfigBtn.disabled = false;
    // }

    let showSelectPresetModal: boolean = $state(false);
    let selectPresetModal: SelectPresetModal;

    onMount(() => {
        getJSON("./api/grading/am_i_signed_in")
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

<div id="adminelements" class="container-fluid h-100 { signedIn ? '' : 'd-none' }">
    <!-- <div class="row h-100" style="height: 100vh;"> -->

    <nav class="mt-2">
        <ul class="nav nav-tabs" id="nav-tab" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="nav-p1-tab" data-bs-toggle="tab" data-bs-target="#nav-p1"
                    type="button" role="tab" aria-controls="nav-p1" aria-selected="true">
                    Configure Test
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="nav-p2-tab" data-bs-toggle="tab" data-bs-target="#nav-p2"
                    type="button" role="tab" aria-controls="nav-p2" aria-selected="false">
                    View Status
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="nav-p3-tab" data-bs-toggle="tab" data-bs-target="#nav-p3"
                    type="button" role="tab" aria-controls="nav-p3" aria-selected="false">
                    Grade Tests
                </button>
            </li>
        </ul>
    </nav>
        <div class="tab-content col border border-1 p-2" id="nav-tabContent">
            <div style="width: fit-content" class="tab-pane fade show active" id="nav-p1" role="tabpanel"
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
                </div>

                <div class="p-3">
                    <h3>Configure test contents</h3>

                    <div class="btn-group mb-2">
                        <button bind:this={savePresetBtn} onclick={savePreset} type="button" class="btn btn-outline-secondary" data-tippy-content="Save the below configuration values to a given preset, either new or pre-existing.">Save
                            to preset</button>
                        <button bind:this={loadPresetBtn} onclick={loadPreset} type="button" class="btn btn-outline-secondary" data-tippy-content="Set the below configuration values to the values of a given pre-existing preset.">Load
                            from preset</button>
                        <button bind:this={resetPresetBtn} onclick={resetPreset} type="button" class="btn btn-outline-secondary" data-tippy-content="Set the below configuration values to the values of the hard-coded default preset.">Load
                            from default</button>
                        <!-- <button bind:this={undoPresetBtn} onclick={undoPreset} type="button" class="btn btn-outline-secondary" data-tippy-content="Set the below configuration values to the values currently in use by the server.">Load from current</button> -->
                    </div>

                    {#if preset !== undefined}
                        <ConfigInputs bind:this={presetEl} />
                    {:else}
                        <p>Loading Presets...</p>
                    {/if}

                    <!-- <div class="btn-group mb-2">
                        <button bind:this={saveConfigBtn} onclick={saveConfig} id="save-config" type="button" class="btn btn-primary" data-tippy-content="Sets the configuration that new tests are created with to the above configuration values.">Set
                            configuration</button>
                    </div> -->
                </div>

                <div class="p-3">
                    <h3>Configure Test Codes</h3>
                    
                    <div class="btn-group mb-2">
                        <button onclick={saveTestCodes} type="button" class="btn btn-outline-secondary" data-tippy-content="Save the below test code values to the server.">Save changes</button>
                        <button bind:this={resetTestCodesBtn} type="button" class="btn btn-outline-secondary" data-tippy-content="Resets changes to the test codes.">Undo changes</button>
                    </div>

                    <div class="btn-group mb-2">
                        <button onclick={newTestCode} type="button" class="btn btn-outline-secondary" data-tippy-content="Create a brand new test code.">New test code</button>
                    </div>
                    
                    <TestCodeInputs bind:this={testListEl} />
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

    <!-- </div> -->

</div>
