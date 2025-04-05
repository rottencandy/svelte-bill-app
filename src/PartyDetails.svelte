<script lang="ts">
    import type {
        FocusEventHandler,
        KeyboardEventHandler,
    } from "svelte/elements"
    import type { Party } from "./types"
    import {
        getAllPvtMarks,
        getNameByPvt,
        getPartyDetails,
        setPartyDetails,
    } from "./database"

    let {
        party = $bindable(),
        onautofill,
    }: { party: Party; onautofill: () => void } = $props()

    const pvtnames = getAllPvtMarks()

    const savePartyDetails = () => {
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

    const handlePvtBlur: FocusEventHandler<HTMLInputElement> = (e) => {
        // check and autofill party details
        const name = getNameByPvt(party.privateMark)
        if (name !== undefined) {
            party.name = name
            const details = getPartyDetails(name)
            if (details !== undefined) {
                e.preventDefault()
                const [address, tin] = details
                party.address = address
                party.tin = tin
                onautofill()
            }
        }
        // else if name doesn't exist in pvt, let user fill it up
    }

    const handleGstinBlur: FocusEventHandler<HTMLInputElement> = (e) => {
        // save party details if filled
        if (party.name && (party.address || party.tin)) {
            setPartyDetails(
                party.name,
                party.address,
                party.tin,
                party.privateMark,
            )
        }
    }
</script>

<!-- Party Details Section -->
<div class="flex-1 border p-4 rounded">
    <h2 class="font-bold mb-2">Party Details</h2>

    <div class="mb-2">
        <label class="block mb-1"
            >Private Mark
            <input
                type="text"
                placeholder="Type to search..."
                bind:value={party.privateMark}
                onblur={handlePvtBlur}
                class="w-full p-2 border rounded"
                list="pvt-names"
            />
            <datalist id="pvt-names">
                {#each pvtnames as pvt}
                    <option value={pvt}></option>
                {/each}
            </datalist>
        </label>
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
                onblur={handleGstinBlur}
                class="w-full p-2 border rounded"
                required
            /></label
        >
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
