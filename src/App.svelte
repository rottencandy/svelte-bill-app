<script lang="ts">
    import type { Item, Bill, Party } from "./types"
    import PartyDetails from "./PartyDetails.svelte"
    import BillDetails from "./BillDetails.svelte"
    import Items from "./Items.svelte"
    import Total from "./Total.svelte"
    import PrintDialog from "./PrintDialog.svelte"
    import {
        cleanupTempFiles,
        fillDataToTempFile,
        saveTempFileAndSchedulePrintJob,
        saveTempToFile,
    } from "./billprinter"
    import { getInvoiceNo, incrementSavename } from "./database"
    import { calculateTotal } from "./util"

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

    const total = $derived(calculateTotal(items))

    const finalTotal = $derived(
        total.sum + total.gst12 + total.gst18 + total.gst28 + otherAmount,
    )

    const fillTempFile = () =>
        fillDataToTempFile(
            partyDetails,
            billDetails,
            items,
            useIGST,
            total,
            finalTotal,
            otherAmount,
        )

    const handlePrint = async (copies: 1 | 2 | 3) => {
        const wb = await fillTempFile()
        await saveTempFileAndSchedulePrintJob(
            wb,
            copies,
            `${billDetails.invoice}`,
        )
        incrementSavename()
        cleanupTempFiles()
        resetAppState()
        printDialogElement.close()
    }

    const handleSave = async () => {
        const wb = await fillTempFile()
        await saveTempToFile(wb, "Original Copy", `${billDetails.invoice}`)
        incrementSavename()
        cleanupTempFiles()
        resetAppState()
        printDialogElement.close()
    }

    const printBill = () => {
        console.log("Printing bill...")
        printDialogElement.open()
    }

    const handlePartyDetailAutofill = () => {
        billDetailsElement.focus()
    }

    const resetAppState = () => {
        partyDetails = {
            name: "",
            address: "",
            tin: "",
            privateMark: "",
        }
        billDetails = {
            // get today in the format yyyy-mm-dd
            date: new Date().toISOString().slice(0, 10),
            invoice: getInvoiceNo(),
            transport: "",
            paymentTerms: "",
            esugam: "",
        }
        items = []
        useIGST = false
        otherAmount = 0
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
            <h2 class="font-bold mb-2">Items ({items.length})</h2>
            <Items bind:items />
        </div>

        <Total {items} {total} bind:useIGST bind:otherAmount />

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
            onSave={handleSave}
            onPrint={handlePrint}
        />
    </div>
</main>

<style>
</style>
