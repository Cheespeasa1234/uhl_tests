"use strict";

import { showNotifToast } from "./popupManager.js";
import { createTestQuestionElement } from "./components.js";

const cookiePopup = document.getElementById("cookie-popup");
const cookiePopupClose = document.getElementById("cookie-popup-close");
const submissionPopup = document.getElementById("submission-popup");
const submissionPopupOpen = document.getElementById("submission-popup-open");
const submissionPopupClose = document.getElementById("submission-popup-close");

cookiePopupClose.addEventListener("click", () => {
    cookiePopup.close();
});

submissionPopupOpen.addEventListener("click", () => {
    submissionPopup.showModal();
});

const hcsid = ((n) => {
    const z = n + "=";
    const w = decodeURIComponent(document.cookie).split(";");
    for (let i = 0; i < w.length; i++) {
        let c = w[i];
        while (c.charAt(0) == " ") c = c.substring(1);
        if (c.indexOf(z) == 0) return c.substring(z.length, c.length);
    }
    return "";
})("HCS_ID");

if (!hcsid) {
    cookiePopup.showModal();
}

const nameInput = document.querySelector("#name");
const testCodeInput = document.querySelector("#test-code");
const takeTestButton = document.querySelector("#take-test");
const testArea = document.querySelector("#test");
const submissionPopupDialog = document.querySelector("#submission-popup");
const answerCodeText = document.querySelector("#answer-code-popup");

let studentSelf;

function displaySubmissionPopup(response) {
    const { success, message, answerCode } = response;
    localStorage.setItem("ANSWER_CODE_BKP", answerCode);
    
    if (!success) {
        answerCodeText.innerText = `Failed to submit: <b>${message}</b>`;
    } else {
        answerCodeText.innerText = answerCode;
    }
    submissionPopupClose.onclick = () => {
        submissionPopupDialog.close();
    };
    submissionPopupDialog.showModal();
}

function clearDocument() {
    testArea.innerHTML = "";
    nameInput.value = "";
    testCodeInput.value = "practice2025";
    studentSelf = undefined;
}

takeTestButton.onclick = () => {
    fetch("./api/testing/new-test", {
        method: "POST",
        headers: new Headers({ "content-type": "application/json" }),
        body: JSON.stringify({
            "name": nameInput.value,
            "code": testCodeInput.value,
        }),
    }).then((r) => {
        console.log(r);
        return r.json();
    }).then((json) => {
        const { success, message, data } = json;
        showNotifToast(json);
        
        
        if (!success) {
            console.error("Not success: " + message);
            return;
        }
        
        const { questions, student, timeStarted, timeToEnd } = data;
        showNotifToast({ success: true, message: `Test started: ${timeStarted}<br>Time ends: ${timeToEnd}` })
        studentSelf = student;
        
        submissionPopupOpen.disabled = false;
        testArea.innerHTML = "";
        for (const question of questions) {
            const element = createTestQuestionElement(question);
            testArea.appendChild(element);
        }
    });
};

submissionPopupOpen.addEventListener("click", () => {
    // get the answers
    const answerElements = document.querySelectorAll(
        "textarea.answer-textarea",
    );
    const answers = [];
    for (const answer of answerElements) {
        answers.push(answer.value);
    }
    console.log(answers);

    fetch("./api/testing/submit-test", {
        method: "POST",
        headers: new Headers({ "content-type": "application/json" }),
        body: JSON.stringify({
            answers,
            studentSelf,
        }),
    }).then((r) => r.json()).then((json) => {
        showNotifToast(json);
        displaySubmissionPopup(json);
        clearDocument();
    });
});

submissionPopupClose.addEventListener("click", () => {
    const res = confirm("Are you sure you copied the code? You will never be able to see the code again!");
    if (res) {
        submissionPopupDialog.close();
    }
});