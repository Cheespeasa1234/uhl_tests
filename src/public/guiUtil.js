'use strict';
// MODULE



/**
 * Display an oops modal with a given error message, and runs a callback when it is closed, either by the user or by some other code.
 * @param {string} message The message that will display in the modal body. Can be HTML.
 * @param {() => void} dismissedCallback The callback that will run when the oops message is hidden
 * @returns void
 */
export function showOopsMessage(message, dismissedCallback) {
    modal.show();
    oopsDialog.classList.remove("d-none");
    document.getElementById("oopsModalBody").innerHTML = `<p>${message}</p>`;
    modalElement.addEventListener("hidden.bs.modal", () => {
        dismissedCallback();
    }, { once: true });
}

/**
 * Shows a select preset modal, and runs a callback when it is closed.
 * The callback will be run with parameters:
 * <ul>
 * <li>success: whether or not the selection process succeeded</li>
 * <li>category: what kind of selection was made (either "new", or "pre")</li>
 * <li>value: the name of the preset either to create or to use</li>
 * </ul>
 * @param {(success: boolean, message: string, category: string|null, value: string|null) => void} callback 
 * @returns void
 */
export function showSelectPresetModal(callback) {
    // Show the modal
    modal.show();
    selectPresetDialog.classList.toggle("d-none");
    
    // When the modal is closed
    selectPresetOkayBtn.addEventListener("click", () => {
        // Get the tab button that is active
        const activeButton = getActiveButton(selectPresetTabsList);
        if (activeButton == null) {
            callback(false, "No active tab found. Could not determine category.", null, null);
        } else if (activeButton.id == "selectPresetPreTab") {
            const value = selectPresetModalPreExistInput.value;
            callback(true, "", "pre", value);
        } else if (activeButton.id == "selectPresetNewTab") {
            const value = selectPresetModalNameInput.value;
            callback(true, "", "new", value);
        }
    }, { once: true });

    selectPresetCancelBtn.addEventListener("click", () => {
        callback(false, "Operation was cancelled.", null, null);
    })
}

export function getActiveButton(tabsList) {
    return tabsList.querySelector(".nav-link.active");
}

export function createTable(header, rows) {
    const table = document.createElement("table");
    
    table.classList.add("nowrap", "stripe", "hover", "compact", "row-border", "border", "rounded");
    table.style.tableLayout = "fixed";
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