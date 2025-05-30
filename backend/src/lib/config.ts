import { Preset, ConfigKey, ConfigValue } from "./db.ts";
import { logDebug, logError } from "./logger.ts";

/**
 * Stores a full copy of all presets, and manages the editing of presets.
 * Will only save to the database when the savePresets method is called.
 */
export class PresetManager {

    /**
     * The current preset loaded in the manager.
     */
    private currentPreset: Preset | null;
    
    constructor() {
        this.currentPreset = null;
    }

    /**
     * Returns whether or not the current preset is available. If it is null, it is unavailable.
     * @returns Whether or not the current preset is available
     */
    currentPresetExists(): boolean {
        return this.currentPreset !== null;
    }

    /**
     * Get the value of a key of the currently opened preset.
     */
    async getConfig(key: ConfigKey): Promise<ConfigValue> {
        const cur = await this.getCurrentPreset();
        return JSON.parse(cur.blob)[key]
    }

    /**
     * Gets the current preset loaded in this manager. If none is loaded, the default preset is loaded.
     * @returns The current preset.
     */
    async getCurrentPreset(): Promise<Preset> {
        if (this.currentPreset !== null) {
            logDebug("config", "Exists");
            return this.currentPreset;
        } else {
            logDebug("config", "DNE");
            this.currentPreset = await this.getDefaultPreset();
            logDebug("config", `New current preset: ${JSON.stringify(this.currentPreset)}`);
            return this.currentPreset;
        }
    }

    /**
     * Loads a different preset into the manager
     * @param preset The new preset to load
     */
    setCurrentPreset(preset: Preset) {
        logDebug("config", `Set current preset from ${JSON.stringify(this.currentPreset)} to ${JSON.stringify(preset)}`)
        this.currentPreset = preset;
    }

    /**
     * Gets the preset with id=0 and name=DEFAULT from the database. If no preset is found, it exits the program.
     * @returns The default preset
     */
    async getDefaultPreset(): Promise<Preset> {
        const def: Preset | null = await Preset.findOne({
            where: {
                id: 0,
                name: "DEFAULT",
            }
        });
        if (def === null) {
            logError("config", "Could not find default preset...");
            Deno.exit(2);
        }

        return def;
    }

}