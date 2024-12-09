export interface CanvasSettings {
	width: number;
	height: number;
	backgroundColor: string;
}

export interface DrawingState {
	isDrawing: boolean;
	lastX: number;
	lastY: number;
}

export type ToolType = 'brush' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'select';

export interface Tool {
	type: ToolType;
	size: number;
	color?: string;
	opacity?: number;
}

export interface BrushTool extends Tool {
	type: 'brush';
	color: string;
}

export interface EraserTool extends Tool {
	type: 'eraser';
}

export interface DrawAction {
	id: string;
	timestamp: number;
	tool: Tool;
	points: Point[];
	type: 'draw' | 'clear' | 'shape';
	shape?: Shape;
}

export interface Point {
	x: number;
	y: number;
	pressure?: number;
}

export interface CanvasContextConfig {
	lineWidth: number;
	strokeStyle: string;
	lineJoin: CanvasLineJoin;
	lineCap: CanvasLineCap;
	globalCompositeOperation: GlobalCompositeOperation;
}

export interface HistoryState {
	actions: DrawAction[];
	currentIndex: number;
	maxSize: number;
}

export interface SavedDrawing {
	id: string;
	name: string;
	timestamp: number;
	settings: CanvasSettings;
	actions: DrawAction[];
	thumbnail?: string;
	collaborators?: string[];
	version: number;
}

export interface DrawingEvent {
	type: 'start' | 'move' | 'end' | 'leave';
	point: Point;
	tool: Tool;
	pressure?: number;
}

export type DrawingErrorType =
	| 'CANVAS_INITIALIZATION_ERROR'
	| 'SAVE_ERROR'
	| 'LOAD_ERROR'
	| 'INVALID_TOOL_CONFIG'
	| 'HISTORY_ERROR';

export class DrawingError extends Error {
	constructor(
		public type: DrawingErrorType,
		message: string,
		public details?: unknown
	) {
		super(message);
		this.name = 'DrawingError';
	}
}

export interface Shape {
	id: string;
	type: 'rectangle' | 'circle' | 'line';
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
	rotation: number;
	isSelected?: boolean;
	isDrawing?: boolean;
}

export interface HandleTransform {
	type: 'resize' | 'rotate';
	position: 'tl' | 'tr' | 'bl' | 'br' | 't' | 'r' | 'b' | 'l' | 'rotation';
	cursor: string;
	x: number;
	y: number;
}

export interface SelectionState {
	selectedShape?: Shape;
	activeHandle?: HandleTransform;
	isDragging: boolean;
	lastMouseX: number;
	lastMouseY: number;
}

// TODO: Add collaboration functionality later
export interface CollaborationState {
	userId: string;
	activeUsers: Set<string>;
	currentTool: Tool;
	cursorPosition: Point;
}
