<script lang="ts">
    import { drawingStore } from '$lib/stores/drawingStore';
</script>

<button
    on:click={() => drawingStore.clearCanvas()}
    class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
>
    Clear
</button>