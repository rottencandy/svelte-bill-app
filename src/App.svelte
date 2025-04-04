<script lang="ts">
    import type { Item, Bill, Party } from "./types"
    import PartyDetails from "./PartyDetails.svelte"
    import BillDetails from "./BillDetails.svelte"
    import Items from "./Items.svelte"
    import Total from "./Total.svelte"

    let partyDetails = $state<Party>({
        name: "",
        address: "",
        tin: "",
        privateMark: "",
    })
    let billDetails = $state<Bill>({
        // get today in the format yyyy-mm-dd
        date: new Date().toISOString().slice(0, 10),
        // TODO set from db
        invoice: 0,
        transport: "",
        paymentTerms: "",
        esugam: "",
    })
    let items = $state<Item[]>([])
    let useIGST = $state(false)
    let otherAmount = $state(0)

    const total = $derived.by(() => {
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

    const fillAndClose = () => {}

    const finalPrint = () => {}

    const finalSave = () => {}

    const printBill = () => {
        // TODO print logic would go here
        console.log("Printing bill...")
    }
</script>

<main>
    <div class="container mx-auto p-4 max-w-6xl">
        <h1 class="text-2xl font-bold text-center bg-green-200 p-2 mb-4">
            TAX INVOICE
        </h1>

        <div class="flex mb-6 gap-4">
            <PartyDetails bind:party={partyDetails} />
            <BillDetails bind:bill={billDetails} />
        </div>

        <div class="border p-4 rounded mb-6">
            <h2 class="font-bold mb-2">Items</h2>
            <Items bind:items />
        </div>

        <Total {total} bind:useIGST bind:otherAmount />

        <div class="flex justify-center">
            <button
                onclick={printBill}
                class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
                Print...
            </button>
        </div>
    </div>
</main>

<style>
</style>
