import { spawn, type ChildProcess } from "node:child_process";
import { join } from "node:path";
import { app } from "electron";

let serverProcess: ChildProcess | null = null;

export function getServerPort(): number {
  return Number(process.env.OVERLAY_PORT) || 3010;
}

export function getServerUrl(): string {
  return `http://localhost:${getServerPort()}`;
}

export function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const serverScript = join(app.getAppPath(), "server.ts");
    const port = getServerPort();
    const dbPath =
      process.env.OVERLAY_DB_PATH ??
      join(app.getPath("userData"), "overlay.db");

    serverProcess = spawn("bun", ["run", serverScript], {
      env: {
        ...process.env,
        OVERLAY_DB_PATH: dbPath,
        OVERLAY_PORT: String(port),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    serverProcess.stdout?.on("data", (data: Buffer) => {
      console.log(`[server] ${data.toString().trim()}`);
    });

    serverProcess.stderr?.on("data", (data: Buffer) => {
      console.error(`[server] ${data.toString().trim()}`);
    });

    serverProcess.on("error", (err) => {
      console.error("Failed to start Bun server:", err);
      reject(err);
    });

    serverProcess.on("exit", (code) => {
      console.log(`Bun server exited with code ${code}`);
      serverProcess = null;
    });

    pollUntilReady(`http://localhost:${port}/`, 30000, 200)
      .then(resolve)
      .catch(reject);
  });
}

export function stopServer(): void {
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
    serverProcess = null;
  }
}

export function isServerRunning(): boolean {
  return serverProcess !== null && serverProcess.exitCode === null;
}

async function pollUntilReady(
  url: string,
  timeoutMs: number,
  intervalMs: number,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status === 200 || res.status === 301 || res.status === 302) {
        return;
      }
    } catch {
      // server not ready yet
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}
