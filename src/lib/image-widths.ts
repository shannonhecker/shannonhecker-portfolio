/** Retain enough source detail for large/Retina screens without upscaling. */
export function imageWidths(sourceWidth: number) {
  const largest = Math.min(sourceWidth, 3200);
  return [...new Set([400, 640, 800, 960, 1280, 1600, 2000, 2560, largest].filter(width => width <= largest))].sort((a,b)=>a-b);
}
