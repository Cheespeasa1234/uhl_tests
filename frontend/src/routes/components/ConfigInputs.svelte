<script lang="ts">
    import { type Preset, type PresetBlob } from "$lib/types";
    
    let preset: Preset | undefined = $state(undefined);
    let changedPreset: Preset | undefined = $state(undefined);
    let changedPresetBlob: PresetBlob = $state({});

    export function setPresetValue(newPreset: Preset): void{
        preset = newPreset;
        changedPreset = newPreset;
        changedPresetBlob = JSON.parse(newPreset.blob);
    }

    export function getPresetValue(): Preset | undefined {
        if (changedPreset === undefined) {
            return undefined;
        }

        changedPreset.blob = JSON.stringify(changedPresetBlob);
        return changedPreset;
    }
</script>

<div id="config-area">
    {#each Object.keys(changedPresetBlob) as prop}
        {@const propertyValue = changedPresetBlob[prop]}
        {@const { key, value, valueType } = propertyValue}

        <div class="input-group">
            <span class="input-group-text col-sm-4">
                {key}
            </span>
            <input type={valueType} bind:value={changedPresetBlob[prop].value} class="form-control col-sm-4" />
            <span class="input-group-text col-sm-1">
                {#if preset !== undefined && changedPresetBlob[prop].value !== JSON.parse(preset.blob)[prop].value}
                    *
                {/if}
            </span>
        </div>
    {/each}
</div>