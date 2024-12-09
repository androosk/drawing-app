<script lang="ts">
  import { onMount } from 'svelte';
  import { drawingStore } from '$lib/stores/drawingStore';
  import CursorCanvas from './CursorCanvas.svelte';
  import type {
    Point,
    DrawAction,
    HistoryState,
    Shape,
    SelectionState
  } from '$lib/types/drawing';
  import {
    getHandles,
    findHandleAtPoint,
    findShapeAtPoint
  } from '$lib/utils/transform';

  const {
    settings,
    tool,
    drawingState,
    history,
    startDrawing,
    addAction,
    updateShapeInHistory,
    stopDrawing
  } = drawingStore;

  let mainCanvas: HTMLCanvasElement;
  let cursorCanvasComponent: CursorCanvas;
  let ctx: CanvasRenderingContext2D | null = null;
  let startPoint: Point | null = null;
  let currentShape: Shape | null = null;

  let currentAction: DrawAction | null = null;

  let selectionState: SelectionState = {
    selectedShape: undefined,
    activeHandle: undefined,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0
  };

  $: currentSettings = $settings;
  $: currentTool = $tool;
  $: currentDrawingState = $drawingState;
  $: historyState = $history;

  $: if (ctx && historyState) {
    redrawCanvas(historyState);
  }

  $: if (currentTool && ctx) {
    updateCanvasContext();
  }

  onMount(() => {
    ctx = mainCanvas.getContext('2d')!;
    updateCanvasContext();
  });

  function getShapesFromHistory(): Shape[] {
    return historyState.actions
      .slice(0, historyState.currentIndex + 1)
      .filter((action) => action.type === 'shape' && action.shape)
      .map((action) => action.shape!);
  }

  function updateCanvasContext() {
    if (!ctx) return;

    ctx.lineWidth = currentTool.size;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (currentTool.type === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentTool.color ?? '#000000';
    }
  }

  function redrawCanvas(historyState: HistoryState) {
    if (!ctx) return;

    ctx.clearRect(0, 0, currentSettings.width, currentSettings.height);

    for (let i = 0; i <= historyState.currentIndex; i++) {
      const action = historyState.actions[i];
      if (action.type === 'clear') {
        ctx.clearRect(0, 0, currentSettings.width, currentSettings.height);
      } else {
        drawAction(action);
      }
    }

    if (selectionState.selectedShape) {
      drawSelectionHandles(selectionState.selectedShape);
    }
  }

  function drawSelectionHandles(shape: Shape) {
    if (!ctx) return;

    const handles = getHandles(shape);
    const context = ctx;

    context.save();

    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;

    if (shape.rotation) {
      context.translate(centerX, centerY);
      context.rotate((shape.rotation * Math.PI) / 180);
      context.translate(-centerX, -centerY);
    }

    context.strokeStyle = '#0080ff';
    context.lineWidth = 1;
    context.setLineDash([5, 5]);

    if (shape.type === 'circle') {
      const radius =
        Math.sqrt(Math.pow(shape.width, 2) + Math.pow(shape.height, 2)) / 2;
      context.beginPath();
      context.arc(
        shape.x + shape.width / 2,
        shape.y + shape.height / 2,
        radius,
        0,
        Math.PI * 2
      );
      context.stroke();
    } else {
      context.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }

    context.restore();

    context.setLineDash([]);

    handles.forEach((handle) => {
      context.beginPath();
      context.arc(handle.x, handle.y, 4, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();
      context.strokeStyle = '#0080ff';
      context.stroke();
    });
  }

  function drawAction(action: DrawAction) {
    if (!ctx) return;

    const savedSettings = {
      lineWidth: ctx.lineWidth,
      strokeStyle: ctx.strokeStyle,
      globalCompositeOperation: ctx.globalCompositeOperation,
      fillStyle: ctx.fillStyle
    };

    ctx.lineWidth = action.tool.size;

    if (action.type === 'shape' && action.shape) {
      ctx.strokeStyle = action.shape.color;
      ctx.fillStyle = action.shape.color + '40';
      ctx.globalCompositeOperation = 'source-over';

      drawShape(action.shape);
    } else if (action.type === 'draw') {
      if (action.tool.type === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = action.tool.color ?? '#000000';
      }

      if (action.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(action.points[0].x, action.points[0].y);

        for (let i = 1; i < action.points.length; i++) {
          ctx.lineTo(action.points[i].x, action.points[i].y);
        }
        ctx.stroke();
      }
    }

    ctx.lineWidth = savedSettings.lineWidth;
    ctx.strokeStyle = savedSettings.strokeStyle;
    ctx.fillStyle = savedSettings.fillStyle;
    ctx.globalCompositeOperation = savedSettings.globalCompositeOperation;
  }

  function drawShape(shape: Shape) {
    if (!ctx) return;

    ctx.save();

    if (shape.rotation) {
      const centerX = shape.x + shape.width / 2;
      const centerY = shape.y + shape.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((shape.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    switch (shape.type) {
      case 'rectangle':
        ctx.beginPath();
        ctx.rect(shape.x, shape.y, shape.width, shape.height);
        ctx.fill();
        ctx.stroke();
        break;

      case 'circle':
        const radius =
          Math.sqrt(Math.pow(shape.width, 2) + Math.pow(shape.height, 2)) / 2;
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

    ctx.restore();
  }

  function getPoint(e: MouseEvent): Point {
    const rect = mainCanvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function handleMouseDown(e: MouseEvent) {
    const point = getPoint(e);

    if (currentTool.type === 'brush' || currentTool.type === 'eraser') {
      startDrawing(point);
      currentAction = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        tool: { ...currentTool },
        points: [point],
        type: 'draw'
      };
    } else if (currentTool.type === 'select') {
      if (selectionState.selectedShape) {
        const handle = findHandleAtPoint(point, selectionState.selectedShape);
        if (handle) {
          selectionState = {
            ...selectionState,
            activeHandle: handle,
            isDragging: true,
            lastMouseX: point.x,
            lastMouseY: point.y
          };
          return;
        }
      }

      const shapes = getShapesFromHistory();
      const clickedShape = findShapeAtPoint(point, shapes);

      if (clickedShape) {
        selectionState = {
          ...selectionState,
          selectedShape: {
            ...clickedShape,
            isSelected: true,
            id: clickedShape.id
          },
          isDragging: true,
          lastMouseX: point.x,
          lastMouseY: point.y
        };
      } else {
        selectionState = {
          ...selectionState,
          selectedShape: undefined,
          isDragging: false
        };
      }

      redrawCanvas(historyState);
    } else if (['rectangle', 'circle', 'line'].includes(currentTool.type)) {
      startPoint = point;
      currentShape = {
        id: crypto.randomUUID(),
        type: currentTool.type as Shape['type'],
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        color: currentTool.color ?? '#000000',
        rotation: 0,
        isDrawing: true
      };
    }
  }

  // TODO: Add cursor change on hover over handles functionality
  function handleMouseMove(e: MouseEvent) {
    const point = getPoint(e);

    if (currentShape?.isDrawing && startPoint) {
      currentShape.width = point.x - startPoint.x;
      currentShape.height = point.y - startPoint.y;
      cursorCanvasComponent.clearCanvas();
      cursorCanvasComponent.previewShape(currentShape);
    } else if (currentDrawingState.isDrawing) {
      cursorCanvasComponent.updateCursor(point);

      if (currentAction) {
        currentAction.points.push(point);

        if (ctx) {
          ctx.beginPath();
          ctx.moveTo(currentDrawingState.lastX, currentDrawingState.lastY);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      }

      startDrawing(point);
    } else if (selectionState.isDragging) {
      if (selectionState.activeHandle && selectionState.selectedShape) {
        const shape = selectionState.selectedShape;
        const handle = selectionState.activeHandle;

        if (handle.type === 'resize') {
          const dx = point.x - selectionState.lastMouseX;
          const dy = point.y - selectionState.lastMouseY;

          switch (handle.position) {
            case 'tl':
              shape.width -= dx;
              shape.height -= dy;
              shape.x += dx;
              shape.y += dy;
              break;
            case 'tr':
              shape.width += dx;
              shape.height -= dy;
              shape.y += dy;
              break;
            case 'bl':
              shape.width -= dx;
              shape.height += dy;
              shape.x += dx;
              break;
            case 'br':
              shape.width += dx;
              shape.height += dy;
              break;
            case 't':
              shape.height -= dy;
              shape.y += dy;
              break;
            case 'r':
              shape.width += dx;
              break;
            case 'b':
              shape.height += dy;
              break;
            case 'l':
              shape.width -= dx;
              shape.x += dx;
              break;
          }
        } else if (handle.type === 'rotate') {
          const centerX = shape.x + shape.width / 2;
          const centerY = shape.y + shape.height / 2;
          const prevAngle = Math.atan2(
            selectionState.lastMouseY - centerY,
            selectionState.lastMouseX - centerX
          );
          const newAngle = Math.atan2(point.y - centerY, point.x - centerX);
          let deltaAngle = ((newAngle - prevAngle) * 180) / Math.PI;

          shape.rotation = ((shape.rotation || 0) + deltaAngle) % 360;
        }
      } else if (selectionState.selectedShape) {
        const dx = point.x - selectionState.lastMouseX;
        const dy = point.y - selectionState.lastMouseY;

        selectionState.selectedShape.x += dx;
        selectionState.selectedShape.y += dy;
      }

      selectionState.lastMouseX = point.x;
      selectionState.lastMouseY = point.y;
      redrawCanvas(historyState);
    } else {
      cursorCanvasComponent.updateCursor(point);
    }
  }

  function handleMouseUp() {
    if (currentShape?.isDrawing) {
      const shapeAction: DrawAction = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        tool: { ...currentTool },
        points: [],
        type: 'shape',
        shape: { ...currentShape, isDrawing: false }
      };
      addAction(shapeAction);
      currentShape = null;
      startPoint = null;
      cursorCanvasComponent.clearCanvas();
    } else if (selectionState.selectedShape && selectionState.isDragging) {
      updateShapeInHistory(selectionState.selectedShape);
    } else {
      stopDrawing();
      if (currentAction) {
        addAction(currentAction);
        currentAction = null;
      }
    }

    selectionState.isDragging = false;
    selectionState.activeHandle = undefined;
  }

  function handleMouseLeave() {
    handleMouseUp();
    cursorCanvasComponent.clearCanvas();
  }
</script>

<div class="relative">
  <canvas
    bind:this={mainCanvas}
    width={currentSettings.width}
    height={currentSettings.height}
    on:mousedown={handleMouseDown}
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseLeave}
    class="bg-white border-4 border-blue-700"
  ></canvas>

  <CursorCanvas
    bind:this={cursorCanvasComponent}
    width={currentSettings.width}
    height={currentSettings.height}
  />
</div>
