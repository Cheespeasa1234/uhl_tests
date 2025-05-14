<script lang="ts">
    const { children } = $props();
</script>

<button>{@render children()}</button>

<style>
    /* From Uiverse.io by elijahgummer */ 
    /* Adapted slightly */ 
    button {
        margin: 0px 5px;
        background-color: #f0f0f0;
        border: 0;
        color: #242424;
        border-radius: 0.5em;
        font-size: 0.75rem;
        padding: 0.1em 0.8em;
        font-weight: 600;
        box-shadow: inset 0 0.0625em 0 0 #f4f4f4, 0 0.0625em 0 0 #efefef,
            0 0.125em 0 0 #ececec, 0 0.25em 0 0 #e0e0e0, 0 0.3125em 0 0 #dedede,
            0 0.375em 0 0 #dcdcdc, 0 0.425em 0 0 #cacaca, 0 0.425em 0.5em 0 #cecece;
        transition: 0.1s ease;
        cursor: pointer;
        transform: translateY(-2.5px);
    }

    button:active {
        translate: 0 0.225em;
        box-shadow: inset 0 0.03em 0 0 #f4f4f4, 0 0.03em 0 0 #efefef,
            0 0.0625em 0 0 #ececec, 0 0.125em 0 0 #e0e0e0, 0 0.125em 0 0 #dedede,
            0 0.2em 0 0 #dcdcdc, 0 0.225em 0 0 #cacaca, 0 0.225em 0.375em 0 #cecece;
    }
</style>