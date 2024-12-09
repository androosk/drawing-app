<script lang="ts">
    import { onMount } from 'svelte';
    import { drawingStore } from '$lib/stores/drawingStore';
    import type { Point, Shape } from "$lib/types/drawing"

    export let width: number;
    export let height: number;
    
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    
    const tool = drawingStore.tool;
    $: currentTool = $tool;
    
    onMount(() => {
        ctx = canvas.getContext('2d')!;
    });
    
    export function clearCanvas() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
    }

    export function updateCursor(point: Point) {
        if (!ctx) return;
        
        clearCanvas();
        
        if (currentTool.type === 'brush' || currentTool.type === 'eraser') {
            ctx.beginPath();
            ctx.arc(point.x, point.y, currentTool.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = currentTool.type === 'eraser' ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.5)';
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }
    }

    export function previewShape(shape: Shape) {
        if (!ctx) return;
        
        clearCanvas();
        
        ctx.strokeStyle = shape.color;
        ctx.fillStyle = shape.color + '40'; // 25% opacity
        ctx.lineWidth = currentTool.size;
        
        switch (shape.type) {
            case 'rectangle':
                ctx.beginPath();
                ctx.rect(shape.x, shape.y, shape.width, shape.height);
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'circle':
                const radius = Math.sqrt(
                    Math.pow(shape.width, 2) + Math.pow(shape.height, 2)
                ) / 2;
                ctx.beginPath();
                ctx.arc(
                    shape.x + shape.width / 2,
                    shape.y + shape.height / 2,
                    radius,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.stroke();
                break;
                
            case 'line':
                ctx.beginPath();
                ctx.moveTo(shape.x, shape.y);
                ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
                ctx.stroke();
                break;
        }
    }
</script>

<canvas
    bind:this={canvas}
    {width}
    {height}
    class="absolute top-0 left-0 pointer-events-none"
></canvas>