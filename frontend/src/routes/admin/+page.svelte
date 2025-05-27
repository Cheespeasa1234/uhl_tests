<script lang="ts">
    import { getJSON, postJSON, sanitize, type API_Response, getPresetList } from "$lib/util";
    import { type Grade, type Preset, type PresetListEntry, type Test } from "$lib/types";
    import { onMount } from "svelte";
    
    import "../admin.css"
    
    import ConfigInputs from "../components/ConfigInputs.svelte";
    import DataDisplayTable from "../components/DataDisplayTable.svelte";
    import StudentGrade from "../components/StudentGrade.svelte";
    import SelectPresetModal from "../components/modal/SelectPresetModal.svelte";
    import { showNotifToast } from "$lib/popups";
    import TestCodeInputs from "../components/TestCodeInputs.svelte";
    import Footer from "../components/Footer.svelte";

    // The first row of a table of the student responses.
    const testProgramHeader = [
        { key: "email", name: "Email" },
        { key: "code", name: "Test Code" },
        { key: "timeStart", name: "Time Started" },
        { key: "timeSubmitted", name: "Time Submitted" },
        { key: "timeDue", name: "Time Due"}
    ];

    let passwordInputValue: string = $state("");
    let signedIn: boolean = $state(false);
    let connected: boolean = $state(false);
    let gradeStudentEmailInputValue: string = $state("");
    let gradeStudentTestCodeInputValue: string = $state("");

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
    }

    // Get the global configuration values from the server
    async function getManualConfig(key: string) {
        const sanitizedKey = sanitize(key);
        const response = await getJSON("/api/grading/manualConfig/" + sanitizedKey)

        return response.data.value;
    }

    // Set a configuration value to the server
    async function setManualConfig(key: string, value: string | number | boolean, type: "string" | "number" | "boolean") {
        const sanitizedKey = sanitize(key);
        const sanitizedValue = sanitize(String(value));
        const sanitizedType = sanitize(type);
        const response = await postJSON("/api/grading/manualConfig/", {
            key: sanitizedKey,
            value: sanitizedValue,
            type: sanitizedType,
        });
    }

    // When the LOGIN button is pressed
    function loginButtonClick() {
        postJSON("/api/grading/get_session_id", {
            pass: passwordInputValue,
        }).then(json => {
            const { success } = json;
            signedIn = success;
            connected = success;
            if (success) {
                onSignIn();
            }
        });
    }

    // When the grade student button is pressed
    async function gradeStudent() {
        const json = await postJSON("/api/grading/grade/", {
            name: gradeStudentEmailInputValue,
            code: gradeStudentTestCodeInputValue,
        });

        const { success, data } = json;
        
        if (success) {
            graded = true;
            gradeData = data.grade;
        } else {
            graded = false;
        }
    }

    let resetPresetBtn: HTMLButtonElement;
    let savePresetBtn: HTMLButtonElement;
    let loadPresetBtn: HTMLButtonElement;

    let resetTestCodesBtn: HTMLButtonElement;

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
        const json = await getJSON("/api/grading/config/get_preset_default");
        const { success, data } = json;
        if (success) {
            preset = data.preset;
        }
        resetPresetBtn.disabled = false;
    }

    async function resetTestCodes() {
        resetTestCodesBtn.disabled = true;
        const json = await getJSON("/api/grading/config/testcodes");
        const { success, data } = json;
        if (success) {
            testList = data.tests;
            testListEl.setTestListValue(testList!);
        }
        resetTestCodesBtn.disabled = false;
    }

    async function saveTestCodes() {
        testList = testListEl.getTestListValue();
        console.log("Test List:", testList);
        const json = await postJSON("/api/grading/config/update_testcodes", {
            testCodes: testList
        });
    }

    async function newTestCode() {
        testList = testListEl.getTestListValue();
        const json = await getJSON("/api/grading/config/new_testcode");
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
            console.log("value:", value, "presetData:", presetData);

            if (success) {
                if (category === "new") {
                    if (!presetData || !presetData.name || !presetData.id) {
                        showNotifToast({ success: false, message: "Something went wrong" });
                        return;
                    }
                    const p = preset;
                    p.name = presetData.name;
                    await postJSON("/api/grading/config/new_preset", {
                        preset: p,
                    });
                } else if (category === "pre") {
                    const p = preset;
                    p.name = presetData!.name;
                    p.id = Number(presetData!.id);
                    await postJSON("/api/grading/config/set_preset", {
                        preset: p,
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
                    const json = await getJSON(`/api/grading/config/get_preset/${value}`);

                    if (json.success) {
                        preset = json.data.preset;
                    }
                }
            }
        });
        
        loadPresetBtn.disabled = false;
    }

    let selectPresetModal: SelectPresetModal;

    onMount(() => {
        getJSON("/api/grading/am_i_signed_in")
        .then(json => {
            const { success } = json;
            signedIn = success;
            if (success) {
                onSignIn();
            }
        });
    });
