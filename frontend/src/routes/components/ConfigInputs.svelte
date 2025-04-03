<script lang="ts">
    import { type PresetValue, type Preset } from "$lib/preset";
    const { preset }: { preset: Preset } = $props();
    const presetProperties = Object.keys(preset);
    
    export function getPresetValue(): Preset {
        return preset;
    }
</script>

<div id="config-area">
    {#each presetProperties as prop}
        {@const propertyValue = preset[prop]}
        {@const { key, value, valueType } = propertyValue}

        <div class="input-group">
            <span class="input-group-text col-sm-6">
                {key}
            </span>
            <input type={valueType} bind:value={preset[prop].value} class="form-control" />
        </div>
    {/each}
</div>