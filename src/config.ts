export const PRESETS_JSON_FILE = "../files/presets.json";

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
    static readonly defaultPreset: Readonly<Preset> = {
        [ConfigKey.FOR_LOOP_COUNT]: new ConfigValue(
            ConfigValueType.NUMBER,
            ConfigKey.FOR_LOOP_COUNT,
            "2"
        ),
        [ConfigKey.NESTED_FOR_LOOP_COUNT]: new ConfigValue(
            ConfigValueType.NUMBER,
            ConfigKey.NESTED_FOR_LOOP_COUNT,
            "2"
        ),
        [ConfigKey.STRING_COUNT]: new ConfigValue(
            ConfigValueType.NUMBER,
            ConfigKey.STRING_COUNT,
            "2"
        ),
    }
    presets: Record<string, Preset>;
    currentPreset: Preset;
    
    constructor() {
        this.presets = this.downloadPresets();
        this.currentPreset = PresetManager.defaultPreset;
    }

    getConfig(key: ConfigKey): ConfigValue {
        return this.currentPreset[key];
    }
    
    downloadPresets(): Record<string, Preset> {
        const text: string = Deno.readTextFileSync(PRESETS_JSON_FILE);
        const json: Record<string, Preset> = JSON.parse(text) as Record<string, Preset>;
        return json;
    }
    
    savePresets() {
        const text: string = JSON.stringify(this.presets, null, 1);
        Deno.writeTextFile(PRESETS_JSON_FILE, text);
    }
    
    loadPresets(): void {
        this.presets = this.downloadPresets();
    }
    
    getPreset(presetName: string): Preset | undefined {
        return this.presets[presetName];
    }
    
    setPreset(presetName: string, presetValue: Preset) {
        this.presets[presetName] = presetValue;
    }

}

(()=>{

    const pm: PresetManager = new PresetManager();
    pm.currentPreset = pm.getPreset("myPreset")!;
    console.log(pm.getConfig(ConfigKey.FOR_LOOP_COUNT));
    console.log(pm.getConfig(ConfigKey.NESTED_FOR_LOOP_COUNT));
    console.log(pm.getConfig(ConfigKey.STRING_COUNT));

})()