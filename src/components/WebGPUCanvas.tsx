import React, { useRef, useState, useEffect } from 'react';
import { WebGPUManager } from '../webgpu/WebGPUManager';
import { ParticleSystem } from '../webgpu/ParticleSystem';
import { generateLightning, drawLightning } from '../webgpu/LightningEffect';

interface WebGPUStatus { supported: boolean; message: string; adapterInfo?: { name?: string; features?: string[] } }

export const WebGPUCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<WebGPUStatus>({ supported: true, message: 'Initializing...' });
  const [fps, setFps] = useState(0);
  const framesRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const lastTimeRef = useRef(performance.now());
  const particleRef = useRef<ParticleSystem | null>(null);
  const lightningRef = useRef<{ segs: any[]; t: number } | null>(null);

  // Main animation / metrics loop (covers fallback rendering)
  useEffect(() => {
    let raf: number;
    const loop = () => {
      const now = performance.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      framesRef.current++;
      if (now - lastFpsUpdateRef.current > 500) {
        const delta = now - lastFpsUpdateRef.current;
        setFps(Math.round((framesRef.current * 1000) / delta));
        framesRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
      // Fallback effects when WebGPU unsupported
      const canvas = canvasRef.current;
      if (canvas && !status.supported) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (!particleRef.current) particleRef.current = new ParticleSystem(500);
          // spawn bursts
            if (Math.random() < 0.07) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.6;
            particleRef.current.spawnBurst(x, y, 20 + Math.random()*20);
            if (Math.random() < 0.35) {
              const lx = Math.random() * canvas.width;
              lightningRef.current = { segs: generateLightning(lx, 0, lx + (Math.random()-0.5)*140, canvas.height * (0.4+Math.random()*0.4)), t: 0 };
            }
          }
          particleRef.current.update(dt);
          ctx.fillStyle = '#090910';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          particleRef.current.draw2D(ctx);
          if (lightningRef.current) {
            lightningRef.current.t += dt * 3.2;
            const alpha = 1 - lightningRef.current.t;
            if (alpha > 0) drawLightning(ctx, lightningRef.current.segs, alpha); else lightningRef.current = null;
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status.supported]);

  // Init path (manager -> triangle fallback -> 2D fallback)
  useEffect(() => {
    if (!canvasRef.current) return;
    let mounted = true;
    const canvas = canvasRef.current;
    (async () => {
      const mgr = WebGPUManager.instance;
      const res = await mgr.init(canvas);
      if (res.ok) {
        if (mounted) setStatus({ supported: true, message: 'WebGPU ready', adapterInfo: { name: res.adapterName, features: res.features } });
        return;
      }
      // If manager failed, attempt inline minimal triangle (reuse old logic)
      const tri = await (async () => {
        if (!('gpu' in navigator)) return { supported: false, message: 'WebGPU not supported' };
        try {
          const adapter = await (navigator as any).gpu.requestAdapter();
          if (!adapter) return { supported: false, message: 'No adapter' };
          const device = await adapter.requestDevice();
          const ctx = canvas.getContext('webgpu') as any;
          if (!ctx) return { supported: false, message: 'No context' };
          const format = (navigator as any).gpu.getPreferredCanvasFormat();
          ctx.configure({ device, format, alphaMode: 'premultiplied' });
          const shader = device.createShaderModule({ code: `@vertex fn v(@builtin(vertex_index) i:u32)->@builtin(position) vec4f{var p=array<vec2f,3>(vec2f(0.0,0.6),vec2f(-0.6,-0.6),vec2f(0.6,-0.6));return vec4f(p[i],0,1);} @fragment fn f()->@location(0) vec4f{return vec4f(1,0.5,0.15,1);}` });
          const pipe = device.createRenderPipeline({ layout:'auto', vertex:{ module:shader, entryPoint:'v'}, fragment:{ module:shader, entryPoint:'f', targets:[{format}] }, primitive:{ topology:'triangle-list'} });
          const draw = () => {
            const enc = device.createCommandEncoder();
            const view = ctx.getCurrentTexture().createView();
            const pass = enc.beginRenderPass({ colorAttachments:[{ view, clearValue:{r:0.05,g:0.05,b:0.08,a:1}, loadOp:'clear', storeOp:'store'}]});
            pass.setPipeline(pipe); pass.draw(3); pass.end(); device.queue.submit([enc.finish()]);
            if (mounted && status.supported) requestAnimationFrame(draw); // Only continue if still marked supported
          };
          requestAnimationFrame(draw);
          return { supported: true, message: 'WebGPU (triangle)' } as WebGPUStatus;
        } catch (e:any) { return { supported:false, message:'Inline init failed: '+e?.message }; }
      })();
      if (mounted) setStatus(tri);
      if (!tri.supported) {
        // final fallback is handled by animation loop which sees supported=false
      }
    })();

    const handleResize = () => {
      if (!canvasRef.current) return;
      const parent = canvasRef.current.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = Math.min(300, Math.round(width * 0.75));
      canvasRef.current.width = width * window.devicePixelRatio;
      canvasRef.current.height = height * window.devicePixelRatio;
      canvasRef.current.style.width = width + 'px';
      canvasRef.current.style.height = height + 'px';
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => { mounted = false; window.removeEventListener('resize', handleResize); };
  }, []);

  return (
    <div style={{ border: '1px solid #333', padding: 8, borderRadius: 8, background: '#111', color: '#eee', fontFamily: 'monospace' }}>
      <div style={{ marginBottom: 6, fontSize: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span>WebGPU: {status.message}</span>
        <span>FPS: {fps}</span>
        {status.adapterInfo?.name && <span>GPU: {status.adapterInfo.name}</span>}
      </div>
      <canvas ref={canvasRef} width={400} height={300} style={{ width: '100%', display: 'block', borderRadius: 4 }} />
      {!status.supported && (
        <div style={{ color: '#f66', marginTop: 8, fontSize: 12 }}>
          Fallback particle + lightning (Canvas2D). Enable WebGPU for richer effects.
        </div>
      )}
    </div>
  );
};

export default WebGPUCanvas;
