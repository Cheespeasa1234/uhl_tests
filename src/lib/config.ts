import { db, DB_Preset, selectDB_Preset, selectDB_PresetById } from "./db.ts";

export type Preset = Record<ConfigKey, ConfigValue>;

export enum ConfigKey {
    FOR_LOOP_COUNT = "For Loop Count",
    NESTED_FOR_LOOP_COUNT = "Nested For Loop Count",
    STRING_COUNT = "String Count",
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

export class PresetManager {

    presets: Record<string, Preset>;
    currentPreset: Preset;
    
    constructor() {
        this.presets = this.downloadPresets();
        this.currentPreset = this.getDefaultPreset();
    }

    /**
     * Get the value of a key of the currently opened preset.
     */
    getConfig(key: ConfigKey): ConfigValue {
        console.log("Current preset: " + JSON.stringify(this.currentPreset[key]));
        return this.currentPreset[key];
    }
    
    /**
     * Read in the presets from the preset JSON file.
     * @returns The presets
     */
    downloadPresets(): Record<string, Preset> {
        const presets: DB_Preset[] = selectDB_Preset();
        const json: Record<string, Preset> = {};
        for (const preset of presets) {
            json[preset.name] = JSON.parse(preset.blob);
        }

        return json;
    }
    
    /**
     * Saves the changes made to a file.
     */
    savePresets() {
        for (const [name, preset] of Object.entries(this.presets)) {
            const presetBlob = JSON.stringify(preset);
            const presetId = selectDB_Preset().find((p) => p.name === name)?.id;
            if (presetId) {
                // Update
                db.prepare("UPDATE Presets SET name = ?, blob = ? WHERE id = ?").run(name, presetBlob, presetId);
            } else {
                // Insert
                db.prepare("INSERT INTO Presets (name, blob) VALUES (?, ?)").run(name, presetBlob);
            }
        }
    }
    
    /**
     * Download the presets again.
     */
    loadPresets(): void {
        this.presets = this.downloadPresets();
    }
    
    /**
     * Gets the value of a given preset.
     * @param presetName The name of the preset
     * @returns The preset
     */
    getPreset(presetName: string): Preset | undefined {
        return this.presets[presetName];
    }
    
    /**
     * Sets the value of a preset.
     * @param presetName The name of the preset to set
     * @param presetValue The new value of the preset
     */
    setPreset(presetName: string, presetValue: Preset) {
        this.presets[presetName] = presetValue;
        this.savePresets();
    }

    listOfPresets(): string[] {
        return Object.keys(this.presets);
    }

    getDefaultPreset(): Preset {
        return JSON.parse(selectDB_PresetById(0).blob);
    }

}