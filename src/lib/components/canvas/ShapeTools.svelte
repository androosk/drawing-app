<!-- <script lang="ts">
    import { drawingStore } from '$lib/stores/drawingStore';
    
    const tool = drawingStore.tool;
    $: currentTool = $tool;

    const shapeTools = [
        { type: 'rectangle', label: 'Rectangle' },
        { type: 'circle', label: 'Circle' },
        { type: 'line', label: 'Line' }
    ] as const;
</script>

<div class="flex gap-2">
    {#each shapeTools as shape}
        <button
            on:click={() => drawingStore.updateTool({ ...currentTool, type: shape.type })}
            class={`px-4 py-2 rounded ${
                currentTool.type === shape.type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
            }`}
        >
            {shape.label}
        </button>
    {/each}
</div> -->
<script lang="ts">
    import { drawingStore } from '$lib/stores/drawingStore';
    import { Square, Circle, MoveHorizontal } from 'lucide-svelte';
    
    const tool = drawingStore.tool;
    $: currentTool = $tool;

    const shapeTools = [
        { type: 'rectangle', label: 'Rectangle', icon: Square },
        { type: 'circle', label: 'Circle', icon: Circle },
        { type: 'line', label: 'Line', icon: MoveHorizontal }
    ] as const;
</script>

<div class="flex gap-2">
    {#each shapeTools as shape}
        <button
            on:click={() => drawingStore.updateTool({ ...currentTool, type: shape.type })}
            title={shape.label}
            class={`px-4 py-2 rounded flex items-center gap-2 ${
                currentTool.type === shape.type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
            }`}
        >
            <svelte:component 
                this={shape.icon} 
                size={20}
                class={currentTool.type === shape.type ? 'text-white' : 'text-gray-700'}
            />
        </button>
    {/each}
</div>