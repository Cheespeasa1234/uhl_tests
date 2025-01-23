const modalElement = document.getElementById("modal");
const modal = new bootstrap.Modal(modalElement);

const selectPresetOnlyPreDialog = document.getElementById("selectPresetOnlyPreModalDialog");
const selectPresetDialog = document.getElementById("selectPresetModalDialog");
const confirmationDialog = document.getElementById("confirmationModalDialog");
const oopsDialog = document.getElementById("oopsModalDialog");

const selectPresetModalPreExistInput = document.getElementById("selectPresetModalPreExistInput");
const selectPresetModalNameInput = document.getElementById("selectPresetModalNameInput");
const selectPresetTabsList = document.getElementById("selectPresetTabsList");

modalElement.addEventListener("hidden.bs.modal", () => {
    oopsDialog.classList.add("d-none");
    confirmationDialog.classList.add("d-none");
    selectPresetDialog.classList.add("d-none");
    selectPresetOnlyPreDialog.classList.add("d-none");
});

const oopsOkayBtn = document.getElementById("oopsOkayBtn");
oopsOkayBtn.addEventListener("click", () => {
    modal.hide();
});

const confirmationOkayBtn = document.getElementById("confirmationOkayBtn");
confirmationOkayBtn.addEventListener("click", () => {
    modal.hide();
});

const selectPresetOkayBtn = document.getElementById("selectPresetOkayBtn");
selectPresetOkayBtn.addEventListener("click", () => {
    modal.hide();
});

const selectPresetCancelBtn = document.getElementById("selectPresetCancelBtn");
selectPresetCancelBtn.addEventListener("click", () => {
    modal.hide();
});

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
function showSelectPresetModal(callback) {
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

function getActiveButton(tabsList) {
    return tabsList.querySelector(".nav-link.active");
}

showOopsMessage("this is a modal. <b>html works in it.</b>", () => {
    showSelectPresetModal((success, message, category, value) => {
        if (success) {
            // TODO
            console.log(`Please read in ${category} preset: ${value}`);
        } else {
            showOopsMessage(`Something went wrong: <pre>${message}</pre>`, () => {});
        }
    })
});