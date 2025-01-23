'use strict';

/* Useful standalone functions */
function setInfoBox(infoboxElement, jsonResponse) {
    infoboxElement.innerHTML = `<b>${jsonResponse.success ? "Success" : "Failure"}</b>: ${jsonResponse.message || "No message provided"}`;
}

function createTable(header, rows) {
    const table = document.createElement("table");
    table.classList.add("table");
    const thead = document.createElement("thead");

    const trHead = document.createElement("tr");
    header.forEach((col) => {
        const th = document.createElement("th");
        th.innerText = col;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
        const tr = document.createElement("tr");
        for (let i = 0; i < row.length; i++) {
            if (i === 0) {
                const th = document.createElement("th");
                th.scope = "row";
                th.innerText = row[i];
                tr.appendChild(th);
            } else {
                const td = document.createElement("td");
                td.innerText = row[i];
                tr.appendChild(td);
            }
        }
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
}

/* Elements for signin area */
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#login");
const adminSignin = document.querySelector("#admin-signin");
const signinInfo = document.querySelector("#info");
const adminElements = document.querySelector("#adminelements");
loginButton.addEventListener("click", () => {
    console.log(passwordInput);
    console.log(passwordInput.value);
    fetch("./grading/get_session_id", {
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ pass: passwordInput.value }),
    }).then((res) => res.json()).then((json) => {
        const success = json.success;
        const message = json.message;
        setInfoBox(signinInfo, json);
        if (success) {
            adminElements.style.display = "block";
            adminSignin.style.display = "none";
        } else {
            adminElements.style.display = "none";
            adminSignin.style.display = "block";
        }
    });
});

fetch("./grading/am_i_signed_in").then(res => res.json()).then(json => {
    if (json.success) {
        adminElements.style.display = "block";
        adminSignin.style.display = "none";
    }
});

/* Grade Student widget */
const gradeStudentInfo = document.querySelector("#grade-student-info");
const gradeStudentEmailInput = document.querySelector("#student-to-grade");
const gradeStudentButton = document.querySelector("#grade-student");
const gradeStudentResults = document.querySelector("#grade-student-results");
function gradeStudent() {
    fetch(`./grading/grade/${gradeStudentEmailInput.value}`, {
        method: "GET",
    }).then(res => res.json()).then(json => {
        const { success, message, data } = json;
        setInfoBox(gradeStudentInfo, json);

        if (success) {
            gradeStudentResults.innerHTML = JSON.stringify(data);
        }
    });
}
gradeStudentButton.addEventListener("click", gradeStudent);

/* Active sessions widget */
const activeSessionsInfo = document.querySelector("#active-sessions-info");
const activeSessionsElement = document.querySelector("#active-sessions");
const activeSessionsRefreshButton = document.querySelector("#refresh-active-sessions");
function setActiveSessionsElement() {
    fetch("./grading/sessions", {
        method: "GET",
    }).then((res) => res.json()).then((json) => {
        const { success, message, data } = json;
        setInfoBox(activeSessionsInfo, json);

        if (success) {
            activeSessionsElement.innerHTML = JSON.stringify(data);
        }
    });
}
activeSessionsRefreshButton.addEventListener("click", setActiveSessionsElement);


/* Google form widget */
const googleFormInfo = document.querySelector("#google-form-info");
const googleFormElement = document.querySelector("#google-form");
const googleFormRefreshButton = document.querySelector("#refresh-google-form");
function setGoogleFormElement() {
    fetch("./grading/google-form", {
        method: "GET",
    }).then(res => res.json()).then(json => {
        const { success, message, data } = json;
        setInfoBox(googleFormInfo, json);

        if (success) {
            const { header, rows } = data;
            const table = createTable(header, rows);
            googleFormElement.innerHTML = "";
            googleFormElement.appendChild(table);
        }
    });
}
googleFormRefreshButton.addEventListener("click", setGoogleFormElement);

/* Test program widget */
const testProgramInfo = document.querySelector("#test-program-info");
const testProgramElement = document.querySelector("#test-program");
const testProgramRefreshButton = document.querySelector("#refresh-test-program");
function setTestProgramElement() {
    fetch("./grading/test-program", {
        method: "GET",
    }).then(res => res.json()).then(json => {
        const { success, message, data } = json;
        setInfoBox(testProgramInfo, json);

        if (success) {
            const { header, rows } = data;
            const table = createTable(header, rows);
            for (const row of rows) {
                const j = JSON.parse(row[row.length - 1].replaceAll("~q", "\"").replaceAll("~c", ","));
                console.dir(j);
            }
            testProgramElement.innerHTML = "";
            testProgramElement.appendChild(table);
        }
    })
}
testProgramRefreshButton.addEventListener("click", setTestProgramElement);

/* Config area widget */
const configLoopCountInput = document.querySelector("#config-loop-count")
const configDoubleLoopCountInput = document.querySelector("#config-double-loop-count")
const configStringCountInput = document.querySelector("#config-string-count")