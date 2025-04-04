<script lang="ts">
    import type { Bill } from "./types"

    let { bill = $bindable() }: { bill: Bill } = $props()
</script>

<div class="flex-1 border p-4 rounded">
    <h2 class="font-bold mb-2">Bill Details</h2>

    <div class="mb-2">
        <label class="block mb-1"
            >Date
            <input
                type="date"
                bind:value={bill.date}
                class="w-full p-2 border rounded"
                required
            />
        </label>
    </div>

    <div class="mb-2">
        <label class="block mb-1"
            >Invoice No.
            <input
                type="number"
                bind:value={bill.invoice}
                class="w-full p-2 border rounded"
                required
            />
        </label>
    </div>

    <div class="mb-2">
        <label class="block mb-1"
            >Transport
            <input
                type="text"
                bind:value={bill.transport}
                class="w-full p-2 border rounded"
            />
        </label>
    </div>

    <div class="mb-2">
        <label class="block mb-1"
            >Payment Terms
            <input
                type="text"
                bind:value={bill.paymentTerms}
                class="w-full p-2 border rounded"
            />
        </label>
    </div>

    <div class="mb-2">
        <label class="block mb-1"
            >ESUGAM No.
            <input
                type="text"
                bind:value={bill.esugam}
                class="w-full p-2 border rounded"
                required
            />
        </label>
    </div>
</div>

<style>
    input {
        border: 1px solid #ccc;
    }

    input:focus {
        outline: 2px solid #3b82f6;
        outline-offset: -1px;
    }
</style>
