const cookiePopup = document.querySelector("#cookie-popup");
const cookieAccept = document.querySelector("#cookie-accept");
cookieAccept.onclick = () => {
    cookiePopup.close(); 
};

const hcsid = (n=>{z=n+"=";w=decodeURIComponent(document.cookie).split(';');for(i=0;i<w.length;i++){c=w[i];while(c.charAt(0)==' '){c=c.substring(1)}if(c.indexOf(z)==0)return c.substring(z.length,c.length)}return""})("HCS_ID");
if (!hcsid) {
    cookiePopup.showModal();
}

const nameInput = document.querySelector("#name");
const takeTestButton = document.querySelector("#take-test");
const testArea = document.querySelector("#test");
const submitAnswersButton = document.querySelector("#submitanswers");
const submissionPopupDialog = document.querySelector("#submission-popup");
const answerCodeText = document.querySelector("#answer-code-popup");
const copyAndCloseButton = document.querySelector("#copy-and-close-popup");

let studentSelf;

function createTestQuestionElement(testQuestionJSON) {
    const { questionString } = testQuestionJSON;
    
    const questionDiv = document.createElement("div");
    questionDiv.classList.add(["question-container"]);

    const questionContentDiv = document.createElement("div");
    const pre = document.createElement("pre");
    pre.innerHTML = questionString;
    questionContentDiv.appendChild(pre);
    questionContentDiv.classList.add(["question-box"]);

    const answerDiv = document.createElement("textarea");
    answerDiv.classList.add(["answer-textarea"]);
    
    questionDiv.appendChild(questionContentDiv);
    questionDiv.appendChild(answerDiv);
    questionDiv.appendChild(document.createElement("hr"));
    
    return questionDiv;
}

function displaySubmissionPopup(response) {
    const { success, message, answerCode } = response;
    if (!success) {
        answerCodeText.innerText = `Failed to submit: <b>${message}</b>`
        copyAndCloseButton.innerHTML = "Okay";
    } else {
        answerCodeText.innerText = answerCode;
        copyAndCloseButton.innerHTML = "Copy & Close";
    }
    copyAndCloseButton.onclick = () => {
        submissionPopupDialog.close();
    };
    submissionPopupDialog.showModal();
}

function clearDocument() {
    testArea.innerHTML = "";
    nameInput.value = "";
    studentSelf = undefined;
}

takeTestButton.onclick = () => {
    fetch("./new-test", {
        method: "POST",
        headers: new Headers({'content-type': 'application/json'}),
        body: JSON.stringify({
            "name": nameInput.value
        })
    }).then(r => {console.log(r); return r.json()}).then(json => {
        const { success, message, questions, student } = json;
        studentSelf = student;
        if (!success) {
            console.error("Not success: " + message);
            return;
        }

        testArea.innerHTML = "";
        for (const question of questions) {
            const element = createTestQuestionElement(question);
            testArea.appendChild(element);
        }
    });
};

submitAnswersButton.onclick = () => {

    // get the answers
    const answerElements = document.querySelectorAll("textarea.answer-textarea");
    const answers = [];
    for (const answer of answerElements) {
        answers.push(answer.value);
    }
    console.log(answers);

    fetch("./submit-test", {
        method: "POST",
        headers: new Headers({'content-type': 'application/json'}),
        body: JSON.stringify({
            answers,
            studentSelf
        }),
        
    }).then(r => r.json()).then(json => {
        displaySubmissionPopup(json);
        clearDocument();
    });
}