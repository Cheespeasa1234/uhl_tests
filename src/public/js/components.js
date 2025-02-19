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