<script lang="ts">
    import type { Preset, PresetListEntry } from "$lib/types";
    import Modal from "./Modal.svelte";

    type categoryName = "pre" | "new";
    type SelectedCallback = (success: boolean, message: string, category?: categoryName, value?: string, presetData?: PresetListEntry) => void;

    let showModal: boolean = $state(false);
    let presetList: PresetListEntry[] = $state([]);
    let callback: SelectedCallback | undefined = $state(undefined);
    let tabsList: HTMLUListElement;

    let selectedPreExist: PresetListEntry | undefined = $state(undefined);
    let selectedNewName: string | undefined = $state(undefined);

    export function show(presets: PresetListEntry[], cb: SelectedCallback): void {
        presetList = presets;
        callback = cb;
        showModal = true;
    }

    function okay() {
        if (callback === undefined) {
            throw new Error("No callback provided");
        }
        // Get active tab
        const activeButton = tabsList.querySelector("button.nav-link.active");
        if (activeButton == null) {
            callback(false, "No active tab found. Could not determine category.");
        } else if (activeButton.id === "selectPresetPreTab") {
            callback(true, "Success", "pre", selectedPreExist?.name, selectedPreExist);
        } else if (activeButton.id === "selectPresetNewTab") {
            let exists = false;
            for (const preset of presetList) {
                if (preset.name == selectedNewName) {
                    exists = true;
                    break;
                }
            }
            
            if (selectedNewName === undefined) {
                callback(false, `User tried to create a new preset '${selectedNewName}', but no name was given`);
            } else if (exists) {
                callback(false, `User tried to create a new preset '${selectedNewName}', but that already exists`);
            } else {
                callback(true, "Success", "new", selectedNewName, { id: "-1", name: selectedNewName });
            }
        }
        callback = undefined;
        showModal = false;
    }

    function cancel() {
        if (callback === undefined) {
            throw new Error("No callback provided");
        }
        
        callback(false, "Operation was cancelled.");
        callback = undefined;
        showModal = false;
    }

    const id = Date.now();
</script>

<Modal bind:showModal>
    {#snippet header()}
        <h2>Select a Preset</h2>
    {/snippet}

    {#snippet footer()}
        <button type="button" onclick={okay} class="btn btn-primary">Okay</button>
        <button type="button" onclick={cancel} class="btn btn-secondary">Cancel</button>
    {/snippet}

    <div>
        <ul bind:this={tabsList} class="nav nav-tabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="selectPresetPreTab" data-bs-toggle="tab"
                    data-bs-target="#preTab{id}" type="button" role="tab" aria-controls="preTab"
                    aria-selected="true" data-tippy-content="A preset that has already been saved in the system">Pre-existing</button>

            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="selectPresetNewTab" data-bs-toggle="tab"
                    data-bs-target="#newTab{id}" type="button" role="tab" aria-controls="newTab"
                    aria-selected="false" data-tippy-content="A new preset that will be created with the given name">New</button>

            </li>
        </ul>
        <div class="tab-content" >
            <h3>Select Preset</h3>
            <div class="tab-pane fade show active" id="preTab{id}" role="tabpanel"
                aria-labelledby="selectPresetPreTab">
                <select bind:value={selectedPreExist} class="form-select" aria-label="Select a pre-existing preset to use"
                    id="selectPresetModalPreExistInput">
                    {#each presetList as preset, index}
                        {#if index === 0}
                            <option selected value={preset}>{preset.name}</option>
                        {:else}
                            <option value={preset}>{preset.name}</option>
                        {/if}
                    {/each}
                </select>
            </div>

            <div class="tab-pane fade" id="newTab{id}" role="tabpanel" aria-labelledby="selectPresetNewTab">
                <h3>Create New</h3>
                <div class="input-group">
                    <span class="input-group-text col-sm-6" id="selectPresetModalNameLabel">Name</span>
                    <input bind:value={selectedNewName} type="text" class="form-control" id="selectPresetModalNameInput"
                        aria-describedby="selectPresetModalNameLabel">
                </div>
            </div>
        </div>
    </div>
</Modal>