'use strict';

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

export function createListOfOptions(list) {
    const out = list.map((entry, index) => {
        const option = document.createElement("option");
        option.value = entry;
        option.innerText = entry;

        if (index == 0) option.selected = true;

        return option;
    });

    return out;
}

export function createConfigInputs(presetObject) {
    const configArea = document.createElement("div");
    configArea.id = "config-area";

    for (const propertyName in presetObject) {
        const propertyValue = presetObject[propertyName];
        const { key, value, valueType } = propertyValue;
        
        const inputGroup = document.createElement("div");
        inputGroup.classList.add("input-group");

        const span = document.createElement("span");
        span.classList.add("input-group-text", "col-sm-6");
        span.innerText = key;

        const input = document.createElement("input");
        input.setAttribute("type", valueType);
        input.setAttribute("value", value);
        input.classList.add("form-control");

        const button = document.createElement("button");
        button.classList.add("btn", "btn-outline-secondary");
        button.innerHTML = "Reset";

        inputGroup.appendChild(span);
        inputGroup.appendChild(input);
        inputGroup.appendChild(button);

        configArea.appendChild(inputGroup);
    }

    return configArea;
}

export function displayGradeResults(grade) {
    const { name, epochTime, due, questions, numberCorrect } = grade;

    const container = document.createElement("div");
    const h3 = document.createElement("h3");
    const h4 = document.createElement("h4");

    h3.innerText = name;
    h4.innerText = `Submitted: ${epochTime}, Due: ${due}, ${questions.length} questions, ${numberCorrect.correct} correct, ${numberCorrect.incorrect} incorrect`;
    container.appendChild(h3);
    container.appendChild(h4);

    // TODO: Make sure no XSS vulnerability
    const questionsContainer = document.createElement("div");
    for (let i = 0; i < questions.length; i++) {
        const _question = questions[i];
        const { question, userAnswer, correctAnswer, correct } = _question;
        const { descriptor, questionString } = question;

        const questionContainer = document.createElement("div");

        questionContainer.appendChild(createTestQuestionElement(question));

        const answerDiv = document.createElement("div");
        const userAnswerDiv = document.createElement("p");
        const correctAnswerDiv = document.createElement("p");
        userAnswerDiv.innerText = `Usr: ${userAnswer}`;
        correctAnswerDiv.innerText = `Key: ${correctAnswer}`;
        answerDiv.appendChild(userAnswerDiv);
        answerDiv.appendChild(correctAnswerDiv);
        const p = document.createElement("p");
        if (correct) {
            p.innerText = "Correct!";
        } else {
            p.innerText = "Incorrect.";
        }
        answerDiv.appendChild(p);
        questionContainer.appendChild(answerDiv);

        questionsContainer.appendChild(questionContainer);
    }

    container.appendChild(questionsContainer);

    return container;
}

export function createTestQuestionElement(testQuestionJSON) {
    const { questionString, descriptor } = testQuestionJSON;

    const questionDiv = document.createElement("div");
    questionDiv.classList.add(["question-container"]);

    const questionDescriptorDiv = document.createElement("div");
    questionDescriptorDiv.classList.add(["question-descriptor"]);
    questionDescriptorDiv.innerHTML = descriptor;

    const questionContentDiv = document.createElement("div");
    const pre = document.createElement("pre");
    pre.innerHTML = questionString;
    pre.classList.add(["code-box"]);
    pre.classList.add(["box"]);
    questionContentDiv.appendChild(pre);
    questionContentDiv.classList.add(["question-box"]);

    const answerDiv = document.createElement("textarea");
    answerDiv.classList.add(["answer-textarea"]);
    answerDiv.classList.add(["box"]);

    questionDiv.appendChild(questionDescriptorDiv);
    questionDiv.appendChild(questionContentDiv);
    questionDiv.appendChild(answerDiv);
    questionDiv.appendChild(document.createElement("hr"));

    return questionDiv;
}