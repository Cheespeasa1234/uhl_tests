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

export function displayGradeResultsBootstrap(grade) {
    const { name, epochTime, due, questions, numberCorrect } = grade;
    
    const dueDate = new Date(due);
    const epoDate = new Date(epochTime);
    
    const resultsContainer = document.createElement("div");

    // Create the header
    const headerContainer = document.createElement("div");

    const headerName = document.createElement("h4");
    const percentage = numberCorrect.correct / questions.length * 100;
    const percentageStr = parseFloat(percentage).toFixed(2) + "%";
    headerName.innerText = `${name}: ${numberCorrect.correct} / ${questions.length} (${percentageStr})`;

    const headerTiming = document.createElement("p");
    headerTiming.innerText = `Submitted: ${epoDate.toLocaleString()} Due: ${dueDate.toLocaleString()}`;

    const timeLeft = dueDate.getTime() - epoDate.getTime();
    const headerRemaining = document.createElement("p");
    headerRemaining.innerText = `${timeLeft / 1000} seconds remaining`;

    headerContainer.appendChild(headerName);
    headerContainer.appendChild(headerTiming);
    headerContainer.appendChild(headerRemaining);

    resultsContainer.appendChild(headerContainer);

    // Create the carousel
    const carousel = document.createElement("div");
    carousel.id = "gradeCarousel";
    carousel.classList.add("carousel");
    carousel.classList.add("slide");

    const carouselContents = document.createElement("div");
    carouselContents.classList.add("carousel-inner");

    for (let i = 0; i < questions.length; i++) {
        const questionData = questions[i];
        const { question, userAnswer, correctAnswer, correct } = questionData;
        const { descriptor, questionString } = question;

        const carouselItemContainer = document.createElement("div");
        // carouselItemContainer.classList.add("d-block", "w-100");

        const carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel-item");
        if (i == 0) {
            carouselItem.classList.add("active");
        }

        const itemHeader = document.createElement("h5");
        itemHeader.innerText = (i + 1) + ". " + descriptor;

        const itemQuestion = document.createElement("pre");
        itemQuestion.classList.add("code-format");
        itemQuestion.innerText = questionString;

        const itemAnswerComparison = document.createElement("div");
        itemAnswerComparison.classList.add("comparison");
        
        const itemAnswerComparisonUserAnswer = document.createElement("div");
        itemAnswerComparisonUserAnswer.classList.add("response-format");
        if (correct) {
            itemAnswerComparisonUserAnswer.classList.add("correct");
        } else {
            itemAnswerComparisonUserAnswer.classList.add("incorrect");
        }
        itemAnswerComparisonUserAnswer.innerText = userAnswer;
        
        const itemAnswerComparisonCorrectAnswer = document.createElement("div");
        itemAnswerComparisonCorrectAnswer.classList.add("response-format");
        itemAnswerComparisonCorrectAnswer.innerText = correctAnswer;
        itemAnswerComparisonCorrectAnswer.classList.add("correct");

        const itemAnswerComparisonStatus = document.createElement("em");
        itemAnswerComparisonStatus.innerText = correct ? "Correct!" : "Incorrect.";

        itemAnswerComparison.appendChild(itemAnswerComparisonUserAnswer);
        itemAnswerComparison.appendChild(itemAnswerComparisonCorrectAnswer);
        itemAnswerComparison.appendChild(itemAnswerComparisonStatus);

        carouselItem.appendChild(itemHeader);
        carouselItem.appendChild(itemQuestion);
        carouselItem.appendChild(itemAnswerComparison);

        carouselItemContainer.appendChild(carouselItem);
        carouselContents.appendChild(carouselItemContainer);
    }

    // Make the side buttons
    const buttonLeft = document.createElement("button");
    buttonLeft.innerHTML=`<span class="carousel-control-prev-icon carousel-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span>`;
    buttonLeft.classList.add("carousel-control-prev");
    buttonLeft.classList.add("carousel-control");
    buttonLeft.type = "button";
    buttonLeft.setAttribute("data-bs-target", "#gradeCarousel");
    buttonLeft.setAttribute("data-bs-slide", "prev");
    
    const buttonRight = document.createElement("button");
    buttonRight.innerHTML=`<span class="carousel-control-next-icon carousel-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span>`;
    buttonRight.classList.add("carousel-control-next");
    buttonRight.classList.add("carousel-control");
    buttonRight.type = "button";
    buttonRight.setAttribute("data-bs-target", "#gradeCarousel");
    buttonRight.setAttribute("data-bs-slide", "next");
    
    carousel.appendChild(buttonLeft);
    carousel.appendChild(carouselContents);
    carousel.appendChild(buttonRight);

    resultsContainer.appendChild(carousel);
    return { resultsContainer: resultsContainer, carousel: carousel };
}

export function displayGradeResults(grade) {
    const { name, epochTime, due, questions, numberCorrect } = grade;

    const container = document.createElement("div");
    container.classList.add("grade-container");
    
    const h3 = document.createElement("h3");
    h3.classList.add("grade-title");
    
    const h4 = document.createElement("h4");
    h4.classList.add("grade-subtitle");

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

        const questionContainer = createTestQuestionElement(question, userAnswer);

        const answerDiv = document.createElement("div");
        answerDiv.classList.add("answer-container");

        const userAnswerDiv = document.createElement("p");
        userAnswerDiv.innerText = `Usr: ${userAnswer}`;
        userAnswerDiv.classList.add("answer-user")
        
        const correctAnswerDiv = document.createElement("p");
        correctAnswerDiv.innerText = `Key: ${correctAnswer}`;
        correctAnswerDiv.classList.add("answer-correct")
        answerDiv.appendChild(userAnswerDiv);
        answerDiv.appendChild(correctAnswerDiv);
        
        const p = document.createElement("p");
        if (correct) {
            p.innerText = "Correct!";
        } else {
            p.innerText = "Incorrect.";
        }
        p.classList.add("correct-indicator")
        answerDiv.appendChild(p);
        questionContainer.appendChild(answerDiv);

        questionsContainer.appendChild(questionContainer);
    }

    container.appendChild(questionsContainer);

    return container;
}

export function createTestQuestionElement(testQuestionJSON, defaultValue) {
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
    answerDiv.value = defaultValue || "";

    questionDiv.appendChild(questionDescriptorDiv);
    questionDiv.appendChild(questionContentDiv);
    questionDiv.appendChild(answerDiv);
    questionDiv.appendChild(document.createElement("hr"));

    return questionDiv;
}