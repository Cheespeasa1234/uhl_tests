// MODULE

import { createTable, createListOfOptions, createConfigInputs, displayGradeResults, displayGradeResultsBootstrap, createTestCodeConfigInputs } from "./components.js";
import { showNotifToast, showSelectPresetModal } from "./popupManager.js";

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



function onSignIn() {
    testProgramRefreshButton.click();
    googleFormRefreshButton.click();
    undoPresetButton.click();
    resetTestCodeConfigButton.click();

    // gradeStudentEmailInput.value = "nlevison25@pascack.org";
    // gradeStudentButton.click();
    (async () => {
        enableTestingInput.checked = Boolean(await getManualConfig("enableStudentTesting"));
        enableTimeLimitInput.checked = Boolean(await getManualConfig("enableTimeLimit"));
        timeLimitInput.value = Number(await getManualConfig("timeLimit"));
    })();

    setInterval(async () => {
        const json = await fetch("./api/grading/notifications").then(res => res.json());
        const notifications = json.data.notifications;
        notifications.forEach(notif => {
            showNotifToast(notif);
        });
    }, 5000);
}

/* Elements for signin area */
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#login");
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

const opts = {
    columnDefs: [
        { className: "dt-left", targets: "_all" },
        { className: "cell-scrollbar", targets: "_all" },
    ],
    order: [["0", "desc" ]]
}

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
            
            // on the element fully loading
            // googleFormElement.onload = () => {
                let table1 = new DataTable('#google-form-created-table', opts);
            // }
            
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
            testProgramElement.innerHTML = "";
            testProgramElement.appendChild(table);

            // on the element fully loading
            // testProgramElement.onload = () => {
                let table2 = new DataTable('#test-program-created-table', opts);
            // }
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
            const { resultsContainer, carousel } = displayGradeResultsBootstrap(data.grade);
            gradeStudentResults.appendChild(resultsContainer);
            const carouselBs = new bootstrap.Carousel(carousel);
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

function getCurrentTestCodeConfiguration() {
    const codes = [];
    const testCodeConfigInputs = testCodeConfigArea.querySelectorAll(".input-group");
    testCodeConfigInputs.forEach(region => {
        const id = region.querySelector(".id-input-tc").innerText;
        const code = region.querySelector(".code-input-tc").value;
        const presetName = region.querySelector(".preset-input-tc").value;
        const enabled = region.querySelector(".enabled-input-tc").checked;

        codes.push({
            id: id,
            code: code,
            presetName: presetName,
            enabled: enabled
        });
    });
    return codes;
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

/* Test Code config widgets */
const testCodeConfigArea = document.getElementById("test-code-config-area");
const saveTestCodeConfigButton = document.getElementById("save-test-code-config");
const resetTestCodeConfigButton = document.getElementById("reset-test-code-config");

resetTestCodeConfigButton.addEventListener("click", () => {
    fetch("./api/grading/config/testcodes").then(data => data.json()).then(json => {
        const { success, message, data } = json;
        showNotifToast(json);
        
        if (success) {
            const testCodeConfigElement = createTestCodeConfigInputs(data);
            testCodeConfigArea.innerHTML = testCodeConfigElement.innerHTML;
        }
    });
});

saveTestCodeConfigButton.addEventListener("click", () => {
    const codes = getCurrentTestCodeConfiguration();
    fetch("./api/grading/config/update_testcodes", {
        method: "POST",
        body: JSON.stringify({
            testCodes: codes
        }),
        headers: {
            "Content-Type": "application/json",
        },
    }).then(data => data.json()).then(json => {
        showNotifToast(json);
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