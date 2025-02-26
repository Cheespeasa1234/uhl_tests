// MODULE

import { createTable, createListOfOptions, createConfigInputs, displayGradeResults } from "./components.js";
import { showNotifToast } from "./popupManager.js";

const modalElement = document.getElementById("modal");
const modal = new bootstrap.Modal(modalElement);

const selectPresetOnlyPreDialog = document.getElementById("selectPresetOnlyPreModalDialog");
const selectPresetDialog = document.getElementById("selectPresetModalDialog");
const confirmationDialog = document.getElementById("confirmationModalDialog");
const oopsDialog = document.getElementById("oopsModalDialog");

const selectPresetModalNameInput = document.getElementById("selectPresetModalNameInput");
const selectPresetModalPreExistInput = document.getElementById("selectPresetModalPreExistInput");

const selectPresetCancelBtn = document.getElementById("selectPresetCancelBtn");
const selectPresetOkayBtn = document.getElementById("selectPresetOkayBtn");
const confirmationOkayBtn = document.getElementById("confirmationOkayBtn");
const oopsOkayBtn = document.getElementById("oopsOkayBtn");

/**
 * Retrieves the list of pre-existing presets stored on the backend, and returns it.
 * @returns {Promise<string[]>} The list of presets
 */
async function getPresetList() {
    const response = await fetch("./api/grading/config/list_of_presets").then(data => data.json());
    const presetList = response.data.presets;
    return presetList;
}

async function getManualConfig(key) {
    const san = key.replaceAll(".", "");
    const response = await fetch("./api/grading/manualConfig/" + san).then(data => data.json());
    console.log("response", response);
    const value = response.data.value;
    return value;
}

function setManualConfig(key, value, type) {
    fetch("./api/grading/manualConfig", {
        method: "POST",
        headers: new Headers({ "content-type": "application/json" }),
        body: JSON.stringify({
            key: key,
            value: value,
            type: type,
        }),
    }).then(data => data.json()).then((json) => {
        showNotifToast(json);
    });
}

/**
 * Display an oops modal with a given error message, and runs a callback when it is closed, either by the user or by some other code.
 * @param {string} message The message that will display in the modal body. Can be HTML.
 * @param {() => void} dismissedCallback The callback that will run when the oops message is hidden
 * @returns void
 */
function showOopsMessage(message, dismissedCallback) {
    modal.show();
    oopsDialog.classList.remove("d-none");
    document.getElementById("oopsModalBody").innerHTML = `<p>${message}</p>`;
    modalElement.addEventListener("hidden.bs.modal", () => {
        dismissedCallback();
    }, { once: true });
}

/**
 * Shows a select preset modal, and runs a callback when it is closed. Displays the preExistingPresetList as a list of options
 * The callback will be run with parameters:
 * <ul>
 * <li>success: whether or not the selection process succeeded</li>
 * <li>category: what kind of selection was made (either "new", or "pre")</li>
 * <li>value: the name of the preset either to create or to use</li>
 * </ul>
 * @param {string[]} preExistingPresetList
 * @param {(success: boolean, message: string, category: "new" | "pre" | null, value: string | null) => void} callback 
 * @returns void
 */
function showSelectPresetModal(preExistingPresetList, callback) {

    // Show the modal
    modal.show();
    selectPresetDialog.classList.toggle("d-none");

    selectPresetModalPreExistInput.innerHTML = "";
    createListOfOptions(preExistingPresetList).forEach(option => {
        selectPresetModalPreExistInput.appendChild(option);
    });
    
    // When the modal is closed
    selectPresetOkayBtn.addEventListener("click", () => {
        // Get the tab button that is active
        const activeButton = getActiveButton(selectPresetTabsList);
        if (activeButton == null) {
            callback(false, "No active tab found. Could not determine category.", null, null);
        } else if (activeButton.id == "selectPresetPreTab") {
            const value = selectPresetModalPreExistInput.value;
            callback(true, null, "pre", value);
        } else if (activeButton.id == "selectPresetNewTab") {
            const value = selectPresetModalNameInput.value;
            if (preExistingPresetList.includes(value)) {
                callback(false, `User tried to create a new preset "${value}", but that is already defined.`, null, null);
            } else {
                callback(true, null, "new", value);
            }
        }
    }, { once: true });

    selectPresetCancelBtn.addEventListener("click", () => {
        callback(false, "Operation was cancelled.", null, null);
    })
}

