export type LineOfCode = {
  action: string;
  values: string[];
  nest_1?: LineOfCode[];
  nest_2?: LineOfCode[];
};

export type VariablesMap = { [id: string]: string };

export function compare(v1: string, v2: string, comp: string, variables: { [id: string]: string }): boolean {
  let answer = false;

  if (comp === "eq") {
    answer = variables[v1] === v2;
  } else if (comp === "neq") {
    answer = variables[v1] !== v2;
  } else if (comp === "gt") {
    answer = Number(variables[v1]) > Number(v2);
  } else if (comp === "lt") {
    answer = Number(variables[v1]) < Number(v2);
  } else if (comp === "gte") {
    answer = Number(variables[v1]) >= Number(v2);
  } else if (comp === "lte") {
    answer = Number(variables[v1]) <= Number(v2);
  } else {
    console.log("Invalid Operation!");
  }

  return answer;
}

/**
 * Stores all the data of the code environment. Can run single actions.
 */
export class CodeEnvironment {

  output: string[];
  variables: VariablesMap;

  constructor () {
    this.output = [];
    this.variables = {};
  }

  print(values: string[]) {
    this.output = this.output.concat(values);
  }

  printvar(values: string[]) {
    this.output = this.output.concat(values.map(name => this.variables[name]));
  }

  set(values: string[]) {
    const [variable, value, ..._] = [...values];
    this.variables[variable] = value;
  }

  if(values: string[], nest_1?: LineOfCode[], nest_2?: LineOfCode[]) {
    const [variable, comparator, value, ..._] = [...values];
    const result: boolean = compare(variable, value, comparator, this.variables);
    if (result) {
      if (nest_1) {
        this.execute(nest_1);
      }
    } else {
      if (nest_2) {
        this.execute(nest_2);
      }
    }

  }

  for(values: string[], nest?: LineOfCode[]) {
    const [initialVariableName, initialValue, variable, comparator, value, change, ..._] = [...values];

      // set the iterator
    this.variables[initialVariableName] = initialValue;

    
    // If it is true, run the code inside the loop
    while (true) {
      // console.log(`${initialVariableName} = ${this.variables[initialVariableName]}; ${variable} ${comparator} ${value}; ${variable} += ${change}`);
      // Check the condition
      const result: boolean = compare(variable, value, comparator, this.variables);

      if (result && nest) {
        this.execute(nest);
      } else {
        break;
      }
      
      // Run the changer
      this.variables[initialVariableName] = (Number(this.variables[initialVariableName]) + Number(change)) + "";
    }
  }
  
  execute(code: LineOfCode[]) {

    for (const line of code) {
      const { values, nest_1, nest_2 } = line;

      if (line.action === "print") {
        this.print(values);
      } else if (line.action === "printvar") {
        this.printvar(values);
      } else if (line.action === "set") {
        this.set(values);
      } else if (line.action === "if") {
        this.if(values, nest_1, nest_2);
      } else if (line.action === "for") {
        this.for(values, nest_1);
      }
    }
  }
  
  clear() {
    this.output = [];
    this.variables = {};
  }
}

export function stringify(line: LineOfCode, nestLevel: number = 0): string {
  const tabs = "  ".repeat(nestLevel);
  const tabsPlusOne = "  ".repeat(nestLevel + 1);
  if (!line.nest_1) {
    return `${tabs}${line.action} ${line.values}`;
  } else {
    let out = `${tabs}${line.action}(${line.values}):\n`;
    for (const subLine of line.nest_1) {
      out += tabsPlusOne + stringify(subLine, nestLevel + 1) + "\n";
    }
    
    if (line.nest_2) {
      out += `${tabsPlusOne}else\n`;
      for (const subLine of line.nest_2) {
        out += tabsPlusOne + stringify(subLine, nestLevel + 1) + "\n";
      }  
    }

    return out;
  }
}
