export type PresetValue = {
    key: string,
    value: string,
    valueType: string,
}

export type PresetBlob = {
    [key: string]: PresetValue,
}

export type Preset = {
    id: number,
    name: string,
    blob: string,
    createdAt: string,
    updatedAt: string,
}