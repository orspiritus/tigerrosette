// Central WebGPU manager: adapter/device/context setup, feature detection, fallback chain
// Minimal fallbacks for WebGPU types (ignored if real types exist)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUDevice = any; // fallback
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUCanvasContext = { configure(o:any): void; getCurrentTexture(): { createView(): any } };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUTextureFormat = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GPUAdapter = { requestDevice(): Promise<GPUDevice>; name?: string; features?: Iterable<string> };
export interface WebGPUInitResult {
  ok: boolean;
  reason?: string;
  adapterName?: string;
  features?: string[];
  device?: GPUDevice;
  context?: GPUCanvasContext;
  format?: GPUTextureFormat;
}

export class WebGPUManager {
  private static _instance: WebGPUManager | null = null;
  private device: GPUDevice | null = null;
  private context: GPUCanvasContext | null = null;
  private format: GPUTextureFormat | null = null;
  private adapterName: string | undefined;
  private features: string[] = [];
  private initialized = false;

  static get instance() {
    if (!this._instance) this._instance = new WebGPUManager();
    return this._instance;
  }

  async init(canvas: HTMLCanvasElement): Promise<WebGPUInitResult> {
    if (this.initialized) {
      return { ok: !!this.device, adapterName: this.adapterName, features: this.features, device: this.device!, context: this.context!, format: this.format! };
    }
    if (!(navigator as any).gpu) {
      return { ok: false, reason: 'WebGPU not supported' };
    }
    try {
      const adapter: GPUAdapter | null = await (navigator as any).gpu.requestAdapter();
      if (!adapter) return { ok: false, reason: 'No adapter' };
      const device = await adapter.requestDevice();
      const context = canvas.getContext('webgpu') as GPUCanvasContext | null;
      if (!context) return { ok: false, reason: 'No context' };
      const format = (navigator as any).gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: 'premultiplied' });
      this.device = device;
      this.context = context;
      this.format = format;
      this.adapterName = (adapter as any).name;
      this.features = Array.from((adapter as any).features || []);
      this.initialized = true;
      return { ok: true, adapterName: this.adapterName, features: this.features, device, context, format };
    } catch (e: any) {
      return { ok: false, reason: e?.message || 'init error' };
    }
  }

  getDevice() { return this.device; }
  getContext() { return this.context; }
  getFormat() { return this.format; }
  getInfo() { return { adapterName: this.adapterName, features: this.features }; }
}
