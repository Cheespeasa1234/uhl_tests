<script lang="ts">
    let timeEnd: string = $state(new Date(new Date().getTime() + 10000).toString());
    let int: number | null = null;
    let secondsRemaining: number = $state(0);
    let textRemaining: string | null = $state("00:00");

    function reloadCalculations() {
        console.log("Reloading calculations!");
        const now = Date.now();
        const end = new Date(timeEnd).getTime();
        secondsRemaining = Math.floor((end - now) / 1000);
        const min = Math.floor(secondsRemaining / 60);
        const sec = secondsRemaining % 60;

        textRemaining = `${min}:${sec}`;
    }

    export function setTimeEnd(time: string) {
        timeEnd = time;
        reloadCalculations();

        if (int !== null) {
            clearInterval(int);
        }
        int = setInterval(reloadCalculations, 1000);
    }

</script>

{#if secondsRemaining !== null}
    {#if secondsRemaining <= 0}
        <div class="outoftime">{textRemaining}</div>
    {:else if secondsRemaining <= 60 * 5}
        <div class="warning">{textRemaining}</div>
    {:else}
        <div class="normal">{textRemaining}</div>
    {/if}
{/if}

<style>

    @keyframes shake {
        from {
            transform: rotate(5deg);
        }
        to {
            transform: rotate(-5deg);
        }
    }
    .normal {
        color: black;
    }

    .warning {
        color: orange;
    }

    .outoftime {
        color: red;
        animation: 0.06s shake ease-in-out alternate infinite;
    }
</style>