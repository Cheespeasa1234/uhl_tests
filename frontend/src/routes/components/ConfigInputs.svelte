<script lang="ts">
    import { type Preset, type PresetBlob } from "$lib/preset";
    
    let preset: Preset | undefined = $state(undefined);
    let changedBlob: PresetBlob = $state({});

    export function setPresetValue(newPreset: Preset): void{
        preset = newPreset;
        changedBlob = JSON.parse(preset.blob);
    }

    export function getPresetValue(): Preset | undefined {
        if (preset === undefined) {
            return undefined;
        }

        preset.blob = JSON.stringify(changedBlob);
        return preset;
    }
</script>

<div id="config-area">
    {#each Object.keys(changedBlob) as prop}
        {@const propertyValue = changedBlob[prop]}
        {@const { key, value, valueType } = propertyValue}

        <div class="input-group">
            <span class="input-group-text col-sm-4">
                {key}
            </span>
            <input type={valueType} bind:value={changedBlob[prop].value} class="form-control col-sm-4" />
            <span class="input-group-text col-sm-1">
                {#if preset !== undefined && changedBlob[prop].value !== JSON.parse(preset.blob)[prop].value}
                    *
                {/if}
            </span>
        </div>
    {/each}
</div>