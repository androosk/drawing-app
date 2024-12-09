import type { Shape, HandleTransform, Point } from '../types/drawing';

export function getHandles(shape: Shape): HandleTransform[] {
	const handles: HandleTransform[] = [];
	const { x, y, width, height, rotation = 0 } = shape;
	const centerX = x + width / 2;
	const centerY = y + height / 2;

	const baseHandles = [
		{ pos: 'tl', x: x, y: y, cursor: 'nw-resize' },
		{ pos: 'tr', x: x + width, y: y, cursor: 'ne-resize' },
		{ pos: 'bl', x: x, y: y + height, cursor: 'sw-resize' },
		{ pos: 'br', x: x + width, y: y + height, cursor: 'se-resize' },
		{ pos: 't', x: x + width / 2, y: y, cursor: 'n-resize' },
		{ pos: 'r', x: x + width, y: y + height / 2, cursor: 'e-resize' },
		{ pos: 'b', x: x + width / 2, y: y + height, cursor: 'n-resize' },
		{ pos: 'l', x: x, y: y + height / 2, cursor: 'e-resize' }
	];

	baseHandles.forEach((h) => {
		const rotated = rotatePoint({ x: h.x, y: h.y }, { x: centerX, y: centerY }, rotation);

		handles.push({
			type: 'resize',
			position: h.pos as HandleTransform['position'],
			x: rotated.x,
			y: rotated.y,
			cursor: h.cursor
		});
	});

	const rotationHandle = rotatePoint(
		{ x: centerX, y: y - 20 },
		{ x: centerX, y: centerY },
		rotation
	);

	handles.push({
		type: 'rotate',
		position: 'rotation',
		x: rotationHandle.x,
		y: rotationHandle.y,
		cursor: 'grab'
	});

	return handles;
}

export function isPointInShape(point: Point, shape: Shape): boolean {
	const rotatedPoint = rotatePoint(
		point,
		{ x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 },
		-shape.rotation
	);

	switch (shape.type) {
		case 'rectangle':
			return (
				rotatedPoint.x >= shape.x &&
				rotatedPoint.x <= shape.x + shape.width &&
				rotatedPoint.y >= shape.y &&
				rotatedPoint.y <= shape.y + shape.height
			);
		case 'circle':
			const centerX = shape.x + shape.width / 2;
			const centerY = shape.y + shape.height / 2;
			const radius = Math.min(shape.width, shape.height) / 2;
			const distance = Math.sqrt(
				Math.pow(rotatedPoint.x - centerX, 2) + Math.pow(rotatedPoint.y - centerY, 2)
			);
			return distance <= radius;
		case 'line':
			return isPointNearLine(
				rotatedPoint,
				{ x: shape.x, y: shape.y },
				{ x: shape.x + shape.width, y: shape.y + shape.height }
			);
	}
}

function isPointNearLine(point: Point, start: Point, end: Point, threshold = 5): boolean {
	const distance = pointToLineDistance(point, start, end);
	return distance <= threshold;
}

function pointToLineDistance(point: Point, start: Point, end: Point): number {
	const numerator = Math.abs(
		(end.y - start.y) * point.x - (end.x - start.x) * point.y + end.x * start.y - end.y * start.x
	);
	const denominator = Math.sqrt(Math.pow(end.y - start.y, 2) + Math.pow(end.x - start.x, 2));
	return numerator / denominator;
}

export function rotatePoint(point: Point, center: Point, angle: number): Point {
	const radians = (angle * Math.PI) / 180;
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);

	const x = center.x + (point.x - center.x) * cos - (point.y - center.y) * sin;
	const y = center.y + (point.x - center.x) * sin + (point.y - center.y) * cos;

	return { x, y };
}

export function findShapeAtPoint(
	point: Point,
	shapes: Shape[],
	threshold: number = 5
): Shape | undefined {
	for (let i = shapes.length - 1; i >= 0; i--) {
		const shape = shapes[i];
		if (isPointInShape(point, shape)) {
			return shape;
		}
	}
	return undefined;
}

export function findHandleAtPoint(
	point: Point,
	shape: Shape,
	threshold: number = 8
): HandleTransform | undefined {
	const handles = getHandles(shape);

	return handles.find((handle) => {
		const distance = Math.sqrt(Math.pow(point.x - handle.x, 2) + Math.pow(point.y - handle.y, 2));
		return distance <= threshold;
	});
}
