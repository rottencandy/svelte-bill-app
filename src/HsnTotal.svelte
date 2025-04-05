<script lang="ts">
    import type { Item } from "./types"
    import { calculateTotalsByHsn } from "./util"

    let { items }: { items: Item[] } = $props()

    const hsnTotals = $derived(Object.entries(calculateTotalsByHsn(items)))
</script>

{#if hsnTotals.length > 0}
    <div class="bg-gray-100 p-4 border rounded">
        <!-- title -->
        <div class="grid grid-cols-4 gap-2 mb-2 bg-blue-200 p-2">
            <div>HSN</div>
            <div>Taxable Value</div>
            <div>GST</div>
            <div>Total Tax</div>
        </div>

        <!-- rows -->
        {#each hsnTotals as [hsn, { gst, rate }]}
            <div class="grid grid-cols-4 gap-2 mb-4 border-b odd:bg-gray-100">
                <div class="p-1">{hsn}</div>
                <div class="p-1">{gst}%</div>
                <div class="p-1">{rate.toFixed(2)}</div>
                <div class="p-1">{(rate * (gst / 100)).toFixed(2)}</div>
            </div>
        {/each}
    </div>
{/if}

<style>
</style>
