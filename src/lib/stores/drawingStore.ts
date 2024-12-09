import { writable, derived, get, type Readable } from 'svelte/store';
import type {
	Tool,
	DrawingState,
	CanvasSettings,
	DrawAction,
	HistoryState,
	Point,
	Shape
} from '../types/drawing';

import { DrawingError } from '../types/drawing';

export type DrawingStore = {
	settings: Readable<CanvasSettings>;
	tool: Readable<Tool>;
	drawingState: Readable<DrawingState>;
	history: Readable<HistoryState>;
	error: Readable<DrawingError | null>;
	canUndo: Readable<boolean>;
	canRedo: Readable<boolean>;
	startDrawing: (point: Point) => void;
	stopDrawing: () => void;
	addAction: (action: DrawAction) => void;
	undo: () => void;
	redo: () => void;
	updateToolSize: (size: number) => void;
	updateTool: (newTool: Tool) => void;
	toggleEraser: () => void;
	clearError: () => void;
	reset: () => void;
	clearCanvas: () => void;
	updateShapeInHistory: (shape: Shape) => void;
};

const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
	width: 800,
	height: 600,
	backgroundColor: '#FFFFFF'
};

const DEFAULT_TOOL: Tool = {
	type: 'brush',
	size: 2,
	color: '#000000',
	opacity: 1
};

const DEFAULT_HISTORY: HistoryState = {
	actions: [],
	currentIndex: -1,
	maxSize: 50
};

function createDrawingStore(): DrawingStore {
	const settings = writable<CanvasSettings>(DEFAULT_CANVAS_SETTINGS);
	const tool = writable<Tool>(DEFAULT_TOOL);
	const drawingState = writable<DrawingState>({
		isDrawing: false,
		lastX: 0,
		lastY: 0
	});
	const history = writable<HistoryState>(DEFAULT_HISTORY);
	const error = writable<DrawingError | null>(null);

	const canUndo = derived(history, ($history) => $history.currentIndex > -1);
	const canRedo = derived(
		history,
		($history) => $history.currentIndex < $history.actions.length - 1
	);

	function startDrawing(point: Point) {
		drawingState.update((state) => ({
			...state,
			isDrawing: true,
			lastX: point.x,
			lastY: point.y
		}));
	}

	function stopDrawing() {
		drawingState.update((state) => ({
			...state,
			isDrawing: false
		}));
	}

	function addAction(action: DrawAction) {
		history.update((state) => {
			const newActions = [...state.actions.slice(0, state.currentIndex + 1), action];

			if (newActions.length > state.maxSize) {
				newActions.shift();
			}

			return {
				...state,
				actions: newActions,
				currentIndex: newActions.length - 1
			};
		});
	}

	function clearCanvas() {
		const clearAction: DrawAction = {
			id: crypto.randomUUID(),
			timestamp: Date.now(),
			tool: { ...get(tool) },
			points: [],
			type: 'clear'
		};

		addAction(clearAction);
	}

	function undo() {
		try {
			history.update((state) => {
				if (state.currentIndex < 0) throw new Error('Nothing to undo');
				return {
					...state,
					currentIndex: state.currentIndex - 1
				};
			});
		} catch (err) {
			error.set(new DrawingError('HISTORY_ERROR', 'Failed to undo action', err));
		}
	}

	function redo() {
		try {
			history.update((state) => {
				if (state.currentIndex >= state.actions.length - 1) {
					throw new Error('Nothing to redo');
				}
				return {
					...state,
					currentIndex: state.currentIndex + 1
				};
			});
		} catch (err) {
			error.set(new DrawingError('HISTORY_ERROR', 'Failed to redo action', err));
		}
	}

	function updateToolSize(size: number) {
		tool.update((current) => ({
			...current,
			size
		}));
	}

	function updateTool(newTool: Tool) {
		tool.update(() => newTool);
	}

	function toggleEraser() {
		tool.update((current) => ({
			...current,
			type: current.type === 'brush' ? 'eraser' : 'brush'
		}));
	}

	function clearError() {
		error.set(null);
	}

	function reset() {
		settings.set(DEFAULT_CANVAS_SETTINGS);
		tool.set(DEFAULT_TOOL);
		history.set(DEFAULT_HISTORY);
		error.set(null);
	}

	function updateShapeInHistory(shape: Shape) {
		history.update((state) => ({
			...state,
			actions: state.actions.map((action) => {
				if (action.type === 'shape' && action.shape?.id === shape.id) {
					return {
						...action,
						shape: shape
					};
				}
				return action;
			})
		}));
	}

	return {
		settings: { subscribe: settings.subscribe },
		tool: { subscribe: tool.subscribe },
		drawingState: { subscribe: drawingState.subscribe },
		history: { subscribe: history.subscribe },
		error: { subscribe: error.subscribe },
		canUndo: { subscribe: canUndo.subscribe },
		canRedo: { subscribe: canRedo.subscribe },
		updateShapeInHistory,
		startDrawing,
		stopDrawing,
		addAction,
		undo,
		redo,
		updateToolSize,
		updateTool,
		toggleEraser,
		clearError,
		clearCanvas,
		reset
	};
}

export const drawingStore = createDrawingStore();
