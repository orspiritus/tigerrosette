// Simple CPU-driven particle system with optional WebGPU instanced rendering placeholder
export interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; maxLife: number;
}

export class ParticleSystem {
  particles: Particle[] = [];
  max: number;
  constructor(max = 500) { this.max = max; }

  spawnBurst(x: number, y: number, count = 40) {
    for (let i = 0; i < count && this.particles.length < this.max; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 70;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.8,
      });
    }
  }

  update(dt: number) {
    const g = 40;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life > p.maxLife) { this.particles.splice(i, 1); continue; }
      p.vy += g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  draw2D(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      const t = p.life / p.maxLife;
      const alpha = 1 - t;
      const size = 4 + 12 * (1 - t);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
      grad.addColorStop(0, `rgba(255,180,80,${alpha})`);
      grad.addColorStop(1, `rgba(255,80,0,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
