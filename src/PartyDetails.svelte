<script lang="ts">
    import type { FocusEventHandler } from "svelte/elements"
    import type { Party, Context } from "./types"
    import {
        createPvtFilter,
        getPartyDetails,
        setPartyDetails,
    } from "./database"
    import { onMount } from "svelte"
    import autocomplete from "autocompleter"

    let {
        party = $bindable(),
        ctx,
        onautofill,
    }: { party: Party; onautofill: () => void; ctx: Context } = $props()

    let pvtField: HTMLInputElement
    const db = ctx.db
    const nameFilter = createPvtFilter(db)

    const handlePvtBlur: FocusEventHandler<HTMLInputElement> = (e) => {
        const details = getPartyDetails(db, party.privateMark)
        if (details !== undefined) {
            e.preventDefault()
            const [name, address, tin] = details
            party.name = name
            party.address = address
            party.tin = tin
            onautofill()
        }
        // else if name doesn't exist in pvt, let user fill it up
    }

    const handleGstinBlur: FocusEventHandler<HTMLInputElement> = () => {
        // save party details if filled
        if (party.name) {
            setPartyDetails(
                db,
                party.privateMark,
                party.name,
                party.address,
                party.tin,
            )
        }
    }

    onMount(() => {
        // unit field
        autocomplete({
            input: pvtField,
            showOnFocus: true,
            minLength: 0,
            fetch: (input, update) => {
                update(nameFilter(input).map((n) => ({ label: n, value: n })))
            },
            onSelect: (item) => {
                if (item.label !== undefined) {
                    party.privateMark = item.label
                    pvtField.blur()
                }
            },
        })
    })
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
                bind:this={pvtField}
                onblur={handlePvtBlur}
                class="w-full p-2 border rounded"
                autocomplete="off"
            />
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
