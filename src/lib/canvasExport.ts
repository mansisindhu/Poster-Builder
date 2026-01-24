import { CanvasElement, CanvasSettings, TextElement, ImageElement, ShapeElement, GroupElement } from "@/types/canvas";

/**
 * Wrap text to fit within a specified width
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Draw a shape element on the canvas
 */
export function drawShape(
  ctx: CanvasRenderingContext2D,
  element: ShapeElement
): void {
  const { size, shapeType, fillColor, strokeColor, strokeWidth, borderRadius, points, position, opacity } = element;
  const { width: shapeWidth, height: shapeHeight } = size;

  ctx.save();
  ctx.globalAlpha = opacity;

  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Helper function to scale points to fit current size
  const getScaledPoints = (pts: typeof points) => {
    if (!pts || pts.length === 0) return [];
    
    // Find the bounding box of the original points
    const minX = Math.min(...pts.map(p => p.x));
    const maxX = Math.max(...pts.map(p => p.x));
    const minY = Math.min(...pts.map(p => p.y));
    const maxY = Math.max(...pts.map(p => p.y));
    
    const originalWidth = maxX - minX || 1;
    const originalHeight = maxY - minY || 1;
    
    // Scale points to fit current size
    return pts.map(p => ({
      x: ((p.x - minX) / originalWidth) * shapeWidth,
      y: ((p.y - minY) / originalHeight) * shapeHeight
    }));
  };

  switch (shapeType) {
    case "rectangle":
      if (borderRadius > 0) {
        // Draw rounded rectangle
        const r = Math.min(borderRadius, shapeWidth / 2, shapeHeight / 2);
        ctx.beginPath();
        ctx.moveTo(position.x + r, position.y);
        ctx.lineTo(position.x + shapeWidth - r, position.y);
        ctx.quadraticCurveTo(position.x + shapeWidth, position.y, position.x + shapeWidth, position.y + r);
        ctx.lineTo(position.x + shapeWidth, position.y + shapeHeight - r);
        ctx.quadraticCurveTo(position.x + shapeWidth, position.y + shapeHeight, position.x + shapeWidth - r, position.y + shapeHeight);
        ctx.lineTo(position.x + r, position.y + shapeHeight);
        ctx.quadraticCurveTo(position.x, position.y + shapeHeight, position.x, position.y + shapeHeight - r);
        ctx.lineTo(position.x, position.y + r);
        ctx.quadraticCurveTo(position.x, position.y, position.x + r, position.y);
        ctx.closePath();
        ctx.fill();
        if (strokeWidth > 0) ctx.stroke();
      } else {
        ctx.fillRect(position.x, position.y, shapeWidth, shapeHeight);
        if (strokeWidth > 0) ctx.strokeRect(position.x, position.y, shapeWidth, shapeHeight);
      }
      break;

    case "circle":
      const radius = Math.min(shapeWidth, shapeHeight) / 2;
      ctx.beginPath();
      ctx.arc(position.x + shapeWidth / 2, position.y + shapeHeight / 2, radius, 0, Math.PI * 2);
      ctx.fill();
      if (strokeWidth > 0) ctx.stroke();
      break;

    case "ellipse":
      ctx.beginPath();
      ctx.ellipse(
        position.x + shapeWidth / 2,
        position.y + shapeHeight / 2,
        shapeWidth / 2,
        shapeHeight / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      if (strokeWidth > 0) ctx.stroke();
      break;

    case "line":
      ctx.beginPath();
      if (points && points.length >= 2) {
        const scaledPts = getScaledPoints(points);
        ctx.moveTo(position.x + scaledPts[0].x, position.y + scaledPts[0].y);
        ctx.lineTo(position.x + scaledPts[1].x, position.y + scaledPts[1].y);
      } else {
        ctx.moveTo(position.x, position.y + shapeHeight / 2);
        ctx.lineTo(position.x + shapeWidth, position.y + shapeHeight / 2);
      }
      ctx.lineWidth = Math.max(strokeWidth, 2);
      ctx.stroke();
      break;

    case "triangle":
      ctx.beginPath();
      if (points && points.length >= 3) {
        const scaledPts = getScaledPoints(points);
        ctx.moveTo(position.x + scaledPts[0].x, position.y + scaledPts[0].y);
        ctx.lineTo(position.x + scaledPts[1].x, position.y + scaledPts[1].y);
        ctx.lineTo(position.x + scaledPts[2].x, position.y + scaledPts[2].y);
      } else {
        ctx.moveTo(position.x + shapeWidth / 2, position.y);
        ctx.lineTo(position.x, position.y + shapeHeight);
        ctx.lineTo(position.x + shapeWidth, position.y + shapeHeight);
      }
      ctx.closePath();
      ctx.fill();
      if (strokeWidth > 0) ctx.stroke();
      break;

    case "polygon":
      if (points && points.length >= 3) {
        const scaledPts = getScaledPoints(points);
        ctx.beginPath();
        ctx.moveTo(position.x + scaledPts[0].x, position.y + scaledPts[0].y);
        for (let i = 1; i < scaledPts.length; i++) {
          ctx.lineTo(position.x + scaledPts[i].x, position.y + scaledPts[i].y);
        }
        ctx.closePath();
        ctx.fill();
        if (strokeWidth > 0) ctx.stroke();
      } else {
        // Default pentagon
        const sides = 5;
        const cx = shapeWidth / 2;
        const cy = shapeHeight / 2;
        const r = Math.min(shapeWidth, shapeHeight) / 2;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
          const px = position.x + cx + r * Math.cos(angle);
          const py = position.y + cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        if (strokeWidth > 0) ctx.stroke();
      }
      break;
  }

  ctx.restore();
}

/**
 * Draw a text element on the canvas
 */
export function drawTextElement(
  ctx: CanvasRenderingContext2D,
  element: TextElement,
  offsetX: number = 0,
  offsetY: number = 0
): void {
  const posX = offsetX + element.position.x;
  const posY = offsetY + element.position.y;

  ctx.save();
  ctx.globalAlpha = element.opacity;

  // Build font string with style (italic) and weight
  const fontStyle = element.fontStyle || "normal";
  ctx.font = `${fontStyle} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;

  // Use element width for wrapping (minus padding)
  const textWidth = element.width - 24; // Account for px-3 padding (12px each side)

  // Split by newlines first, then wrap each line
  const paragraphs = element.content.split("\n");
  const allLines: string[] = [];
  paragraphs.forEach((para) => {
    if (para === '') {
      allLines.push('');
    } else {
      const wrapped = wrapText(ctx, para, textWidth);
      allLines.push(...wrapped);
    }
  });

  const lineHeight = element.fontSize * 1.2;
  const textHeight = allLines.length * lineHeight;

  const centerX = posX + element.width / 2;
  const centerY = posY + 8 + textHeight / 2;

  ctx.translate(centerX, centerY);
  ctx.rotate((element.rotation * Math.PI) / 180);
  ctx.scale(element.scaleX, element.scaleY);
  ctx.translate(-centerX, -centerY);

  // Apply text shadow
  if (element.shadowEnabled) {
    ctx.shadowColor = element.shadowColor;
    ctx.shadowBlur = element.shadowBlur;
    ctx.shadowOffsetX = element.shadowOffsetX;
    ctx.shadowOffsetY = element.shadowOffsetY;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  ctx.fillStyle = element.color;
  ctx.textBaseline = "top";
  
  // Calculate x position based on text alignment
  const textAlign = element.textAlign || "left";
  let y = posY + 8;
  allLines.forEach((line) => {
    let x = posX + 12; // Left padding
    if (textAlign === "center") {
      const lineWidth = ctx.measureText(line).width;
      x = posX + (element.width - lineWidth) / 2;
    } else if (textAlign === "right") {
      const lineWidth = ctx.measureText(line).width;
      x = posX + element.width - lineWidth - 12; // Right padding
    }
    ctx.fillText(line, x, y);
    y += lineHeight;
  });

  ctx.restore();
}

/**
 * Draw an image element on the canvas
 */
export function drawImageElement(
  ctx: CanvasRenderingContext2D,
  element: ImageElement,
  img: HTMLImageElement,
  offsetX: number = 0,
  offsetY: number = 0
): void {
  const posX = offsetX + element.position.x;
  const posY = offsetY + element.position.y;

  const centerX = posX + element.size.width / 2;
  const centerY = posY + element.size.height / 2;

  ctx.save();
  ctx.globalAlpha = element.opacity;
  ctx.translate(centerX, centerY);
  ctx.rotate((element.rotation * Math.PI) / 180);
  ctx.scale(element.scaleX, element.scaleY);
  ctx.translate(-centerX, -centerY);

  // Apply image filters
  ctx.filter = `grayscale(${element.grayscale}%) brightness(${element.brightness}%) contrast(${element.contrast}%) blur(${element.blur}px)`;

  ctx.drawImage(
    img,
    posX,
    posY,
    element.size.width,
    element.size.height
  );

  ctx.restore();
}

/**
 * Draw a group element on the canvas
 */
export function drawGroupElement(
  ctx: CanvasRenderingContext2D,
  element: GroupElement,
  allElements: CanvasElement[],
  imageMap: Map<string, HTMLImageElement>
): void {
  ctx.save();

  const groupCenterX = element.position.x + element.size.width / 2;
  const groupCenterY = element.position.y + element.size.height / 2;

  ctx.translate(groupCenterX, groupCenterY);
  ctx.rotate((element.rotation * Math.PI) / 180);
  ctx.scale(element.scaleX, element.scaleY);
  ctx.translate(-groupCenterX, -groupCenterY);

  // Draw each child element within the group
  element.childIds.forEach(childId => {
    const childElement = allElements.find(el => el.id === childId);
    if (!childElement) return;

    // Child position is relative to group position
    const childAbsX = element.position.x + childElement.position.x;
    const childAbsY = element.position.y + childElement.position.y;

    if (childElement.type === "text") {
      drawTextElement(ctx, childElement, element.position.x, element.position.y);
    } else if (childElement.type === "image") {
      const img = imageMap.get(childElement.id);
      if (img) {
        drawImageElement(ctx, childElement, img, element.position.x, element.position.y);
      }
    } else if (childElement.type === "shape") {
      const centerX = childAbsX + childElement.size.width / 2;
      const centerY = childAbsY + childElement.size.height / 2;

      ctx.save();
      ctx.globalAlpha = childElement.opacity;
      ctx.translate(centerX, centerY);
      ctx.rotate((childElement.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      // Draw shape at absolute position
      const shapeWithAbsPos: ShapeElement = {
        ...childElement,
        position: { x: childAbsX, y: childAbsY }
      };
      drawShape(ctx, shapeWithAbsPos);
      ctx.restore();
    }
  });

  ctx.restore();
}

/**
 * Load all images used in the canvas elements
 */
async function loadImages(elements: CanvasElement[]): Promise<Map<string, HTMLImageElement>> {
  const imageMap = new Map<string, HTMLImageElement>();
  const allImageElements = elements.filter((el) => el.type === "image") as ImageElement[];
  
  await Promise.all(
    allImageElements.map((element) => {
      return new Promise<void>((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          imageMap.set(element.id, img);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = element.src;
      });
    })
  );

  return imageMap;
}

/**
 * Export canvas elements to a PNG image file and trigger download.
 * Renders all elements to an offscreen canvas, then triggers a file download.
 * 
 * @param elements - Array of canvas elements to render
 * @param canvasSettings - Canvas settings including size and background color
 * @param projectName - Name used for the downloaded file
 * @param scale - Resolution multiplier (default 2 for high DPI)
 */
export async function exportCanvasToImage(
  elements: CanvasElement[],
  canvasSettings: CanvasSettings,
  projectName: string,
  scale: number = 2
): Promise<void> {
  const { width, height } = canvasSettings.canvasSize;
  const exportCanvas = document.createElement("canvas");
  
  // Create high-resolution canvas
  exportCanvas.width = width * scale;
  exportCanvas.height = height * scale;
  const ctx = exportCanvas.getContext("2d")!;
  
  // Scale the context to draw at higher resolution
  ctx.scale(scale, scale);
  
  // Enable high-quality image rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw background
  if (canvasSettings.backgroundType === "gradient" && canvasSettings.backgroundGradient) {
    let gradient;
    switch (canvasSettings.backgroundGradient.direction) {
      case "horizontal":
        gradient = ctx.createLinearGradient(0, 0, width, 0);
        break;
      case "vertical":
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        break;
      case "diagonal":
        gradient = ctx.createLinearGradient(0, 0, width, height);
        break;
    }
    gradient!.addColorStop(0, canvasSettings.backgroundGradient.startColor);
    gradient!.addColorStop(1, canvasSettings.backgroundGradient.endColor);
    ctx.fillStyle = gradient!;
  } else {
    ctx.fillStyle = canvasSettings.backgroundColor;
  }
  ctx.fillRect(0, 0, width, height);

  // Get IDs of elements that are children of groups
  const groupChildIds = new Set<string>();
  elements.forEach(el => {
    if (el.type === "group") {
      (el as GroupElement).childIds.forEach(id => groupChildIds.add(id));
    }
  });

  // Filter out group children from top-level rendering and sort by zIndex
  const sortedElements = [...elements]
    .filter(el => !groupChildIds.has(el.id))
    .sort((a, b) => a.zIndex - b.zIndex);
  
  // Load all images first
  const imageMap = await loadImages(elements);

  // Draw each element
  sortedElements.forEach((element) => {
    if (element.type === "text") {
      drawTextElement(ctx, element);
    } else if (element.type === "image") {
      const img = imageMap.get(element.id);
      if (img) {
        drawImageElement(ctx, element, img);
      }
    } else if (element.type === "shape") {
      const centerX = element.position.x + element.size.width / 2;
      const centerY = element.position.y + element.size.height / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.scale(element.scaleX, element.scaleY);
      ctx.translate(-centerX, -centerY);
      drawShape(ctx, element);
      ctx.restore();
    } else if (element.type === "group") {
      drawGroupElement(ctx, element, elements, imageMap);
    }
  });

  // Download the image
  const link = document.createElement("a");
  const resolution = scale > 1 ? `_${width * scale}x${height * scale}` : '';
  link.download = `${projectName.replace(/[^a-z0-9]/gi, '_')}${resolution}.png`;
  link.href = exportCanvas.toDataURL("image/png", 1.0);
  link.click();
}
