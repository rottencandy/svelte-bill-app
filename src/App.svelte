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
        // get today in format yyyy-mm-dd
        date: new Date().toISOString().slice(0, 10),
        // TODO set from db
        invoice: 0,
        transport: "",
        paymentTerms: "",
        esugam: "",
    })
    let items = $state<Item[]>([])
    let useIGST = $state(false)
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

        <Total {items} bind:useIGST />
    </div>
</main>

<style>
</style>
