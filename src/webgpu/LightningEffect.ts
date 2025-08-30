// Procedural lightning bolt generation (2D fallback) - can be ported to WebGPU later
export interface Segment { x1:number; y1:number; x2:number; y2:number; }

export function generateLightning(x1:number, y1:number, x2:number, y2:number, displace = 90, min = 4): Segment[] {
  const segments: Segment[] = [];
  const recurse = (ax:number, ay:number, bx:number, by:number, disp:number) => {
    if (disp < min) { segments.push({ x1:ax, y1:ay, x2:bx, y2:by }); return; }
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const offset = (Math.random() - 0.5) * disp;
    const nx = mx + (by - ay) * 0.2 * (offset / disp);
    const ny = my - (bx - ax) * 0.2 * (offset / disp);
    recurse(ax, ay, nx, ny, disp / 2);
    recurse(nx, ny, bx, by, disp / 2);
  };
  recurse(x1, y1, x2, y2, displace);
  return segments;
}

export function drawLightning(ctx: CanvasRenderingContext2D, segs: Segment[], alpha = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(255,200,100,${alpha})`;
  ctx.beginPath();
  for (const s of segs) ctx.lineTo(s.x1, s.y1), ctx.lineTo(s.x2, s.y2);
  ctx.stroke();
  ctx.restore();
}
