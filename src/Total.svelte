<script lang="ts">
    import type { Item, Total } from "./types"

    let {
        items,
        total,
        useIGST = $bindable(),
        otherAmount = $bindable(),
    }: {
        items: Item[]
        total: Total
        useIGST: boolean
        otherAmount: number
    } = $props()

    const finalTotal = $derived(
        total.sum + total.gst12 + total.gst18 + total.gst28 + otherAmount,
    )

    const roundOff = $derived(Math.round(finalTotal))
</script>

<div class="bg-gray-200 p-4 rounded grid grid-cols-2 gap-4 mb-6">
    <div class="flex justify-between items-center">
        <label>
            <input type="checkbox" bind:checked={useIGST} class="mr-2" />
            IGST
        </label>
    </div>
    <div></div>

    <div class="font-bold">Sub Total</div>
    <div class="text-right">{total.sum.toFixed(2)}</div>

    {#if total.gst18 > 0}
        <div>{useIGST ? "18% IGST" : "9% CGST"}</div>
        <div class="text-right">{(total.gst18 / 2).toFixed(2)}</div>

        {#if !useIGST}
            <div>9% SGST</div>
            <div class="text-right">{(total.gst18 / 2).toFixed(2)}</div>
        {/if}
    {/if}

    {#if total.gst28 > 0}
        <div>{useIGST ? "28% IGST" : "14% CGST"}</div>
        <div class="text-right">{(total.gst28 / 2).toFixed(2)}</div>

        {#if !useIGST}
            <div>14% SGST</div>
            <div class="text-right">{(total.gst28 / 2).toFixed(2)}</div>
        {/if}
    {/if}

    {#if total.gst12 > 0}
        <div>{useIGST ? "12% IGST" : "6% CGST"}</div>
        <div class="text-right">{(total.gst12 / 2).toFixed(2)}</div>

        {#if !useIGST}
            <div>6% SGST</div>
            <div class="text-right">{(total.gst12 / 2).toFixed(2)}</div>
        {/if}
    {/if}

    <div class="font-bold">Other Amount</div>
    <input
        type="number"
        bind:value={otherAmount}
        class="flex-1 p-1 border rounded text-right"
    />

    <div class="font-bold">Total</div>
    <div class="text-right">{finalTotal.toFixed(2)}</div>

    <div class="font-bold">Round off</div>
    <div class="text-right">{roundOff.toFixed(2)}</div>
</div>

<style>
</style>
