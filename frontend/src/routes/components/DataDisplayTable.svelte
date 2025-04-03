<script lang="ts">
    import { fetchToJsonMiddleware } from "$lib/util";
    import { TableHandler, Datatable, ThSort, ThFilter } from "@vincjo/datatables";

    const { name, url, row_heads }: { name: string, url: string, row_heads: { key: string, name: string }[] } = $props();

    let table: TableHandler | undefined = $state(undefined);

    export function refresh() {
        fetch(url)
        .then(fetchToJsonMiddleware)
        .then(json => {
            const { success, data } = json;
            if (success) {
                table = new TableHandler(data.rows, { rowsPerPage: 10 });
            }
        });
    }

</script>

<div class="p-3">
    <h4>{name}</h4>
    <div class="container">
        {#if table !== undefined}
            <Datatable basic {table}>
                <table>
                    <thead>
                        <tr>
                            {#each row_heads as row_head}
                                <ThSort {table} field={row_head.key}>{row_head.name}</ThSort>
                            {/each}
                        </tr>
                        <tr>
                            {#each row_heads as row_head}
                                <ThFilter {table} field={row_head.key} />
                            {/each}
                        </tr>
                    </thead>
                    <tbody>
                        {#each table.rows as row}
                            <tr>
                                {#each row_heads as row_head}
                                    <td>{row[row_head.key]}</td>
                                {/each}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </Datatable>
        {/if}
    </div>    
    <button onclick={refresh} class="btn btn-primary" type="button">Refresh</button>
</div>
