<script lang="ts">
    import { type Test } from "$lib/types";
    import { getPresetList } from "$lib/util";
    import { showNotifToast } from "$lib/popups";
    import SelectPresetModal from "./modal/SelectPresetModal.svelte";
    
    let changedTestList: Test[] = $state([]);
    let names: { [id: string ]: string} = $state({});
    $inspect(changedTestList);
    $inspect(names);

    export function setTestListValue(newTests: Test[]): void{
        console.log("Setting new test list value");
        changedTestList = [...newTests];
    }

    export function getTestListValue(): Test[] {
        return changedTestList;
    }

    let selectPresetModal: SelectPresetModal;


    async function choose(testIndex: number) {
        const presetList = await getPresetList();
        if (presetList === undefined) {
            showNotifToast({ success: false, message: "Preset list is undefined."});
            return;
        }

        selectPresetModal.show(presetList, async (success, message, category, value, presetData) => {
            console.log("SELECTED PRESET IN TEST CODE COMPONENT", category, value, presetData);
            console.log("Will change preset id of: ", testIndex);
            if (category === "new") {
                showNotifToast({ success: false, message: "Cannot select a non-existent preset." });
                return;
            } else if (presetData === undefined) {
                showNotifToast({ success: false, message: "Something went wrong."});
                return;
            }

            showNotifToast({ success, message });
            changedTestList[testIndex].presetId = parseFloat(presetData.id);
            names[testIndex] = presetData.name;
        });
    }

</script>

<SelectPresetModal bind:this={selectPresetModal} />

<div id="config-area">
    {#each changedTestList as test, index}
        {@const { id, code, presetId, enabled, createdAt, updatedAt } = test}
        <div class="input-group mb-3">
            <span class="input-group-text">
                <input type="checkbox" bind:checked={changedTestList[index].enabled}>
            </span>
            <span class="input-group-text">Code</span>
            <input type="text" class="form-control" bind:value={changedTestList[index].code}>
            <span class="input-group-text">Preset&nbsp;<small>({names[index] || "DEFAULT"})</small></span>
            <span class="input-group-text">{changedTestList[index].presetId}</span>
            <button onclick={() => choose(index)} class="btn btn-outline-secondary" type="button">Choose...</button>
        </div>
    {/each}
</div>