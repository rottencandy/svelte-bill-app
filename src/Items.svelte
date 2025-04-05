<script lang="ts">
    import type { Item } from "./types"
    import { getItems, getUnits, setHsn, setUnit } from "./database"

    let { items = $bindable() }: { items: Item[] } = $props()

    let quantityField: HTMLInputElement
    const itemDetails = getItems()
    const itemNames = Object.keys(itemDetails)
    const units = getUnits()

    const getDefault = () => ({
        particulars: "",
        size: "",
        hsn: "",
        quantity: 0,
        unit: "",
        rate: 0,
        gst: 18 as const,
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

    const handleNameBlur = () => {
        const hsn = itemDetails[currentItem.particulars]
        if (hsn !== undefined) {
            currentItem.hsn = hsn
        }
    }

    const handleSizeBlur = () => {
        // hsn already filled, can be skipped
        if (currentItem.hsn) {
            //quantityField.focus()
        }
    }

    const handleHsnBlur = () => {
        if (currentItem.particulars && currentItem.hsn) {
            setHsn(currentItem.particulars, currentItem.hsn)
        }
    }

    const handleUnitBlur = () => {
        if (currentItem.unit && !(currentItem.unit in units)) {
            setUnit(currentItem.unit)
        }
    }
</script>

<div class="grid grid-cols-10 gap-2 mb-2 bg-blue-200 p-2">
    <div class="col-span-2">Particulars</div>
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
<div class="grid grid-cols-10 gap-2 mb-4">
    <input
        type="text"
        name="particulars"
        placeholder="Type to search..."
        bind:value={currentItem.particulars}
        onblur={handleNameBlur}
        class="p-1 border rounded col-span-2"
        list="item-names"
    />
    <datalist id="item-names">
        {#each itemNames as name}
            <option value={name}></option>
        {/each}
    </datalist>
    <input
        type="text"
        name="size"
        bind:value={currentItem.size}
        onblur={handleSizeBlur}
        class="p-1 border rounded"
    />
    <input
        type="text"
        name="hsn"
        onblur={handleHsnBlur}
        bind:value={currentItem.hsn}
        class="p-1 border rounded"
    />
    <input
        type="number"
        name="quantity"
        bind:this={quantityField}
        bind:value={currentItem.quantity}
        class="p-1 border rounded"
    />
    <input
        type="text"
        name="unit"
        bind:value={currentItem.unit}
        onblur={handleUnitBlur}
        class="p-1 border rounded"
        list="units"
    />
    <datalist id="units">
        {#each units as unit}
            <option value={unit}></option>
        {/each}
    </datalist>
    <input
        type="number"
        name="rate"
        bind:value={currentItem.rate}
        class="p-1 border rounded"
    />
    <select class="p-1 border rounded" name="gst" bind:value={currentItem.gst}>
        <option value={12}>12</option>
        <option value={18}>18</option>
        <option value={28}>28</option>
    </select>
    <div class="p-1">{currentTotal}</div>
    <button
        onclick={addItem}
        disabled={disableAdd}
        class="bg-green-500 text-white p-1 rounded hover:bg-green-600 disabled:bg-green-200"
    >
        Add
    </button>
</div>

<!-- Items List -->
<div class="max-h-60 overflow-y-auto border rounded">
    {#each items as item, index}
        <div
            class="grid grid-cols-10 gap-2 p-2 border-b odd:bg-gray-100 cursor-pointer"
        >
            <div class="col-span-2">{item.particulars}</div>
            <div>{item.size}</div>
            <div>{item.hsn}</div>
            <div>{item.quantity}</div>
            <div>{item.unit}</div>
            <div>{item.rate}</div>
            <div>{item.gst}%</div>
            <div>
                {(item.quantity * item.rate).toFixed(2)}
            </div>
            <div class="flex gap-2">
                <button
                    onclick={() => editItem(index)}
                    class="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
                    title="Edit entry"
                >
                    🖉
                </button>
                <button
                    onclick={() => deleteItem(index)}
                    class="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                    title="Delete entry"
                >
                    ╳
                </button>
            </div>
        </div>
    {/each}
</div>

<style>
</style>
