/* Elements for signin area */
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#login");
const adminSignin = document.querySelector("#admin-signin");
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
        if (success) {
            adminElements.classList.remove("d-none")
            adminSignin.classList.add("d-none");
        } else {
            adminElements.classList.add("d-none")
            adminSignin.classList.remove("d-none");
        }
    });
});

fetch("./grading/am_i_signed_in").then(res => res.json()).then(json => {
    if (json.success) {
        adminElements.classList.remove("d-none")
        adminSignin.classList.add("d-none");
    }
});

const modalElement = document.getElementById("modal");
const modal = new bootstrap.Modal(modalElement);

const selectPresetOnlyPreDialog = document.getElementById("selectPresetOnlyPreModalDialog");
const selectPresetDialog = document.getElementById("selectPresetModalDialog");
const confirmationDialog = document.getElementById("confirmationModalDialog");
const oopsDialog = document.getElementById("oopsModalDialog");

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