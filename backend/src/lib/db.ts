import { Sequelize, DataTypes, Model } from "npm:sequelize";
import { logInfo } from "./logger.ts";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./db/responses.db",
    logging: (...msg) => {
        logInfo("db/sqlz", msg);
    },
});

export type PresetData = Map<ConfigKey, ConfigValue>;
export function parsePresetData(blob: string): PresetData {
    const data: PresetData = new Map();
    const json = JSON.parse(blob);
    for (const configKey in json) {
        const configValue = json[configKey];
        const valueType = configValue["valueType"];
        const key = configValue["key"];
        const value = configValue["value"];
        data.set(configKey as ConfigKey, new ConfigValue(valueType, key, value));
    }
    return data;
}

export enum ConfigKey {
    FOR_LOOP_COUNT = "For Loop Count",
    NESTED_FOR_LOOP_COUNT = "Nested For Loop Count",
    STRING_COUNT = "String Count",
    SUM_PROD_LOOP = "Sum Prod Loop"
}

export enum ConfigValueType {
    NUMBER = "number",
    STRING = "string",
    BOOLEAN = "boolean"
}

export class ConfigValue {
    valueType: ConfigValueType;
    key: ConfigKey;
    value: string;

    constructor (valueType: ConfigValueType, key: ConfigKey, value: string) {
        this.valueType = valueType;
        this.key = key;
        this.value = value;
    }

    getNumberValue(): number {
        if (this.valueType === ConfigValueType.NUMBER) {
            const n = Number(this.value);
            if (Number.isFinite(n)) return n;
            else throw new Error(`Could not parse ${this.value} to a number`);
        } else {
            throw new Error(`Valuetype ${this.valueType} is not a number`);
        }
    }

    getStringValue(): string {
        if (this.valueType === ConfigValueType.STRING) {
            return this.value;
        } else {
            throw new Error(`Valuetype ${this.valueType} is not a string`);
        }
    }

    getBooleanValue(): boolean {
        if (this.valueType === ConfigValueType.BOOLEAN) {
            if (this.value === "true") return true;
            else if (this.value === "false") return false;
            else throw new Error(`Could not parse ${this.value} to a boolean`);
        } else {
            throw new Error(`Valuetype ${this.valueType} is not a boolean`);
        }
    }
}

export class Preset extends Model {
    declare id: number;
    declare name: string;
    declare blob: string;
    declare createdAt: Date;
    declare updatedAt: Date;
}

Preset.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    blob: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "{}",
    }
}, {
    timestamps: true,
    sequelize: sequelize
});

export class Test extends Model {
    declare id: number;
    declare code: string;
    declare presetId: number;
    declare enabled: boolean;
}

Test.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    presetId: {
        type: DataTypes.INTEGER,
        references: {
            model: Preset,
            key: "id",
        }
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    sequelize: sequelize,
});

export class Submission extends Model {
    declare id: number;
    declare email: string;
    declare idCookie: string;
    declare answerCode: string;
    declare testId: number;
    declare responseBlob: string;
    declare timeStart: string;
    declare timeSubmitted: string;
    declare timeDue: string;
    declare createdAt: Date;
    declare updatedAt: Date;

    getStart(): Date {
        return new Date(this.timeStart);
    }

    getSubmitted(): Date {
        return new Date(this.timeSubmitted);
    }

    getEnd(): Date {
        return new Date(this.timeDue);
    }

    getBlob(): any {
        return JSON.parse(this.responseBlob);
    }

    async getTestCode(): Promise<string> {
        const test = await Test.findOne({
            where: {
                id: this.testId
            }
        });

        if (test)
            return test.code;
        else return "";
    }
}

Submission.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    idCookie: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    answerCode: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    testId: {
        type: DataTypes.INTEGER,
        references: {
            model: Test,
            key: "id",
        }
    },
    responseBlob: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timeStart: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timeSubmitted: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timeDue: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    timestamps: true,
    sequelize: sequelize,
});

await sequelize.sync();
await Submission.sync();
await Test.sync();

await Preset.sync();
function syncPresetBlob(blob_: any): any {
    const values = Object.values(ConfigKey);
    const blob = {...blob_};
    for (const key of values) {
        if (!blob[key]) {
            logInfo("db/sync", "Had to expand preset");
            blob[key] = {"valueType":"number","key":key,"value":0}
        }
    }
    return blob;
}

async function updateAllPresetBlobs() {
    const presets: Preset[] = await Preset.findAll();
    for (const preset of presets) {
        let blob = JSON.parse(preset.blob);
        preset.blob = JSON.stringify(syncPresetBlob(blob));
        await preset.save();
    }
}

await updateAllPresetBlobs();