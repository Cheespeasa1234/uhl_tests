<script lang="ts">
    import { fetchToJsonMiddleware } from "$lib/util";

    const { name, url }: { name: string, url: string } = $props();

    let header: string[] = $state([]);
    let rows: string[][] = $state([]);

    export function refresh() {
        fetch(url)
        .then(fetchToJsonMiddleware)
        .then(json => {
            const { success, data } = json;
            if (success) {
                header = data.header;
                rows = data.rows;
            }
        });
    }

</script>

<div class="p-3">
    <h4>{name}</h4>
    <div class="container">
        <table style="table-layout: fixed">
            <thead>
                <tr>
                    {#each header as h}
                        <th>{h}</th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each rows as row}
                    <tr>
                        {#each row as cell, i}
                            {#if i === 0}
                                <th scope="row">
                                    <span style="display: none">{new Date(cell).getTime()}</span>
                                    {cell}
                                </th>
                            {:else}
                                <td>{cell}</td>
                            {/if}
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    
    <button onclick={refresh} class="btn btn-primary" type="button">Refresh</button>
</div>
