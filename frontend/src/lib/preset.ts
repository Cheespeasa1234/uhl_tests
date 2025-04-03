export type PresetValue = {
    key: string,
    value: string,
    valueType: string,
}

export type Preset = {
    [key: string]: PresetValue
}