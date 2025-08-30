import React, { useEffect, useRef, useState } from 'react';

// Minimal fallback type for GPUCanvasContext if not present in lib
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUCanvasContext = { configure(o:any): void; getCurrentTexture(): { createView(): any } };

interface WebGPUStatus {
  supported: boolean;
  message: string;
  adapterInfo?: {
    name?: string;
    features?: string[];
  };
}

const initWebGPU = async (canvas: HTMLCanvasElement) => {
  if (!('gpu' in navigator)) {
    return { supported: false, message: 'WebGPU not supported in this browser' } as WebGPUStatus;
  }
  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) return { supported: false, message: 'No suitable GPU adapter found' };
    const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext | null;
  if (!context) return { supported: false, message: 'Failed to get WebGPU context' };

    const format = (navigator as any).gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: 'premultiplied' });

    // Simple triangle shader (WGSL)
    const shaderModule = device.createShaderModule({
      code: `@vertex fn vs_main(@builtin(vertex_index) VertexIndex : u32) -> @builtin(position) vec4f {\n        var pos = array<vec2f, 3>(\n            vec2f(0.0, 0.5),\n            vec2f(-0.5, -0.5),\n            vec2f(0.5, -0.5)\n        );\n        let xy = pos[VertexIndex];\n        return vec4f(xy, 0.0, 1.0);\n      }\n      @fragment fn fs_main() -> @location(0) vec4f {\n        return vec4f(1.0, 0.4, 0.1, 1.0);\n      }`,
    });

    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: { module: shaderModule, entryPoint: 'vs_main' },
      fragment: { module: shaderModule, entryPoint: 'fs_main', targets: [{ format }] },
      primitive: { topology: 'triangle-list' },
    });

    let frameId: number;
    const render = () => {
      const encoder = device.createCommandEncoder();
  const textureView = (context as GPUCanvasContext).getCurrentTexture().createView();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: textureView,
          clearValue: { r: 0.05, g: 0.05, b: 0.08, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        }],
      });
      pass.setPipeline(pipeline);
      pass.draw(3, 1, 0, 0);
      pass.end();
      device.queue.submit([encoder.finish()]);
      frameId = requestAnimationFrame(render);
    };
    render();
    return { supported: true, message: 'WebGPU initialized', adapterInfo: { name: adapter.name, features: Array.from(adapter.features || []) } } as WebGPUStatus;
  } catch (e: any) {
    return { supported: false, message: 'WebGPU init failed: ' + e?.message };
  }
};

export const WebGPUCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<WebGPUStatus>({ supported: true, message: 'Initializing...' });
  const [fps, setFps] = useState<number>(0);
  const lastFrameRef = useRef<number>(performance.now());
  const framesRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());

  useEffect(() => {
    let rafId: number;

    const measure = () => {
      const now = performance.now();
      framesRef.current += 1;
      if (now - lastFpsUpdateRef.current >= 500) { // update twice a second
        const delta = now - lastFpsUpdateRef.current;
        setFps(Math.round((framesRef.current * 1000) / delta));
        framesRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
      lastFrameRef.current = now;
      rafId = requestAnimationFrame(measure);
    };
    rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    let mounted = true;
    const canvas = canvasRef.current;
    const run = async () => {
      const res = await initWebGPU(canvas);
      if (!res.supported) {
        // Fallback: simple 2D spinning square
        const ctx = canvas.getContext('2d');
        if (ctx) {
          let angle = 0;
          const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(angle);
            ctx.fillStyle = '#ff7a1c';
            ctx.fillRect(-40, -40, 80, 80);
            ctx.restore();
            angle += 0.02;
            if (mounted) requestAnimationFrame(loop);
          };
          loop();
        }
      }
      if (mounted) setStatus(res);
    };
    run();

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
    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
    };
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
          Fallback 2D canvas running. Enable WebGPU (Chrome Canary flag --enable-unsafe-webgpu) for enhanced effects.
        </div>
      )}
    </div>
  );
};

export default WebGPUCanvas;