</script>

<svelte:head>
    <title>Admins | Uhl Tests</title>
</svelte:head>

<SelectPresetModal bind:this={selectPresetModal} />
<div>
    <form id="admin-signin" class="{ signedIn ? 'd-none' : '' } p-3">
        <h2 class="float-none w-auto">Sign In</h2>
        <div class="input-group">
            <span class="input-group-text">Password</span>
            <input bind:value={passwordInputValue} type="password" class="form-control">
        </div>
        <button onclick={loginButtonClick} class="btn btn-primary">Login</button>
    </form>

    <div id="adminelements" class="container-fluid h-100 { signedIn ? '' : 'd-none' }">
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

                    <form class="p-3" autocomplete="off">
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

                        <!-- <div class="form-check" data-tippy-content="If enabled, from the time a student requests a quiz, they only have a certain amount of time provided to submit their results before it becomes invalid. Students can still submit late answers, but the grading system will notify you.">
                            <input oninput={() => {
                                enableTimeLimitInputValueChanged = Date.now();
                                enableTimeLimitInputIsNew = true;
                            }} bind:checked={enableTimeLimitInputValue} class="form-check-input" type="checkbox" id="enable-time-lim">
                            <label class="form-check-label" for="enable-time-lim">
                                Enable time limit
                            </label>
                        </div> -->

                        <div class="input-group">
                            <span class="input-group-text" id="basic-addon1">Time limit</span>
                            <input oninput={() => {
                                timeLimitInputValueChanged = Date.now();
                                timeLimitInputIsNew = true;
                            }} bind:value={timeLimitInputValue} type="number" id="time-lim" class="form-control" aria-label="Username"
                                aria-describedby="basic-addon1">
                            <span class="input-group-text" id="basic-addon1">minutes</span>
                        </div>
                    </form>

                    <form class="p-3" autocomplete="off">
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
                    </form>

                    <form class="p-3" autocomplete="off">
                        <h3>Configure Test Codes</h3>
                        
                        <div class="btn-group mb-2">
                            <button onclick={saveTestCodes} type="button" class="btn btn-outline-secondary" data-tippy-content="Save the below test code values to the server.">Save changes</button>
                            <button bind:this={resetTestCodesBtn} type="button" class="btn btn-outline-secondary" data-tippy-content="Resets changes to the test codes.">Undo changes</button>
                        </div>

                        <div class="btn-group mb-2">
                            <button onclick={newTestCode} type="button" class="btn btn-outline-secondary" data-tippy-content="Create a brand new test code.">New test code</button>
                        </div>
                        
                        <TestCodeInputs bind:this={testListEl} />
                    </form>

                </div>
                <div class="tab-pane fade" id="nav-p2" role="tabpanel" aria-labelledby="nav-p2-tab">

                    <DataDisplayTable row_heads={testProgramHeader} name="Quiz submissions table" url="/api/grading/test_program" bind:this={testProgramTable} />

                </div>
                <div class="tab-pane fade" id="nav-p3" role="tabpanel" aria-labelledby="nav-p3-tab">

                    <form class="p-3" autocomplete="off">
                        <h4>Grade student</h4>
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="name-lbl">School Email</span>
                            <input bind:value={gradeStudentEmailInputValue} type="email" placeholder="NameYear@pascack.org" class="form-control" id="name" aria-describedby="name-lbl">
                        </div>
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="testcode-lbl">Test Code</span>
                            <input bind:value={gradeStudentTestCodeInputValue} type="text" placeholder="practice2025" class="form-control" id="testcode" aria-describedby="testcode-lbl">
                        </div>

                        <div class="mb-2">
                            {#if graded && gradeData !== undefined}
                                <StudentGrade grade={gradeData!}/>
                            {/if}
                        </div>
                        <button onclick={gradeStudent} class="btn btn-primary">Grade</button>
                    </form>

                </div>
            </div>
    </div>
</div>