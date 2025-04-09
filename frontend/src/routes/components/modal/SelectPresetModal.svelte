<script lang="ts">
    import Modal from "./Modal.svelte";

    type SelectedCallback = (success: boolean, message: string, category?: string, value?: string) => void;

    let showModal: boolean = $state(false);
    let presetList: string[] = $state([]);
    let callback: SelectedCallback | undefined = $state(undefined);
    let tabsList: HTMLUListElement;

    let selectedPreExist: string | undefined = $state(undefined);
    let selectedNewName: string | undefined = $state(undefined);

    export function show(presetNames: string[], cb: SelectedCallback): void {
        presetList = presetNames;
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
            callback(true, "Success", "pre", selectedPreExist);
        } else if (activeButton.id === "selectPresetNewTab") {
            if (selectedNewName !== undefined && presetList.includes(selectedNewName)) {
                callback(false, `User tried to create a new preset '${selectedNewName}', but that already exists`);
            } else {
                callback(true, "Success", "new", selectedNewName);
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
        <ul bind:this={tabsList} class="nav nav-tabs" id="selectPresetTabsList" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="selectPresetPreTab" data-bs-toggle="tab"
                    data-bs-target="#preTab" type="button" role="tab" aria-controls="preTab"
                    aria-selected="true" data-tippy-content="A preset that has already been saved in the system">Pre-existing</button>

            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="selectPresetNewTab" data-bs-toggle="tab"
                    data-bs-target="#newTab" type="button" role="tab" aria-controls="newTab"
                    aria-selected="false" data-tippy-content="A new preset that will be created with the given name">New</button>

            </li>
        </ul>
        <div class="tab-content" id="selectPresetTabsContent">
            <div class="tab-pane fade show active" id="preTab" role="tabpanel"
                aria-labelledby="selectPresetPreTab">
                <select bind:value={selectedPreExist} class="form-select" aria-label="Select a pre-existing preset to use"
                    id="selectPresetModalPreExistInput">
                    {#each presetList as presetName, index}
                        {#if index === 0}
                            <option selected value={presetName}>{presetName}</option>
                        {:else}
                            <option value={presetName}>{presetName}</option>
                        {/if}
                    {/each}
                </select>
            </div>

            <div class="tab-pane fade" id="newTab" role="tabpanel" aria-labelledby="selectPresetNewTab">
                <div class="input-group">
                    <span class="input-group-text col-sm-6" id="selectPresetModalNameLabel">Name</span>
                    <input bind:value={selectedNewName} type="text" class="form-control" id="selectPresetModalNameInput"
                        aria-describedby="selectPresetModalNameLabel">
                </div>
            </div>
        </div>
    </div>
</Modal>