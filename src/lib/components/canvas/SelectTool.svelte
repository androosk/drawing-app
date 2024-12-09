<script lang="ts">
    import { drawingStore } from '$lib/stores/drawingStore';
    import { SquareDashedMousePointer } from "lucide-svelte"
    import type { Tool } from '$lib/types/drawing';

    function enableSelectTool() {
        const selectTool: Tool = {
            type: 'select',
            size: 1,
            color: '#000000'
        };
        drawingStore.updateTool(selectTool);
    }
</script>

<button
    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    title="Select"
    on:click={enableSelectTool}
>
    <SquareDashedMousePointer />
</button>