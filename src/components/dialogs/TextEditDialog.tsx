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
];

const defaultFormData: TextFormData = {
  content: "Your text here",
  fontSize: 24,
  fontFamily: "Arial, sans-serif",
  fontWeight: "normal",
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
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="color" className="text-sm">Text Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                className="h-10 p-1 cursor-pointer"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fontWeight" className="text-sm">Font Weight</Label>
              <Select
                value={formData.fontWeight}
                onValueChange={(value: "normal" | "bold") =>
                  setFormData((prev) => ({ ...prev, fontWeight: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            {editingElement ? "Save Changes" : "Add Text"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}