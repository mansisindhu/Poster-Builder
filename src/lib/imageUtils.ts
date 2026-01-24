/**
 * Load an image file and get its data URL and dimensions
 */
export function loadImageFile(
  file: File,
  onLoad: (src: string, name: string, width: number, height: number) => void
): void {
  const reader = new FileReader();
  reader.onload = (event) => {
    const src = event.target?.result as string;
    const img = new Image();
    img.onload = () => {
      onLoad(src, file.name, img.width, img.height);
    };
    img.src = src;
  };
  reader.readAsDataURL(file);
}

/**
 * Validate if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Get image dimensions from a data URL
 */
export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = src;
  });
}
