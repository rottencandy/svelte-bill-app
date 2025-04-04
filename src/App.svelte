<script lang="ts">
    import PartyDetails from "./PartyDetails.svelte"

    let partyDetails = $state<Party>({
        name: "",
        address: "",
        tin: "",
        privateMark: "",
    })
</script>

<main>
    <div class="container mx-auto p-4 max-w-6xl">
        <h1 class="text-2xl font-bold text-center bg-green-200 p-2 mb-4">
            TAX INVOICE
        </h1>

        <div class="flex mb-6 gap-4">
            <PartyDetails party={partyDetails} />
        </div>
    </div>
</main>

<style>
    main {
        height: 100%;
        width: 100%;
    }
</style>
