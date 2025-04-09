/**
 * Exports types related to Presets.
 */

/**
 * A config value inside of a preset
 */
export type PresetValue = {
    /**
     * The name of the value
     */
    key: string,

    /**
     * The actual stringified value
     */
    value: string,

    /**
     * Either "number", "string", or "boolean"
     */
    valueType: string,
}

/**
 * A map of strings to PresetValues
 */
export type PresetBlob = {
    [key: string]: PresetValue,
}

/**
 * A preset
 */
export type Preset = {
    /**
     * The ID in the database
     */
    id: number,

    /**
     * The display name
     */
    name: string,

    /**
     * The stringified PresetBlob.
     * Before operating on it, parse it to a PresetBlob.
     */
    blob: string,

    /**
     * A string ISO date of when the database entry was created.
     * Convert it to a date before operating on it.
     */
    createdAt: string,

    /**
     * A string ISO date of when the database entry was last updated.
     * Convert it to a date before operating on it.
     */
    updatedAt: string,
}