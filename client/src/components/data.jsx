// --- 1. Brain Outline Path ---
// NOTE: You will need to replace this placeholder path with a real SVG path 
// of a brain outline. You can get this from a vector editor or a free SVG icon.
export const brainOutlinePath = "M 10 50 C 50 10 100 10 150 50 C 180 80 180 120 150 150 C 100 180 50 180 10 150 Z";

// --- 2. Neural Node Data ---
// x and y are coordinates scaled to 0-100 for easy relative positioning
export const neuralData = [
  // Frontal Lobe area (Blue/Cyan)
  { id: 1, x: 25, y: 35, color: 'hsl(190, 80%, 60%)', connections: [2, 7] },
  { id: 2, x: 40, y: 30, color: 'hsl(170, 80%, 60%)', connections: [1, 3, 5] },
  
  // Temporal/Parietal Lobe area (Green/Yellow)
  { id: 3, x: 55, y: 35, color: 'hsl(120, 80%, 60%)', connections: [2, 4] },
  { id: 4, x: 70, y: 45, color: 'hsl(80, 80%, 60%)', connections: [3, 5, 8] },
  
  // Occipital Lobe area (Orange/Red)
  { id: 5, x: 50, y: 55, color: 'hsl(40, 80%, 60%)', connections: [2, 4, 6] },
  { id: 6, x: 65, y: 65, color: 'hsl(10, 80%, 60%)', connections: [5, 9] },
  
  // Base/Limbic System (Purple/Magenta)
  { id: 7, x: 30, y: 60, color: 'hsl(280, 80%, 60%)', connections: [1, 8] },
  { id: 8, x: 55, y: 75, color: 'hsl(320, 80%, 60%)', connections: [4, 7, 9] },
  { id: 9, x: 75, y: 70, color: 'hsl(340, 80%, 60%)', connections: [6, 8] },
];