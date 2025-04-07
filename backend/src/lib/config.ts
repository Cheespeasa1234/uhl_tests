import { Preset, ConfigKey, ConfigValue } from "./db_sqlz.ts";

/**
 * Stores a full copy of all presets, and manages the editing of presets.
 * Will only save to the database when the savePresets method is called.
 */
export class PresetManager {

    presets: Record<string, Preset>;
    currentPreset?: Preset;
    
    constructor() {
        this.presets = {};
    }

    currentPresetExists(): boolean {
        return this.currentPreset !== undefined && this.currentPreset !== null;
    }

    /**
     * Get the value of a key of the currently opened preset.
     */
    getConfig(key: ConfigKey): ConfigValue {
        return this.currentPreset!.getPresetData()[key];
    }
    
    /**
     * Read in the presets from the preset JSON file.
     * @returns The presets
     */
    async downloadPresets(): Promise<Record<string, Preset>> {
        const presets: Preset[] = await Preset.findAll();
        const json: Record<string, Preset> = {};
        for (const preset of presets) {
            json[preset.name] = preset;
        }

        return json;
    }
    
    /**
     * Saves the changes made to a file.
     */
    async savePresets() {
        for (const [name, preset] of Object.entries(this.presets)) {
            const presetBlob = JSON.stringify(preset);
            const presetObj: Preset | null = await Preset.findOne({
                where: {
                    name: name
                }
            })
            
            if (presetObj === null) {
                Preset.update({
                    blob: presetBlob,
                }, {
                    where: {
                        name: name,
                    }
                })
            } else {
                Preset.create({
                    blob: presetBlob,
                    name: name
                })
            }
        }
    }
    
    /**
     * Download the presets again.
     */
    async loadPresets(): Promise<void> {
        this.presets = await this.downloadPresets();
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

    async getDefaultPreset(): Promise<Preset | null> {
        const def: Preset = await Preset.findOne({
            where: {
                id: 0,
                name: "DEFAULT",
            }
        });
        console.log(def.toJSON());
        return def.toJSON();
    }

}