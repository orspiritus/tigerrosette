// Get outlet image based on player level
export function getOutletImageByLevel(level: number): string {
  // We have 4 different outlet images (tigrrozetka_1.png to tigrrozetka_4.png)
  // Cycle through them based on level ranges
  
  const basePath = '/tigerrosette/';
  
  if (level <= 5) {
    return `${basePath}Media/Pictures/tigrrozetka_1.png`;
  } else if (level <= 10) {
    return `${basePath}Media/Pictures/tigrrozetka_2.png`;
  } else if (level <= 15) {
    return `${basePath}Media/Pictures/tigrrozetka_3.png`;
  } else {
    return `${basePath}Media/Pictures/tigrrozetka_4.png`;
  }
}
