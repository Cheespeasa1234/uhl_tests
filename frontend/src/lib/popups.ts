import { toast } from "svelte-hot-french-toast";



export function showNotifToast(json: { success: boolean, message: string, data?: any }) {
    const { success, message } = json;
    if (success) {
        toast.success(message);
    } else {
        toast.error(message);
    }
    console.trace(json);
}

// const modalElement = document.getElementById("modal");
// const modal = new bootstrap.Modal(modalElement);

// const selectPresetOnlyPreDialog = document.getElementById("selectPresetOnlyPreModalDialog");
// const selectPresetDialog = document.getElementById("selectPresetModalDialog");
// const confirmationDialog = document.getElementById("confirmationModalDialog");
// const oopsDialog = document.getElementById("oopsModalDialog");

// const selectPresetModalNameInput = document.getElementById("selectPresetModalNameInput");
// const selectPresetModalPreExistInput = document.getElementById("selectPresetModalPreExistInput");

// const selectPresetCancelBtn = document.getElementById("selectPresetCancelBtn");
// const selectPresetOkayBtn = document.getElementById("selectPresetOkayBtn");
// const confirmationOkayBtn = document.getElementById("confirmationOkayBtn");
// const oopsOkayBtn = document.getElementById("oopsOkayBtn");


// modalElement.addEventListener("hidden.bs.modal", () => {
//     oopsDialog.classList.add("d-none");
//     confirmationDialog.classList.add("d-none");
//     selectPresetDialog.classList.add("d-none");
//     selectPresetOnlyPreDialog.classList.add("d-none");
// });

// oopsOkayBtn.addEventListener("click", () => {
//     modal.hide();
// });

// confirmationOkayBtn.addEventListener("click", () => {
//     modal.hide();
// });

// selectPresetOkayBtn.addEventListener("click", () => {
//     modal.hide();
// });


// selectPresetCancelBtn.addEventListener("click", () => {
//     modal.hide();
// });


// /**
//  * Display an oops modal with a given error message, and runs a callback when it is closed, either by the user or by some other code.
//  * @param {string} message The message that will display in the modal body. Can be HTML.
//  * @param {() => void} dismissedCallback The callback that will run when the oops message is hidden
//  * @returns void
//  */
// export function showOopsMessage(message, dismissedCallback) {
//     modal.show();
//     oopsDialog.classList.remove("d-none");
//     document.getElementById("oopsModalBody").innerHTML = `<p>${message}</p>`;
//     modalElement.addEventListener("hidden.bs.modal", () => {
//         dismissedCallback();
//     }, { once: true });
// }

// /**
//  * Shows a select preset modal, and runs a callback when it is closed. Displays the preExistingPresetList as a list of options
//  * The callback will be run with parameters:
//  * <ul>
//  * <li>success: whether or not the selection process succeeded</li>
//  * <li>category: what kind of selection was made (either "new", or "pre")</li>
//  * <li>value: the name of the preset either to create or to use</li>
//  * </ul>
//  * @param {string[]} preExistingPresetList
//  * @param {(success: boolean, message: string, category: "new" | "pre" | null, value: string | null) => void} callback 
//  * @returns void
//  */
// export function showSelectPresetModal(preExistingPresetList, callback) {

//     // Show the modal
//     modal.show();
//     selectPresetDialog.classList.toggle("d-none");

//     selectPresetModalPreExistInput.innerHTML = "";
//     createListOfOptions(preExistingPresetList).forEach(option => {
//         selectPresetModalPreExistInput.appendChild(option);
//     });
    
//     // When the modal is closed
//     selectPresetOkayBtn.addEventListener("click", () => {
//         // Get the tab button that is active
//         const activeButton = getActiveButton(selectPresetTabsList);
//         if (activeButton == null) {
//             callback(false, "No active tab found. Could not determine category.", null, null);
//         } else if (activeButton.id == "selectPresetPreTab") {
//             const value = selectPresetModalPreExistInput.value;
//             callback(true, null, "pre", value);
//         } else if (activeButton.id == "selectPresetNewTab") {
//             const value = selectPresetModalNameInput.value;
//             if (preExistingPresetList.includes(value)) {
//                 callback(false, `User tried to create a new preset "${value}", but that is already defined.`, null, null);
//             } else {
//                 callback(true, null, "new", value);
//             }
//         }
//     }, { once: true });

//     selectPresetCancelBtn.addEventListener("click", () => {
//         callback(false, "Operation was cancelled.", null, null);
//     })
// }