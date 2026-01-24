"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Type,
  Image as ImageIcon,
  Shapes,
  Move,
  RotateCw,
  Trash2,
  Layers,
  Settings,
  Palette,
  Grid3X3,
  ZoomIn,
  Download,
  Save,
  Keyboard,
  Eye,
  Lock,
  Unlock,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Droplets,
  Contrast,
  Circle,
  Sparkles
} from "lucide-react";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Editor
            </Link>
            <h1 className="text-2xl font-bold">Poster Builder Guide</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-12">

          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              Welcome to Poster Builder
            </h2>
            <p className="text-lg text-muted-foreground">
              Create stunning posters with our powerful design tool. This guide covers all features and how to use them effectively.
            </p>
          </section>

          {/* Getting Started */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              🚀 Getting Started
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Canvas Overview</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Auto-fitting canvas that scales to your screen</li>
                  <li>• Zoom controls (25% - 200%) at bottom right</li>
                  <li>• Grid snapping for precise alignment</li>
                  <li>• Multiple export sizes and formats</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Basic Workflow</h3>
                <ol className="space-y-2 text-muted-foreground">
                  <li>1. Set your canvas size in properties panel</li>
                  <li>2. Add elements using the toolbar</li>
                  <li>3. Position and style elements</li>
                  <li>4. Export your poster</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Adding Elements */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Shapes className="w-6 h-6" />
              Adding Elements
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4 p-6 border rounded-lg">
                <Type className="w-8 h-8 text-blue-500" />
                <h3 className="text-lg font-semibold">Text Elements</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Click text button in toolbar</li>
                  <li>• Double-click to edit content</li>
                  <li>• Rich formatting options</li>
                  <li>• Text shadows and effects</li>
                </ul>
              </div>

              <div className="space-y-4 p-6 border rounded-lg">
                <ImageIcon className="w-8 h-8 text-green-500" />
                <h3 className="text-lg font-semibold">Images</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Drag & drop or click upload</li>
                  <li>• Auto-resize to fit canvas</li>
                  <li>• Image filters and effects</li>
                  <li>• Flip horizontal/vertical</li>
                </ul>
              </div>

              <div className="space-y-4 p-6 border rounded-lg">
                <Shapes className="w-8 h-8 text-purple-500" />
                <h3 className="text-lg font-semibold">Shapes</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Rectangles, circles, lines</li>
                  <li>• Triangles and polygons</li>
                  <li>• Custom fill and stroke</li>
                  <li>• Flip and rotate freely</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Element Manipulation */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Move className="w-6 h-6" />
              Element Manipulation
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Basic Controls</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Move className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Drag to Move</p>
                      <p className="text-sm text-muted-foreground">Click and drag any element to reposition it</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded border-2 border-orange-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
                    </div>
                    <div>
                      <p className="font-medium">Resize Handles</p>
                      <p className="text-sm text-muted-foreground">Drag corner handles to resize elements</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <RotateCw className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Rotation Handle</p>
                      <p className="text-sm text-muted-foreground">Drag the circle above elements to rotate</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Advanced Features</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium">Lock Elements</p>
                      <p className="text-sm text-muted-foreground">Prevent accidental movement of important elements</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Layers className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Layer Management</p>
                      <p className="text-sm text-muted-foreground">Reorder elements with bring to front/send to back</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FlipHorizontal className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="font-medium">Flip & Mirror</p>
                      <p className="text-sm text-muted-foreground">Flip images and shapes horizontally/vertically</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Styling & Effects */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Palette className="w-6 h-6" />
              Styling & Effects
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold">Opacity</h4>
                </div>
                <p className="text-sm text-muted-foreground">Make elements semi-transparent with the opacity slider</p>
              </div>

              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-purple-500" />
                  <h4 className="font-semibold">Text Shadows</h4>
                </div>
                <p className="text-sm text-muted-foreground">Add depth to text with customizable shadows</p>
              </div>

              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <h4 className="font-semibold">Image Filters</h4>
                </div>
                <p className="text-sm text-muted-foreground">Apply grayscale, brightness, contrast, and blur effects</p>
              </div>

              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-cyan-500" />
                  <h4 className="font-semibold">Backgrounds</h4>
                </div>
                <p className="text-sm text-muted-foreground">Solid colors or beautiful gradients with presets</p>
              </div>

              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold">Grid Snapping</h4>
                </div>
                <p className="text-sm text-muted-foreground">Align elements precisely with grid snapping</p>
              </div>

              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <ZoomIn className="w-5 h-5 text-orange-500" />
                  <h4 className="font-semibold">Zoom Controls</h4>
                </div>
                <p className="text-sm text-muted-foreground">Zoom from 25% to 200% or fit to screen</p>
              </div>
            </div>
          </section>

          {/* Canvas Settings */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Settings className="w-6 h-6" />
              Canvas Settings
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Background Options</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Solid Colors</h4>
                    <p className="text-sm text-muted-foreground">Choose any color for your canvas background</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Gradient Backgrounds</h4>
                    <p className="text-sm text-muted-foreground">Beautiful gradients with preset options or custom colors</p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      <li>• Sunset, Ocean, Forest presets</li>
                      <li>• Horizontal, vertical, diagonal directions</li>
                      <li>• Custom start/end colors</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Grid & Precision</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Snap to Grid</h4>
                    <p className="text-sm text-muted-foreground">Enable visual grid and magnetic snapping</p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      <li>• 10px, 20px, 50px grid sizes</li>
                      <li>• Subtle visual overlay</li>
                      <li>• Smart snapping (not forced)</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Canvas Sizes</h4>
                    <p className="text-sm text-muted-foreground">Choose from preset sizes or custom dimensions</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Keyboard className="w-6 h-6" />
              Keyboard Shortcuts
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">General</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 px-3 bg-muted rounded">
                    <span>Delete selected</span>
                    <kbd className="bg-background px-2 py-1 rounded text-xs">Del</kbd>
                  </div>
                  <div className="flex justify-between py-2 px-3 bg-muted rounded">
                    <span>Undo</span>
                    <kbd className="bg-background px-2 py-1 rounded text-xs">Ctrl+Z</kbd>
                  </div>
                  <div className="flex justify-between py-2 px-3 bg-muted rounded">
                    <span>Redo</span>
                    <kbd className="bg-background px-2 py-1 rounded text-xs">Ctrl+Y</kbd>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Zoom & View</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 px-3 bg-muted rounded">
                    <span>Zoom In</span>
                    <kbd className="bg-background px-2 py-1 rounded text-xs">Ctrl + +</kbd>
                  </div>
                  <div className="flex justify-between py-2 px-3 bg-muted rounded">
                    <span>Zoom Out</span>
                    <kbd className="bg-background px-2 py-1 rounded text-xs">Ctrl + -</kbd>
                  </div>
                  <div className="flex justify-between py-2 px-3 bg-muted rounded">
                    <span>Fit to Screen</span>
                    <kbd className="bg-background px-2 py-1 rounded text-xs">Ctrl + 0</kbd>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Export & Save */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Download className="w-6 h-6" />
              Export & Save
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Export Options</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">PNG Export</h4>
                    <p className="text-sm text-muted-foreground">High-quality PNG with all effects and transparency</p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      <li>• Preserves all visual effects</li>
                      <li>• No grid or guides in export</li>
                      <li>• Automatic download</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Project Management</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Save Projects</h4>
                    <p className="text-sm text-muted-foreground">Save your work locally and resume later</p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      <li>• Auto-save functionality</li>
                      <li>• Project thumbnails</li>
                      <li>• Load previous work</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tips & Best Practices */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              💡 Tips & Best Practices
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Design Tips</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Use the grid for consistent alignment</li>
                  <li>• Lock important elements to prevent accidents</li>
                  <li>• Layer text over semi-transparent shapes</li>
                  <li>• Use gradients for modern, eye-catching backgrounds</li>
                  <li>• Apply subtle shadows to make text pop</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Workflow Tips</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Save frequently to avoid losing work</li>
                  <li>• Use zoom for detailed editing</li>
                  <li>• Group related elements together</li>
                  <li>• Test exports at different sizes</li>
                  <li>• Use keyboard shortcuts for efficiency</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="text-center py-8 border-t">
            <p className="text-muted-foreground">
              Ready to create amazing posters? <Link href="/" className="text-primary hover:underline font-medium">Start designing now!</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}