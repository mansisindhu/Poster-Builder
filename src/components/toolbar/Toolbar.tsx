"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Type, Image, Trash2, Download, RefreshCw } from "lucide-react";

interface ToolbarProps {
  hasSelection: boolean;
  onAddText: () => void;
  onAddImage: (file: File) => void;
  onDelete: () => void;
  onClearCanvas: () => void;
  onExport: () => void;
}

export function Toolbar({
  hasSelection,
  onAddText,
  onAddImage,
  onDelete,
  onClearCanvas,
  onExport,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddImage(file);
      e.target.value = "";
    }
  };

  return (
    <header className="flex items-center justify-between px-3 md:px-5 py-2 md:py-3 bg-background border-b gap-2">
      {/* Logo - hidden on very small screens */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <h1 className="text-lg md:text-xl font-bold text-primary whitespace-nowrap">Poster Builder</h1>
      </div>

      {/* Main actions */}
      <div className="flex items-center gap-1 md:gap-2 flex-1 sm:flex-none justify-start sm:justify-center">
        <Button variant="outline" size="sm" onClick={onAddText} className="px-2 md:px-3">
          <Type className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Add Text</span>
        </Button>

        <Button variant="outline" size="sm" onClick={handleImageClick} className="px-2 md:px-3">
          <Image className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Add Image</span>
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-px h-6 bg-border mx-1 md:mx-2 hidden sm:block" />

        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={!hasSelection}
          className="px-2 md:px-3"
        >
          <Trash2 className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Delete</span>
        </Button>
      </div>

      {/* Secondary actions */}
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        <Button variant="outline" size="sm" onClick={onClearCanvas} className="px-2 md:px-3">
          <RefreshCw className="w-4 h-4 md:mr-2" />
          <span className="hidden lg:inline">Clear All</span>
        </Button>

        <Button size="sm" onClick={onExport} className="px-2 md:px-3">
          <Download className="w-4 h-4 md:mr-2" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </header>
  );
}