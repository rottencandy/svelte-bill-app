<script lang="ts">
    import type { Party } from "./types"
    import PartyDetails from "./PartyDetails.svelte"

    let hsnEnabled = $state(true)
    let partyDetails = $state<Party>({
        name: "",
        address: "",
        tin: "",
        privateMark: "",
    })

    let billDetails = $state({
        date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
        invoice: "", // Will be set from database
        transport: "",
        paymentTerms: "",
        esugam: "",
    })

    let items: Array<{
        particulars: string
        size: string
        hsn: string
        quantity: string
        unit: string
        rate: string
        gst: string
    }> = $state([])

    let currentItem = $state({
        particulars: "",
        size: "",
        hsn: "",
        quantity: "",
        unit: "",
        rate: "",
        gst: "18",
    })

    let selectedItemIndex: number | null = $state(null)

    // Totals
    let subtotal = $state(0)
    let total = $state(0)
    let gst18 = $state(0)
    let gst28 = $state(0)
    let gst12 = $state(0)
    let otherAmount = 0
    let roundoff = $state(0)
    let useIGST = $state(false)
    let otherAmountInput = $state("0")

    // Initialize with default invoice number (would come from database)
    $effect(() => {
        billDetails.invoice = "INV-001" // Replace with database call
    })

    function handlePrivateMarkSearch() {
        // Simulate database lookup
        // if (partyDetails.privateMark in database.get_all_pvtmark()) {
        //     const pname = database.get_name_bypvt(partyDetails.privateMark);
        //     partyDetails.name = pname;
        //     const [add, tn] = database.has_name(pname);
        //     partyDetails.address = add;
        //     partyDetails.tin = tn;
        // }
    }

    function savePartyDetails() {
        if (!partyDetails.name) {
            if (partyDetails.privateMark) {
                handlePrivateMarkSearch()
            } else {
                alert("Some fields are empty.")
            }
            return
        }

        // Simulate database operations
        // if (database.has_name(partyDetails.name)) {
        //     // Update logic
        // } else {
        //     // Create new entry
        // }

        // Focus would move to particulars in original
    }

    function saveBillDetails() {
        // Validation and saving logic
    }

    function addItem() {
        if (
            !currentItem.quantity ||
            !currentItem.unit ||
            !currentItem.rate ||
            !currentItem.gst
        ) {
            alert("Some fields are empty.")
            return
        }

        const quantity = parseFloat(currentItem.quantity)
        const rate = parseFloat(currentItem.rate)
        const gst = parseFloat(currentItem.gst)

        if (isNaN(quantity)) {
            alert("Invalid quantity")
            return
        }

        if (isNaN(rate)) {
            alert("Invalid rate")
            return
        }

        if (![12, 18, 28].includes(gst)) {
            alert("Invalid GST. Only accepts 12/18/28")
            return
        }

        // Add to items list
        items = [...items, { ...currentItem }]

        // Calculate totals
        const itemTotal = quantity * rate
        subtotal += itemTotal

        if (gst === 18) {
            gst18 += (itemTotal * gst) / 100
        } else if (gst === 28) {
            gst28 += (itemTotal * gst) / 100
        } else if (gst === 12) {
            gst12 += (itemTotal * gst) / 100
        }

        total = subtotal + gst18 + gst28 + gst12
        roundoff = Math.round(total)

        // Reset current item
        currentItem = {
            particulars: "",
            size: "",
            hsn: "",
            quantity: "",
            unit: "",
            rate: "",
            gst: "18",
        }
    }

    function editItem() {
        if (selectedItemIndex === null) {
            alert("Select an item first")
            return
        }

        currentItem = { ...items[selectedItemIndex] }
        deleteItem()
    }

    function deleteItem() {
        if (selectedItemIndex === null) {
            alert("Select an item first")
            return
        }

        const item = items[selectedItemIndex]
        const quantity = parseFloat(item.quantity)
        const rate = parseFloat(item.rate)
        const gst = parseFloat(item.gst)
        const itemTotal = quantity * rate

        subtotal -= itemTotal

        if (gst === 18) {
            gst18 -= (itemTotal * gst) / 100
        } else if (gst === 28) {
            gst28 -= (itemTotal * gst) / 100
        } else if (gst === 12) {
            gst12 -= (itemTotal * gst) / 100
        }

        total = subtotal + gst18 + gst28 + gst12
        roundoff = Math.round(total)

        items = items.filter((_, i) => i !== selectedItemIndex)
        selectedItemIndex = null
    }

    function updateOtherAmount() {
        const value = parseFloat(otherAmountInput) || 0
        otherAmount += value
        total += value
        roundoff = Math.round(total)
        otherAmountInput = "0"
    }

    function printBill() {
        // Print logic would go here
        console.log("Printing bill...")
    }

    function resetForm() {
        // Reset all state
        hsnEnabled = true
        partyDetails = {
            name: "",
            address: "",
            tin: "",
            privateMark: "",
        }
        billDetails = {
            date: new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
            invoice: "", // Will be set from database
            transport: "",
            paymentTerms: "",
            esugam: "",
        }
        items = []
        currentItem = {
            particulars: "",
            size: "",
            hsn: "",
            quantity: "",
            unit: "",
            rate: "",
            gst: "18",
        }
        selectedItemIndex = null
        subtotal = 0
        total = 0
        gst18 = 0
        gst28 = 0
        gst12 = 0
        otherAmount = 0
        roundoff = 0
        useIGST = false
        otherAmountInput = "0"
    }
