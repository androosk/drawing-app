<script lang="ts">
    import { drawingStore } from '$lib/stores/drawingStore';
    import { Brush, Eraser } from 'lucide-svelte'
    
    const tool = drawingStore.tool;
    $: currentTool = $tool;

    function setTool(type: 'brush' | 'eraser') {
        drawingStore.updateTool({
            ...currentTool,
            type
        });
    }
</script>

<div class="flex gap-4 items-center">
    <div class="flex items-center gap-2">
        <label for="brush-size" class="text-sm font-medium">Brush Size:</label>
        <input 
            type="range" 
            id="brush-size" 
            min="1" 
            max="50" 
            value={currentTool.size}
            on:input={(e) => drawingStore.updateToolSize(parseInt(e.currentTarget.value))}
            class="w-32"
        />
        <span class="text-sm">{currentTool.size}px</span>
    </div>
    
    <div class="flex gap-2">
        <button 
            on:click={() => setTool('brush')}
            title="Brush"
            class={`px-4 py-2 rounded flex items-center gap-2 ${
                currentTool.type === 'brush' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
        >
            <Brush size={20} />
        </button>

        <button 
            on:click={() => setTool('eraser')}
            title="Eraser"
            class={`px-4 py-2 rounded flex items-center gap-2 ${
                currentTool.type === 'eraser' ? 'bg-red-500 text-white' : 'bg-gray-200'
            }`}
        >
            <Eraser size={20} />
        </button>
    </div>
</div>