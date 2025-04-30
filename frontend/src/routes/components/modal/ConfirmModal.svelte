<script lang="ts">
    import type { Preset, PresetListEntry } from "$lib/types";
    import type { Snippet } from "svelte";
    import Modal from "./Modal.svelte";

    const { showCancel = false, header, children }: { showCancel?: boolean, header: Snippet, children: Snippet } = $props();

    type SelectedCallback = (success: boolean) => void;

    let showModal: boolean = $state(false);
    let callback: SelectedCallback | undefined = $state(undefined);

    export function show(cb: SelectedCallback): void {
        callback = cb;
        showModal = true;
    }

    function okay() {
        if (callback === undefined) {
            throw new Error("No callback provided");
        }
        callback(true);
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

<Modal children={children} header={header} bind:showModal>
    {#snippet footer()}
        <button type="button" onclick={okay} class="btn btn-primary">Okay</button>
        {#if showCancel}
            <button type="button" onclick={cancel} class="btn btn-secondary">Cancel</button>
        {/if}
    {/snippet}
</Modal>