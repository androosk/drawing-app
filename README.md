# Drawing Application

A real-time (someday collaborative) drawing application built with SvelteKit and TypeScript. Features include freehand drawing, shape creation, and image manipulation.

## Features

- Freehand drawing with adjustable brush sizes
- Shape tools (rectangle, circle, line)
- Shape manipulation (resize, rotate, move)
- Undo/redo functionality
- Eraser tool
- Real-time collaboration capabilities
- Local storage for saving drawings

## Technologies

- SvelteKit
- TypeScript
- HTML5 Canvas
- Tailwind CSS

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/drawing-app.git
cd drawing-app
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── canvas/          # Canvas-related components
│   │   └── ui/              # Reusable UI components
│   ├── stores/              # State management
│   ├── services/            # Canvas and storage services
│   ├── types/               # TypeScript definitions
│   └── utils/               # Helper functions
└── routes/                  # SvelteKit routes
```

## Usage

### Drawing Tools
- Click and drag to draw freehand
- Select shape tools to create geometric shapes
- Use eraser tool to remove content
- Adjust brush size with the slider

### Shape Manipulation
- Select shapes to move, resize, or rotate
- Use corner handles to resize
- Use top handle to rotate
- Drag shape to move

### History
- Undo: Revert last action
- Redo: Restore previously undone action

## Architecture

The application uses:
- Store-based state management
- Service-oriented architecture for canvas operations and storage
- Component composition for UI elements
- Type-safe development with TypeScript

## Testing

Run tests with:
```bash
npm test
```

## Building

Create production build:
```bash
npm run build
```

## License

MIT