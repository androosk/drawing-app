<script lang="ts">
    import DrawingCanvas from '$lib/components/canvas/DrawingCanvas.svelte';
    import BrushControls from '$lib/components/canvas/BrushControls.svelte';
    import HistoryControls from '$lib/components/canvas/DrawingHistoryControls.svelte';
    import ClearButton from '$lib/components/canvas/ClearButton.svelte';
    import ShapeTools from '$lib/components/canvas/ShapeTools.svelte';
    import { drawingStore } from '$lib/stores/drawingStore';
	import SelectTool from '$lib/components/canvas/SelectTool.svelte';
    
    const error = drawingStore.error;
    $: currentError = $error;
</script>

<main class="p-4 bg-gray-300 flex items-center justify-center h-screen">

    {#if currentError}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <span>{currentError.message}</span>
            <button 
                class="text-red-700 font-bold"
                on:click={() => drawingStore.clearError()}
            >
                ×
            </button>
        </div>
    {/if}

    <div class="flex flex-col items-center gap-4">
        <div class="flex gap-4 items-center">
            <BrushControls />
            <ShapeTools />
            <HistoryControls />
            <SelectTool />
            <ClearButton />
        </div>
        <DrawingCanvas />
    </div>
</main>