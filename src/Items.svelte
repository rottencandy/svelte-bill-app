<script lang="ts">
    import type { Item } from "./types"

    let { items = $bindable() }: { items: Item[] } = $props()

    const getDefault = () => ({
        particulars: "",
        size: "",
        hsn: 0,
        quantity: 0,
        unit: "",
        rate: 0,
        gst: 18,
    })

    let currentItem = $state<Item>(getDefault())
    let currentTotal = $derived(
        (currentItem.quantity * currentItem.rate).toFixed(2),
    )

    // validation
    let disableAdd = $derived(
        currentItem.particulars === "" ||
            currentItem.quantity < 1 ||
            currentItem.rate <= 0,
    )

    const addItem = () => {
        // Add to items list
        items = [...items, { ...currentItem }]
        // Reset current item
        currentItem = getDefault()
    }

    const editItem = (index: number) => {
        const item = deleteItem(index)
        if (item === undefined) {
            console.warn("Invalid index for edit")
            return
        }
        currentItem = { ...item }
    }

    const deleteItem = (index: number) => {
        const item = items[index]
        if (item === undefined) {
            console.warn("Invalid index for deletion")
            return
        }
        items.splice(index, 1)
        return item
    }
</script>

<div class="grid grid-cols-9 gap-2 mb-2 bg-blue-200 p-2">
    <div>Particulars</div>
    <div>Size</div>
    <div>HSN Code</div>
    <div>Quantity</div>
    <div>Unit</div>
    <div>Rate</div>
    <div>GST</div>
    <div>Total</div>
    <!--options-->
    <div></div>
</div>

<!-- Item Entry Form -->
<div class="grid grid-cols-9 gap-2 mb-4">
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
        type="number"
        bind:value={currentItem.hsn}
        class="p-2 border rounded"
    />
    <input
        type="number"
        bind:value={currentItem.quantity}
        class="p-2 border rounded"
    />
    <input
        type="text"
        bind:value={currentItem.unit}
        class="p-2 border rounded"
    />
    <input
        type="number"
        bind:value={currentItem.rate}
        class="p-2 border rounded"
    />
    <select class="p-2 border rounded" bind:value={currentItem.gst}>
        <option value={12}>12</option>
        <option value={18}>18</option>
        <option value={28}>28</option>
    </select>
    <div class="p-2">{currentTotal}</div>
    <button
        onclick={addItem}
        disabled={disableAdd}
        class="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-green-200"
    >
        Add
    </button>
</div>

<!-- Items List -->
<div class="max-h-60 overflow-y-auto border rounded">
    {#each items as item, index}
        <div
            class="grid grid-cols-9 gap-2 p-2 border-b hover:bg-gray-100 cursor-pointer"
        >
            <div>{item.particulars}</div>
            <div>{item.size}</div>
            <div>{item.hsn}</div>
            <div>{item.quantity}</div>
            <div>{item.unit}</div>
            <div>{item.rate}</div>
            <div>{item.gst}%</div>
            <div>
                {(item.quantity * item.rate).toFixed(2)}
            </div>
            <div class="flex mt-2 gap-2">
                <button
                    onclick={() => editItem(index)}
                    class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                    E
                </button>
                <button
                    onclick={() => deleteItem(index)}
                    class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    D
                </button>
            </div>
        </div>
    {/each}
</div>

<style>
</style>
