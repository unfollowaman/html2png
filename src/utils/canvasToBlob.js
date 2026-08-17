export async function renderImageToPngBlobUrl(img, intrinsicWidth, intrinsicHeight, errorMessage, fillStyle = null) {
  const DPI_SCALE = 2; // Matches Mermaid pipeline
  const finalWidth = intrinsicWidth * DPI_SCALE;
  const finalHeight = intrinsicHeight * DPI_SCALE;

  if (finalWidth * finalHeight > 200000000) {
    throw new Error(errorMessage);
  }

  const canvas = document.createElement('canvas');
  canvas.width = finalWidth;
  canvas.height = finalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context.');

  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fillRect(0, 0, finalWidth, finalHeight);
  }
  ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

  const pngBlob = await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create PNG blob.'));
      }
    }, 'image/png');
  });

  const resultObjectUrl = URL.createObjectURL(pngBlob);
  return { resultObjectUrl, finalWidth, finalHeight };
}
