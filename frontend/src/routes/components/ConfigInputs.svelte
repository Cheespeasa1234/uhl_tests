<script lang="ts">
    import { type PresetValue, type Preset } from "$lib/preset";
    const { preset }: { preset: Preset } = $props();
    const { blob } = preset;
    const presetBlob = JSON.parse(blob);
    const presetProperties = Object.keys(presetBlob);
    
    export function getPresetValue(): Preset {
        return presetBlob;
    }
</script>

<div id="config-area">
    {#each presetProperties as prop}
        {@const propertyValue = presetBlob[prop]}
        {@const { key, value, valueType } = propertyValue}

        <div class="input-group">
            <span class="input-group-text col-sm-6">
                {key}
            </span>
            <input type={valueType} bind:value={presetBlob[prop].value} class="form-control" />
        </div>
    {/each}
</div>