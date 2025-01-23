import { createTable } from "./guiUtil.js";


/* Google form widget */
const googleFormElement = document.querySelector("#google-form");
const googleFormRefreshButton = document.querySelector("#refresh-google-form");
function setGoogleFormElement() {
    fetch("./grading/google-form", {
        method: "GET",
    }).then(res => res.json()).then(json => {
        const { success, message, data } = json;
        if (success) {
            const { header, rows } = data;
            const table = createTable(header, rows);
            table.id = "google-form-created-table";
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
    fetch("./grading/test-program", {
        method: "GET",
    }).then(res => res.json()).then(json => {
        const { success, message, data } = json;
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