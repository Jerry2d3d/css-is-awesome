// Main-thread handle on the compile worker. One worker per Playground mount;
// requests carry an id so a slow compile that finishes after a newer one
// is dropped instead of overwriting fresher output.
import type { CompileRequest, CompileResponse } from "./compile.worker";

export type CompileResult =
  | { ok: true; css: string; ms: number }
  | { ok: false; message: string; line: number | null; column: number | null };

export class PlaygroundCompiler {
  private worker: Worker;
  private seq = 0;
  private pending = new Map<number, (r: CompileResult) => void>();

  constructor(mapUrl: string) {
    this.worker = new Worker(new URL("./compile.worker.ts", import.meta.url), { type: "module" });
    this.worker.onmessage = (event: MessageEvent<CompileResponse>) => {
      const data = event.data;
      const resolve = this.pending.get(data.id);
      if (!resolve) return; // superseded — ignore
      this.pending.delete(data.id);
      resolve("css" in data ? { ok: true, css: data.css, ms: data.ms } : { ok: false, ...data.error });
    };
    this.worker.postMessage({ mapUrl });
  }

  /** Compile `scss`; any earlier still-pending request is abandoned. */
  compile(scss: string): Promise<CompileResult> {
    const id = ++this.seq;
    // Drop older waiters — their callers only ever want the latest result.
    this.pending.clear();
    const request: CompileRequest = { id, scss };
    return new Promise((resolve) => {
      this.pending.set(id, resolve);
      this.worker.postMessage(request);
    });
  }

  dispose(): void {
    this.pending.clear();
    this.worker.terminate();
  }
}
