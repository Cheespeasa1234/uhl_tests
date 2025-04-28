<script lang="ts">
    import type { Preset, PresetListEntry } from "$lib/types";
    import Modal from "./Modal.svelte";

    type SelectedCallback = (success: boolean) => void;

    let showModal: boolean = $state(false);
    let callback: SelectedCallback | undefined = $state(undefined);
    let message: string = $state("Are you sure?");

    export function show(msg: string, cb: SelectedCallback): void {
        callback = cb;
        showModal = true;
        message = msg;
    }

    function okay() {
        if (callback === undefined) {
            throw new Error("No callback provided");
        }
        callback(true)
        callback = undefined;
        showModal = false;
    }

    function cancel() {
        if (callback === undefined) {
            throw new Error("No callback provided");
        }
        
        callback(false);
        callback = undefined;
        showModal = false;
    }
</script>

<Modal bind:showModal>
    {#snippet header()}
        <h2>Are you sure?</h2>
    {/snippet}

    {#snippet footer()}
        <button type="button" onclick={okay} class="btn btn-primary">Okay</button>
        <button type="button" onclick={cancel} class="btn btn-secondary">Cancel</button>
    {/snippet}

    <div>
        {message}
    </div>
</Modal>