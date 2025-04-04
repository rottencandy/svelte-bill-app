<script lang="ts">
    import type { Item } from "./types"

    let { items, useIGST = $bindable() }: { items: Item[]; useIGST: boolean } =
        $props()

    let otherAmount = $state(0)

    const totals = $derived.by(() => {
        let sum = 0
        let gst12 = 0
        let gst18 = 0
        let gst28 = 0
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const itemTotal = item.quantity * item.rate
            const itemTax = itemTotal * (item.gst / 100)
            sum += itemTotal
            switch (item.gst) {
                case 12:
                    gst12 += itemTax
                    break
                case 18:
                    gst18 += itemTax
                    break
                case 28:
                    gst28 += itemTax
                    break
            }
        }
        return {
            sum,
            gst12,
            gst18,
            gst28,
        }
    })

    const total = $derived(
        totals.sum + totals.gst12 + totals.gst18 + totals.gst28 + otherAmount,
    )

    const roundOff = $derived(Math.round(total))

    const printBill = () => {
        // TODO print logic would go here
        console.log("Printing bill...")
    }
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
    <div class="text-right">{totals.sum.toFixed(2)}</div>

    {#if totals.gst18 > 0}
        <div>{useIGST ? "18% IGST" : "9% CGST"}</div>
        <div class="text-right">{(totals.gst18 / 2).toFixed(2)}</div>

        {#if !useIGST}
            <div>9% SGST</div>
            <div class="text-right">{(totals.gst18 / 2).toFixed(2)}</div>
        {/if}
    {/if}

    {#if totals.gst28 > 0}
        <div>{useIGST ? "28% IGST" : "14% CGST"}</div>
        <div class="text-right">{(totals.gst28 / 2).toFixed(2)}</div>

        {#if !useIGST}
            <div>14% SGST</div>
            <div class="text-right">{(totals.gst28 / 2).toFixed(2)}</div>
        {/if}
    {/if}

    {#if totals.gst12 > 0}
        <div>{useIGST ? "12% IGST" : "6% CGST"}</div>
        <div class="text-right">{(totals.gst12 / 2).toFixed(2)}</div>

        {#if !useIGST}
            <div>6% SGST</div>
            <div class="text-right">{(totals.gst12 / 2).toFixed(2)}</div>
        {/if}
    {/if}

    <div class="font-bold">Other Amount</div>
    <input
        type="number"
        bind:value={otherAmount}
        class="flex-1 p-1 border rounded text-right"
    />

    <div class="font-bold">Total</div>
    <div class="text-right">{total.toFixed(2)}</div>

    <div class="font-bold">Round off</div>
    <div class="text-right">{roundOff.toFixed(2)}</div>
</div>

<div class="flex justify-center">
    <button
        onclick={printBill}
        class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
    >
        Print...
    </button>
</div>

<style>
</style>