function onSignIn() {
    testProgramRefreshButton.click();
    googleFormRefreshButton.click();
    undoPresetButton.click();
    (async () => {
        enableTestingInput.checked = Boolean(await getManualConfig("enableStudentTesting"));
        enableTimeLimitInput.checked = Boolean(await getManualConfig("enableTimeLimit"));
        timeLimitInput.value = Number(await getManualConfig("timeLimit"));
    })();
}

function getActiveButton(tabsList) {
    return tabsList.querySelector(".nav-link.active");
}

/* Elements for signin area */
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#login");2
const adminSignin = document.querySelector("#admin-signin"); // the html for the signin panel that should be shown to a non-authed user
const adminElements = document.querySelector("#adminelements"); // the html for the admin panel that shouldn't be shown to a non-authed user
loginButton.addEventListener("click", () => {
    fetch("./api/grading/get_session_id", {
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ pass: passwordInput.value }),
    }).then((res) => res.json()).then((json) => {
        const success = json.success;
        showNotifToast(json);
        if (success) {
            adminElements.classList.remove("d-none")
            adminSignin.classList.add("d-none");
            onSignIn();
        } else {
            adminElements.classList.add("d-none")
            adminSignin.classList.remove("d-none");
        }
    });
});

fetch("./api/grading/am_i_signed_in").then(res => res.json()).then(json => {
    showNotifToast(json);
    if (json.success) {
        adminElements.classList.remove("d-none")
        adminSignin.classList.add("d-none");
        onSignIn();
    }
});

modalElement.addEventListener("hidden.bs.modal", () => {
    oopsDialog.classList.add("d-none");
    confirmationDialog.classList.add("d-none");
    selectPresetDialog.classList.add("d-none");
    selectPresetOnlyPreDialog.classList.add("d-none");
});

oopsOkayBtn.addEventListener("click", () => {
    modal.hide();
});

confirmationOkayBtn.addEventListener("click", () => {
    modal.hide();
});

selectPresetOkayBtn.addEventListener("click", () => {
    modal.hide();
});


selectPresetCancelBtn.addEventListener("click", () => {
    modal.hide();
});

/* Google form widget */
const googleFormElement = document.querySelector("#google-form");
const googleFormRefreshButton = document.querySelector("#refresh-google-form");
function setGoogleFormElement() {
    fetch("./api/grading/google-form", {
        method: "GET",
    }).then(res => res.json()).then(json => {
        const { success, message, data } = json;
        showNotifToast(json);
        if (success) {
            const { header, rows } = data;
            const table = createTable(header, rows);
            table.id = "google-form-created-table";
            console.log(table);
            googleFormElement.innerHTML = "";
            googleFormElement.appendChild(table);
            
            let table1 = new DataTable('#google-form-created-table', {
                columnDefs: [
                    { className: "dt-left", targets: "_all" },
                    { className: "cell-scrollbar", targets: "_all" },
                ]
            });
        }
    });
}
googleFormRefreshButton.addEventListener("click", setGoogleFormElement);

/* Test program widget */
const testProgramElement = document.querySelector("#test-program");
const testProgramRefreshButton = document.querySelector("#refresh-test-program");
function setTestProgramElement() {
    fetch("./api/grading/test-program", {
        method: "GET",
    }).then(res => res.json()).then(json => {
        const { success, message, data } = json;
        showNotifToast(json);
        if (success) {
            const { header, rows } = data;
            const table = createTable(header, rows);
            table.id = "test-program-created-table";
            for (const row of rows) {
                const j = JSON.parse(row[row.length - 1].replaceAll("~q", "\"").replaceAll("~c", ","));
                console.dir(j);
            }
            testProgramElement.innerHTML = "";
            testProgramElement.appendChild(table);
            
            let table2 = new DataTable('#test-program-created-table', {
                columnDefs: [
                    { className: "dt-left", targets: "_all" },
                    { className: "cell-scrollbar", targets: "_all" },
                ]
            });
        }
    })
}
testProgramRefreshButton.addEventListener("click", setTestProgramElement);

/* Grade Student widget */
const gradeStudentEmailInput = document.querySelector("#student-to-grade");
const gradeStudentButton = document.querySelector("#grade-student");
const gradeStudentResults = document.querySelector("#grade-student-results");
function gradeStudent() {
    gradeStudentButton.disabled = true;
    fetch(`./api/grading/grade/${gradeStudentEmailInput.value}`, {
        method: "GET",
    }).then(res => res.json()).then(json => {
        const { success, message, data } = json;
        showNotifToast(json);
        if (success) {
            gradeStudentResults.innerHTML = "";
            gradeStudentResults.appendChild(displayGradeResults(data.grade));
        }
        gradeStudentButton.disabled = false;
    });
}
gradeStudentButton.addEventListener("click", gradeStudent);

