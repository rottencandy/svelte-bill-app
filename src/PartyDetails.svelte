<script lang="ts">
    import type { Party } from "./types"

    let { party = $bindable() }: { party: Party } = $props()

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
        //if (!partyDetails.name) {
        //    if (partyDetails.privateMark) {
        //        handlePrivateMarkSearch();
        //    } else {
        //        alert('Some fields are empty.');
        //    }
        //    return;
        //}
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
</script>

<div class="flex mb-6 gap-4">
    <!-- Party Details Section -->
    <div class="flex-1 border p-4 rounded">
        <h2 class="font-bold mb-2">Party Details</h2>

        <div class="mb-2">
            <label class="block mb-1"
                >Private Mark
                <input
                    type="text"
                    bind:value={party.privateMark}
                    class="w-full p-2 border rounded"
                    required
                /></label
            >
        </div>

        <div class="mb-2">
            <label class="block mb-1"
                >Party Name
                <input
                    type="text"
                    bind:value={party.name}
                    class="w-full p-2 border rounded"
                    required
                /></label
            >
        </div>

        <div class="mb-2">
            <label class="block mb-1"
                >Party Address
                <textarea
                    bind:value={party.address}
                    class="w-full p-2 border rounded h-20"
                    required
                ></textarea></label
            >
        </div>

        <div class="mb-2">
            <label class="block mb-1"
                >GSTIN
                <input
                    type="text"
                    bind:value={party.tin}
                    class="w-full p-2 border rounded"
                    required
                /></label
            >
        </div>
    </div>
</div>

<style>
    input,
    textarea {
        border: 1px solid #ccc;
    }

    input:focus,
    textarea:focus {
        outline: 2px solid #3b82f6;
        outline-offset: -1px;
    }
</style>
