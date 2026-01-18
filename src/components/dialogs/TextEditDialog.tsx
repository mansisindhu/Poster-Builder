"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextFormData, TextElement } from "@/types/canvas";
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingElement: TextElement | null;
  onSave: (data: TextFormData) => void;
}

const fontFamilies = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Impact, sans-serif", label: "Impact" },
  { value: "'Comic Sans MS', cursive", label: "Comic Sans MS" },
  { value: "'Trebuchet MS', sans-serif", label: "Trebuchet MS" },
  { value: "Tahoma, sans-serif", label: "Tahoma" },
  { value: "'Lucida Console', monospace", label: "Lucida Console" },
];

const defaultFormData: TextFormData = {
  content: "",
  fontSize: 24,
  fontFamily: "Arial, sans-serif",
  fontWeight: "normal",
  fontStyle: "normal",
  textAlign: "left",
  color: "#000000",
};

export function TextEditDialog({
  open,
  onOpenChange,
  editingElement,
  onSave,
}: TextEditDialogProps) {
  const [formData, setFormData] = useState<TextFormData>(defaultFormData);

  useEffect(() => {
    if (editingElement) {
      setFormData({
        content: editingElement.content,
        fontSize: editingElement.fontSize,
        fontFamily: editingElement.fontFamily,
        fontWeight: editingElement.fontWeight,
        fontStyle: editingElement.fontStyle || "normal",
        textAlign: editingElement.textAlign || "left",
        color: editingElement.color,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [editingElement, open]);

  const handleSave = () => {
    if (!formData.content.trim()) {
      return;
    }
    onSave(formData);
    onOpenChange(false);
  };

  const toggleBold = () => {
    setFormData(prev => ({
      ...prev,
      fontWeight: prev.fontWeight === "bold" ? "normal" : "bold"
    }));
  };

  const toggleItalic = () => {
    setFormData(prev => ({
      ...prev,
      fontStyle: prev.fontStyle === "italic" ? "normal" : "italic"
    }));
  };

  const setAlignment = (align: "left" | "center" | "right") => {
    setFormData(prev => ({ ...prev, textAlign: align }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingElement ? "Edit Text" : "Add Text"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="content">Text Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Enter your text here..."
              rows={3}
            />
          </div>

          {/* Text Styling Toolbar */}
          <div className="grid gap-2">
            <Label className="text-sm">Text Style</Label>
            <div className="flex gap-1 flex-wrap">
              {/* Bold */}
              <Button
                type="button"
                variant={formData.fontWeight === "bold" ? "default" : "outline"}
                size="sm"
                className="w-9 h-9 p-0"
                onClick={toggleBold}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </Button>
              
              {/* Italic */}
              <Button
                type="button"
                variant={formData.fontStyle === "italic" ? "default" : "outline"}
                size="sm"
                className="w-9 h-9 p-0"
                onClick={toggleItalic}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </Button>

              <div className="w-px bg-border mx-1" />

              {/* Align Left */}
              <Button
                type="button"
                variant={formData.textAlign === "left" ? "default" : "outline"}
                size="sm"
                className="w-9 h-9 p-0"
                onClick={() => setAlignment("left")}
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </Button>

              {/* Align Center */}
              <Button
                type="button"
                variant={formData.textAlign === "center" ? "default" : "outline"}
                size="sm"
                className="w-9 h-9 p-0"
                onClick={() => setAlignment("center")}
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </Button>

              {/* Align Right */}
              <Button
                type="button"
                variant={formData.textAlign === "right" ? "default" : "outline"}
                size="sm"
                className="w-9 h-9 p-0"
                onClick={() => setAlignment("right")}
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fontSize" className="text-sm">Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                min={8}
                max={200}
                value={formData.fontSize}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fontSize: parseInt(e.target.value) || 24,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fontFamily" className="text-sm">Font Family</Label>
              <Select
                value={formData.fontFamily}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, fontFamily: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem 
                      key={font.value} 
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="color" className="text-sm">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                className="h-10 w-14 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                className="h-10 flex-1 font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="grid gap-2">
            <Label className="text-sm">Preview</Label>
            <div 
              className="p-4 border rounded-md min-h-[60px] bg-white overflow-hidden"
              style={{
                fontFamily: formData.fontFamily,
                fontSize: Math.min(formData.fontSize, 32),
                fontWeight: formData.fontWeight,
                fontStyle: formData.fontStyle,
                textAlign: formData.textAlign,
                color: formData.color,
              }}
            >
              {formData.content || <span className="text-muted-foreground italic" style={{ fontStyle: 'italic' }}>Your text will appear here...</span>}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.content.trim()} className="w-full sm:w-auto">
            {editingElement ? "Save Changes" : "Add Text"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
