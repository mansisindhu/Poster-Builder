import { CanvasElement } from "@/types/canvas";
import { isTextElement, isShapeElement, hasSizeProperty } from "@/types/guards";

export type UpdateFn = (id: string, updates: Partial<CanvasElement>) => void;

export interface PropertyHandlers {
  handlePositionChange: (axis: "x" | "y", value: string) => void;
  handleRotationChange: (value: string) => void;
  handleResetRotation: () => void;
  handleSizeChange: (dimension: "width" | "height", value: string) => void;
  handleFontSizeChange: (value: string) => void;
  handleTextColorChange: (value: string) => void;
  handleTextWidthChange: (value: string) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  setAlignment: (align: "left" | "center" | "right") => void;
  handleShapeFillColorChange: (value: string) => void;
  handleShapeStrokeColorChange: (value: string) => void;
  handleShapeStrokeWidthChange: (value: string) => void;
  handleShapeBorderRadiusChange: (value: string) => void;
  handlePointChange: (index: number, axis: "x" | "y", value: string) => void;
  addPolygonPoint: () => void;
  removePolygonPoint: (index: number) => void;
}

/**
 * Creates property change handlers for an element.
 * Handlers use type guards to ensure type safety without explicit casts.
 */
export function createPropertyHandlers(
  element: CanvasElement | null,
  onUpdate: UpdateFn
): PropertyHandlers {
  const handlePositionChange = (axis: "x" | "y", value: string) => {
    if (!element) return;
    const numValue = parseInt(value) || 0;
    onUpdate(element.id, {
      position: { ...element.position, [axis]: numValue },
    });
  };

  const handleRotationChange = (value: string) => {
    if (!element) return;
    let numValue = parseFloat(value) || 0;
    numValue = ((numValue % 360) + 360) % 360;
    onUpdate(element.id, { rotation: numValue });
  };

  const handleResetRotation = () => {
    if (!element) return;
    onUpdate(element.id, { rotation: 0 });
  };

  const handleSizeChange = (dimension: "width" | "height", value: string) => {
    if (!hasSizeProperty(element)) return;
    const numValue = Math.max(50, parseInt(value) || 50);
    onUpdate(element.id, {
      size: { ...element.size, [dimension]: numValue },
    });
  };

  const handleFontSizeChange = (value: string) => {
    if (!isTextElement(element)) return;
    onUpdate(element.id, { fontSize: parseInt(value) || 24 });
  };

  const handleTextColorChange = (value: string) => {
    if (!isTextElement(element)) return;
    onUpdate(element.id, { color: value });
  };

  const handleTextWidthChange = (value: string) => {
    if (!isTextElement(element)) return;
    const numValue = Math.max(50, parseInt(value) || 200);
    onUpdate(element.id, { width: numValue });
  };

  const toggleBold = () => {
    if (!isTextElement(element)) return;
    onUpdate(element.id, { 
      fontWeight: element.fontWeight === "bold" ? "normal" : "bold" 
    });
  };

  const toggleItalic = () => {
    if (!isTextElement(element)) return;
    onUpdate(element.id, { 
      fontStyle: element.fontStyle === "italic" ? "normal" : "italic" 
    });
  };

  const setAlignment = (align: "left" | "center" | "right") => {
    if (!isTextElement(element)) return;
    onUpdate(element.id, { textAlign: align });
  };

  const handleShapeFillColorChange = (value: string) => {
    if (!isShapeElement(element)) return;
    onUpdate(element.id, { fillColor: value });
  };

  const handleShapeStrokeColorChange = (value: string) => {
    if (!isShapeElement(element)) return;
    onUpdate(element.id, { strokeColor: value });
  };

  const handleShapeStrokeWidthChange = (value: string) => {
    if (!isShapeElement(element)) return;
    const numValue = Math.max(0, parseInt(value) || 0);
    onUpdate(element.id, { strokeWidth: numValue });
  };

  const handleShapeBorderRadiusChange = (value: string) => {
    if (!isShapeElement(element)) return;
    const numValue = Math.max(0, parseInt(value) || 0);
    onUpdate(element.id, { borderRadius: numValue });
  };

  const handlePointChange = (index: number, axis: "x" | "y", value: string) => {
    if (!isShapeElement(element)) return;
    const numValue = parseFloat(value) || 0;
    const newPoints = [...element.points];
    newPoints[index] = { ...newPoints[index], [axis]: numValue };
    onUpdate(element.id, { points: newPoints });
  };

  const addPolygonPoint = () => {
    if (!isShapeElement(element) || element.shapeType !== "polygon") return;
    const newPoints = [...element.points];
    newPoints.push({ x: element.size.width / 2, y: element.size.height / 2 });
    onUpdate(element.id, { points: newPoints });
  };

  const removePolygonPoint = (index: number) => {
    if (!isShapeElement(element) || element.shapeType !== "polygon") return;
    if (element.points.length <= 3) return;
    const newPoints = element.points.filter((_, i) => i !== index);
    onUpdate(element.id, { points: newPoints });
  };

  return {
    handlePositionChange,
    handleRotationChange,
    handleResetRotation,
    handleSizeChange,
    handleFontSizeChange,
    handleTextColorChange,
    handleTextWidthChange,
    toggleBold,
    toggleItalic,
    setAlignment,
    handleShapeFillColorChange,
    handleShapeStrokeColorChange,
    handleShapeStrokeWidthChange,
    handleShapeBorderRadiusChange,
    handlePointChange,
    addPolygonPoint,
    removePolygonPoint,
  };
}
