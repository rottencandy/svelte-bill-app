<script lang="ts">
    import type { Item, Bill, Party } from "./types"
    import PartyDetails from "./PartyDetails.svelte"
    import BillDetails from "./BillDetails.svelte"
    import Items from "./Items.svelte"
    import Total from "./Total.svelte"
    import PrintDialog from "./PrintDialog.svelte"
    import { fillAllData } from "./billprinter"
    import { getInvoiceNo } from "./database"

    let printDialogElement: any
    let billDetailsElement: any

    let partyDetails = $state<Party>({
        name: "",
        address: "",
        tin: "",
        privateMark: "",
    })
    let billDetails = $state<Bill>({
        // get today in the format yyyy-mm-dd
        date: new Date().toISOString().slice(0, 10),
        invoice: getInvoiceNo(),
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
        let total12 = 0
        let total18 = 0
        let total28 = 0
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const itemTotal = item.quantity * item.rate
            const itemTax = itemTotal * (item.gst / 100)
            sum += itemTotal
            switch (item.gst) {
                case 12:
                    gst12 += itemTax
                    total12 += itemTotal
                    break
                case 18:
                    gst18 += itemTax
                    total18 += itemTotal
                    break
                case 28:
                    gst28 += itemTax
                    total28 += itemTotal
                    break
            }
        }
        return {
            sum,
            // amout of tax that each bracket amounts to
            gst12,
            gst18,
            gst28,
            // principal amount that is taxable in each bracket
            total12,
            total18,
            total28,
        }
    })

    const finalTotal = $derived(
        total.sum + total.gst12 + total.gst18 + total.gst28 + otherAmount,
    )

    const fillAndClose = () => {
        fillAllData(
            partyDetails,
            billDetails,
            items,
            useIGST,
            total.sum,
            finalTotal,
            total.gst12,
            total.gst18,
            total.gst28,
            otherAmount,
            total.total12,
            total.total18,
            total.total28,
        )
    }

    const finalPrint = (copies: number) => {
        fillAndClose()
    }

    const finalSave = (copies: number) => {
        fillAndClose()
    }

    const printBill = () => {
        // TODO print logic would go here
        console.log("Printing bill...")
        printDialogElement.open()
    }

    const handlePartyDetailAutofill = () => {
        billDetailsElement.focus()
    }
</script>

<main>
    <div class="container mx-auto p-4 max-w-6xl">
        <h1 class="text-2xl font-bold text-center bg-green-200 p-2 mb-4">
            TAX INVOICE
        </h1>

        <div class="flex mb-6 gap-4">
            <PartyDetails
                bind:party={partyDetails}
                onautofill={handlePartyDetailAutofill}
            />
            <BillDetails
                bind:this={billDetailsElement}
                bind:bill={billDetails}
            />
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

        <PrintDialog
            bind:this={printDialogElement}
            {items}
            onSave={finalSave}
            onPrint={finalPrint}
        />
    </div>
</main>

<style>
</style>
