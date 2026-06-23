import type { ChildProcessWithoutNullStreams } from "node:child_process";

export async function waitForServer(
  url: string,
  timeoutMs: number,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return true;
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      await new Promise((resolveRetry) => setTimeout(resolveRetry, 500));
    }
  }
  return false;
}

export function stopPreviewServer(
  previewProcess: ChildProcessWithoutNullStreams,
): Promise<void> {
  if (previewProcess.killed) return Promise.resolve();

  return new Promise((resolveStop) => {
    const timeout = setTimeout(resolveStop, 3_000);
    previewProcess.once("exit", () => {
      clearTimeout(timeout);
      resolveStop();
    });
    previewProcess.kill();
  });
}
