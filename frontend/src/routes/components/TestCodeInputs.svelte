<script lang="ts">
    import { type Test } from "$lib/types";
    import { getPresetList, postJSON } from "$lib/util";
    import { showNotifToast } from "$lib/popups";
    import SelectPresetModal from "./modal/SelectPresetModal.svelte";
    import ConfirmModal from "./modal/ConfirmModal.svelte";
    
    let changedTestList: Test[] = $state([]);
    let ids = $derived(changedTestList.map(t => t.presetId).join(","));
    let names: { [id: string ]: string} = $state({});
    let delName = $state("");
    $inspect(changedTestList);

    export function setTestListValue(newTests: Test[]): void{
        console.log("Setting new test list value");
        changedTestList = [...newTests];

        postJSON("./api/grading/config/get_preset_names", {
            ids: ids
        }).then(json => {
            if (json.success) {
                names = json.data.names;
            }
        });
    }

    function del(id: number, name: string): void {
        delName = name;
        confirmModal.show(success => {
            if (success) {
                postJSON("./api/grading/config/del_testcode", {
                    id: id
                }).then(json => {
                    if (json.success) {
                        changedTestList = changedTestList.filter(test => test.id !== id)
                    }
                });
            } else {
                showNotifToast({ success, message: "Cancelled deletion." });
            }
        })
    }

    export function getTestListValue(): Test[] {
        return changedTestList;
    }

    let selectPresetModal: SelectPresetModal;
    let confirmModal: ConfirmModal;

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

<ConfirmModal showCancel bind:this={confirmModal}>
    {#snippet header()}
        <h2>Are you sure?</h2>
    {/snippet}
    {#snippet children()}
        <p>Are you sure you want to PERMANENTLY delete the testcode {delName}?</p>
    {/snippet}
</ConfirmModal>

<div id="config-area">
    {#each changedTestList as test, index}
        <div class="input-group mb-3">
            <span class="input-group-text">
                <input type="checkbox" bind:checked={changedTestList[index].enabled}>
            </span>
            <span class="input-group-text">Code</span>
            <input type="text" class="form-control" bind:value={changedTestList[index].code}>
            <span class="input-group-text">Preset&nbsp;<small>({names[changedTestList[index].presetId] || "DEFAULT"})</small></span>
            <span class="input-group-text">{changedTestList[index].presetId}</span>
            <button onclick={() => choose(index)} class="btn btn-outline-secondary" type="button">Choose...</button>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button onclick={() => del(changedTestList[index].id, changedTestList[index].code)} class="btn btn-outline-danger"><i class="fa-regular fa-trash-can"></i></button>
        </div>
    {/each}
</div>