/* Preset widgets */
const configArea = document.getElementById("config-area");
const savePresetButton = document.getElementById("save-preset");
const loadPresetButton = document.getElementById("load-preset");
const resetPresetButton = document.getElementById("reset-preset");
const undoPresetButton = document.getElementById("undo-preset");
const saveConfigButton = document.getElementById("save-config");

function getCurrentConfiguration() {
    const obj = new Object();
    const configInputRegions = configArea.querySelectorAll(".input-group");
    configInputRegions.forEach(region => {
        const inputElement = region.querySelector("input");
        const labelElement = region.querySelector("span.input-group-text");
        obj[labelElement.innerText] = {
            valueType: "number",
            key: labelElement.innerText,
            value: inputElement.value
        };
    });

    return obj;
}

savePresetButton.addEventListener("click", async () => {
    savePresetButton.disabled = true;
    const config = getCurrentConfiguration();
    // figure out where to save it
    // Get the list of presets
    const presetList = await getPresetList();
    // select a preset
    showSelectPresetModal(presetList, (success, message, category, value) => {
        showNotifToast({ success, message, data: category + " " + value });
        
        if (success) {
            fetch("./api/grading/config/set_preset", {
                method: "POST",
                body: JSON.stringify({
                    presetName: value,
                    preset: config
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(data => data.json()).then(json => {
                const { success, message } = json;
                showNotifToast({ success, message });
                savePresetButton.disabled = false;
            });
        } else {
            savePresetButton.disabled = false;
        }
    })
});

loadPresetButton.addEventListener("click", async () => {
    loadPresetButton.disabled = true;
    // get the preset they want
    const presetList = await getPresetList();
    showSelectPresetModal(presetList, async (success, message, category, value) => {
        showNotifToast({ success, message, data: category + " " + value});

        if (success) {
            if (category != "pre") {
                showNotifToast({ success: false, message: "Can only load from a pre-existing preset- attempted to load from a " + category + " preset." });
            } else {
                // Successfully got a pre existing preset to load from
                const response = await fetch(`./api/grading/config/get_preset/${value}`).then(data => data.json());
                const { success, data } = response;

                showNotifToast(response);
                if (success) {
                    const preset = data.preset;
                    const presetConfigElement = createConfigInputs(preset);
                    configArea.innerHTML = presetConfigElement.innerHTML;
                }
            }
        }
        loadPresetButton.disabled = false;
    });
});

resetPresetButton.addEventListener("click", () => {
    resetPresetButton.disabled = true;
    // get what the default preset is
    fetch("./api/grading/config/get_preset_default").then(data => data.json()).then(json => {
        const { success, data } = json;
        showNotifToast(json);

        if (success) {
            const preset = data.preset;
            console.log(preset);
            const presetConfigElement = createConfigInputs(preset);
            configArea.innerHTML = presetConfigElement.innerHTML;
        }
        resetPresetButton.disabled = false;
    });
});

saveConfigButton.addEventListener("click", () => {
    saveConfigButton.disabled = true;
    const preset = getCurrentConfiguration();
    fetch("./api/grading/config/set_config", {
        method: "POST",
        body: JSON.stringify({
            preset: preset
        }),
        headers: {
            "Content-Type": "application/json",
        },
    }).then(data => data.json()).then(json => {
        showNotifToast(json);
        saveConfigButton.disabled = false;
    }).catch(e => {
        saveConfigButton.disabled = false;
    });
});

undoPresetButton.addEventListener("click", () => {
    undoPresetButton.disabled = true;
    fetch("./api/grading/config/get_config").then(data => data.json()).then(json => {
        const { success, data } = json;
        showNotifToast(json);
        if (success) {
            const preset = data.preset;
            const presetConfigElement = createConfigInputs(preset);
            configArea.innerHTML = presetConfigElement.innerHTML;
        }
        undoPresetButton.disabled = false;
    });
});

// manual configs
const enableTestingInput = document.getElementById("enable-testing");
const enableTimeLimitInput = document.getElementById("enable-time-lim");
const timeLimitInput = document.getElementById("time-lim");

enableTestingInput.addEventListener("input", () => {
    setManualConfig("enableStudentTesting", enableTestingInput.checked || "false", "boolean");
});

enableTimeLimitInput.addEventListener("input", () => {
    setManualConfig("enableTimeLimit", enableTimeLimitInput.checked || "false", "boolean");
});

let previousValue = 0;
setInterval(() => {
    if (timeLimitInput.value != previousValue) {
        setManualConfig("timeLimit", timeLimitInput.value || "0", "number");
        previousValue = timeLimitInput.value;
    }
}, 1000 * 2);