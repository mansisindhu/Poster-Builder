# Poster Builder

A lightweight, browser-based poster and banner builder - similar to a simplified version of Canva. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

### Core Canvas Interactions
- **Drag and Drop**: Click and drag elements freely around the canvas
- **Selection**: Click on any element to select it (shown with a ring highlight)
- **Keyboard Navigation**: Use arrow keys to move selected elements (hold Shift for larger steps)
- **Delete Elements**: Press Delete or Backspace to remove selected elements

### Element Types

#### Text Elements
- Add text blocks to your poster
- Customize:
  - Font family (Arial, Georgia, Times New Roman, Courier New, Verdana, Impact)
  - Font size (8-200px)
  - Font weight (Normal/Bold)
  - Text color
- Double-click text to edit

#### Image Elements
- Upload images from your computer
- Images are automatically scaled to fit the canvas
- Resize images using corner handles
- Drag to reposition

### UI Features
- **Toolbar**: Quick access to add text, add image, delete, clear canvas, and export
- **Properties Panel** (left): Edit selected element properties (position, size, text settings)
- **Layers Panel** (right): View all elements, click to select

### Export
- Export your poster as a PNG image

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Radix UI** - Headless UI primitives
- **Lucide Icons** - Beautiful icons

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Delete selected element |
| `Escape` | Deselect all / Close dialog |
| `Arrow Keys` | Move selected element by 1px |
| `Shift + Arrow Keys` | Move selected element by 10px |

## Project Structure

```
src/
├── app/
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/
│   ├── ui/                # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   ├── canvas/            # Canvas components
│   │   ├── Canvas.tsx
│   │   └── CanvasElement.tsx
│   ├── dialogs/           # Dialog components
│   │   └── TextEditDialog.tsx
│   ├── panels/            # Sidebar panels
│   │   ├── LayersPanel.tsx
│   │   └── PropertiesPanel.tsx
│   ├── toolbar/           # Toolbar
│   │   └── Toolbar.tsx
│   └── PosterBuilder.tsx  # Main component
├── lib/
│   ├── utils.ts           # Utility functions
│   └── useCanvas.ts       # Canvas state hook
└── types/
    └── canvas.ts          # TypeScript types
```

## Future Enhancements

Potential features that could be added:
- Shape elements (rectangles, circles, lines)
- Undo/Redo functionality
- Layer reordering (bring to front/send to back)
- Element rotation
- Multiple canvas sizes/templates
- Save/Load projects (localStorage)
- Copy/Paste elements
- Alignment guides and snapping
- Background color/image for canvas