</script>

<div class="container mx-auto p-4 max-w-6xl">
    <h1 class="text-2xl font-bold text-center bg-green-200 p-2 mb-4">
        TAX INVOICE
    </h1>

    <div class="flex mb-6 gap-4">
        <PartyDetails party={partyDetails} />

        <!-- Bill Details Section -->
        <div class="flex-1 border p-4 rounded">
            <h2 class="font-bold mb-2">Bill Details</h2>

            <div class="mb-2">
                <label class="block mb-1"
                    >Date
                    <input
                        type="text"
                        bind:value={billDetails.date}
                        class="w-full p-2 border rounded"
                    /></label
                >
            </div>

            <div class="mb-2">
                <label class="block mb-1"
                    >Invoice No.
                    <input
                        type="text"
                        bind:value={billDetails.invoice}
                        class="w-full p-2 border rounded"
                    /></label
                >
            </div>

            <div class="mb-2">
                <label class="block mb-1"
                    >Transport
                    <input
                        type="text"
                        bind:value={billDetails.transport}
                        class="w-full p-2 border rounded"
                    /></label
                >
            </div>

            <div class="mb-2">
                <label class="block mb-1"
                    >Payment Terms
                    <input
                        type="text"
                        bind:value={billDetails.paymentTerms}
                        class="w-full p-2 border rounded"
                    /></label
                >
            </div>

            <div class="mb-2">
                <label class="block mb-1"
                    >ESUGAM No.
                    <input
                        type="text"
                        bind:value={billDetails.esugam}
                        class="w-full p-2 border rounded"
                    /></label
                >
            </div>

            <button
                onclick={saveBillDetails}
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Enter
            </button>
        </div>
    </div>

    <!-- Items Section -->
    <div class="border p-4 rounded mb-6">
        <h2 class="font-bold mb-2">Items</h2>

        <div class="grid grid-cols-8 gap-2 mb-2 bg-blue-200 p-2">
            <div>Particulars</div>
            <div>Size</div>
            <div>HSN Code</div>
            <div>Quantity</div>
            <div>Unit</div>
            <div>Rate</div>
            <div>GST</div>
            <div>Total</div>
        </div>

        <!-- Item Entry Form -->
        <div class="grid grid-cols-8 gap-2 mb-4">
            <input
                type="text"
                bind:value={currentItem.particulars}
                class="p-2 border rounded"
            />
            <input
                type="text"
                bind:value={currentItem.size}
                class="p-2 border rounded"
            />
            <input
                type="text"
                bind:value={currentItem.hsn}
                class="p-2 border rounded"
            />
            <input
                type="text"
                bind:value={currentItem.quantity}
                class="p-2 border rounded"
            />
            <input
                type="text"
                bind:value={currentItem.unit}
                class="p-2 border rounded"
            />
            <input
                type="text"
                bind:value={currentItem.rate}
                class="p-2 border rounded"
            />
            <input
                type="text"
                bind:value={currentItem.gst}
                class="p-2 border rounded"
            />
            <button
                onclick={addItem}
                class="bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
                Add
            </button>
        </div>

        <!-- Items List -->
        <div class="max-h-60 overflow-y-auto border rounded">
            {#each items as item, index}
                <div
                    class="grid grid-cols-8 gap-2 p-2 border-b hover:bg-gray-100 cursor-pointer"
                    class:bg-blue-100={selectedItemIndex === index}
                    onclick={() => (selectedItemIndex = index)}
                >
                    <div>{item.particulars}</div>
                    <div>{item.size}</div>
                    <div>{item.hsn}</div>
                    <div>{item.quantity}</div>
                    <div>{item.unit}</div>
                    <div>{item.rate}</div>
                    <div>{item.gst}%</div>
                    <div>
                        {(
                            parseFloat(item.quantity) * parseFloat(item.rate)
                        ).toFixed(2)}
                    </div>
                </div>
            {/each}
        </div>

        <div class="flex justify-end mt-2 gap-2">
            <button
                onclick={editItem}
                class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
                Edit
            </button>
            <button
                onclick={deleteItem}
                class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Delete
            </button>
        </div>
    </div>

    <!-- Totals Section -->
    <div class="bg-gray-200 p-4 rounded grid grid-cols-2 gap-4 mb-6">
        <div class="flex justify-between items-center">
            <label>
                <input type="checkbox" bind:checked={useIGST} class="mr-2" />
                IGST
            </label>
        </div>
        <div></div>

        <div class="font-bold">Sub Total</div>
        <div class="text-right">{subtotal.toFixed(2)}</div>

        {#if gst18 > 0}
            <div>{useIGST ? "18% IGST" : "9% CGST"}</div>
            <div class="text-right">{(gst18 / 2).toFixed(2)}</div>

            {#if !useIGST}
                <div>9% SGST</div>
                <div class="text-right">{(gst18 / 2).toFixed(2)}</div>
            {/if}
        {/if}

        {#if gst28 > 0}
            <div>{useIGST ? "28% IGST" : "14% CGST"}</div>
            <div class="text-right">{(gst28 / 2).toFixed(2)}</div>

            {#if !useIGST}
                <div>14% SGST</div>
                <div class="text-right">{(gst28 / 2).toFixed(2)}</div>
            {/if}
        {/if}

        {#if gst12 > 0}
            <div>{useIGST ? "12% IGST" : "6% CGST"}</div>
            <div class="text-right">{(gst12 / 2).toFixed(2)}</div>

            {#if !useIGST}
                <div>6% SGST</div>
                <div class="text-right">{(gst12 / 2).toFixed(2)}</div>
            {/if}
        {/if}

        <div class="font-bold">Other Amount</div>
        <div class="flex gap-2">
            <input
                type="text"
                bind:value={otherAmountInput}
                class="flex-1 p-2 border rounded text-right"
            />
            <button
                onclick={updateOtherAmount}
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Update
            </button>
        </div>

        <div class="font-bold">Total</div>
        <div class="text-right">{total.toFixed(2)}</div>

        <div class="font-bold">Round off</div>
        <div class="text-right">{roundoff.toFixed(2)}</div>
    </div>

    <div class="flex justify-center">
        <button
            onclick={printBill}
            class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
            Print...
        </button>
    </div>
</div>

<style>
    input,
    textarea,
    select {
        border: 1px solid #ccc;
    }

    input:focus,
    textarea:focus,
    select:focus {
        outline: 2px solid #3b82f6;
        outline-offset: -1px;
    }
</style>
