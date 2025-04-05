<script lang="ts">
    import type { Item } from "./types"
    import { MAX_ITEMS_IN_PAGE } from "./const"

    let {
        items,
        onSave,
        onPrint,
    }: {
        items: Item[]
        onSave: (copies: 1 | 2 | 3) => void
        onPrint: (copies: 1 | 2 | 3) => void
    } = $props()

    let element: HTMLDialogElement

    let copies = $state<1 | 2 | 3>(3)

    // TODO this will be incorrect after adding hsn columns
    const pages = $derived(Math.floor(items.length / MAX_ITEMS_IN_PAGE))

    export const open = () => {
        element.showModal()
    }

    export const close = () => {
        element.close()
    }
</script>

<dialog
    class="backdrop:bg-gray-700/50 m-auto rounded border"
    bind:this={element}
>
    <div class="flex justify-center flex-col w-150 m-4 p-3 rounded">
        <div class="mb-2 text-center">
            {items.length} items entered. Bill will span {pages} page(s).
        </div>
        <label class="block rounded mb-2 text-center">
            Number of copies:
            <select bind:value={copies}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
            </select>
        </label>
        <div class="flex gap-2 justify-center">
            <button
                class="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                onclick={() => onPrint(copies)}>Print</button
            >
            <button
                class="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                onclick={() => onSave(copies)}>Save</button
            >
            <button
                class="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600"
                onclick={close}>Cancel</button
            >
        </div>
    </div>
</dialog>

<style>
</style>
