<script lang="ts">
    import { drawingStore } from '$lib/stores/drawingStore';
    import { Undo2, Redo2 } from "lucide-svelte"
    
    const canUndo = drawingStore.canUndo;
    const canRedo = drawingStore.canRedo;
    
    $: isUndoable = $canUndo;
    $: isRedoable = $canRedo;
</script>

<div class="flex gap-2">
    <button
        on:click={() => drawingStore.undo()}
        disabled={!isUndoable}
        title="Undo"
        class={`px-4 py-2 rounded ${
            isUndoable 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
    >
        <Undo2 size={20} />
    </button>
    
    <button
        on:click={() => drawingStore.redo()}
        disabled={!isRedoable}
        title="Redo"
        class={`px-4 py-2 rounded ${
            isRedoable 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
    >
       <Redo2 size={20} />
    </button>
</div>