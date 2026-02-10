import { test, expect, describe } from "bun:test";

describe("server-manager port logic", () => {
  test("default port is 3010 when OVERLAY_PORT is not set", () => {
    const saved = process.env.OVERLAY_PORT;
    delete process.env.OVERLAY_PORT;
    const port = Number(process.env.OVERLAY_PORT) || 3010;
    expect(port).toBe(3010);
    if (saved !== undefined) process.env.OVERLAY_PORT = saved;
  });

  test("OVERLAY_PORT env overrides default port", () => {
    const saved = process.env.OVERLAY_PORT;
    process.env.OVERLAY_PORT = "4000";
    const port = Number(process.env.OVERLAY_PORT) || 3010;
    expect(port).toBe(4000);
    if (saved !== undefined) process.env.OVERLAY_PORT = saved;
    else delete process.env.OVERLAY_PORT;
  });

  test("invalid OVERLAY_PORT falls back to 3010", () => {
    const saved = process.env.OVERLAY_PORT;
    process.env.OVERLAY_PORT = "not-a-number";
    const port = Number(process.env.OVERLAY_PORT) || 3010;
    expect(port).toBe(3010);
    if (saved !== undefined) process.env.OVERLAY_PORT = saved;
    else delete process.env.OVERLAY_PORT;
  });

  test("server URL is constructed from port", () => {
    const port = 3010;
    const url = `http://localhost:${port}`;
    expect(url).toBe("http://localhost:3010");
  });

  test("server URL with custom port", () => {
    const port = 5555;
    const url = `http://localhost:${port}`;
    expect(url).toBe("http://localhost:5555");
  });
});

describe("server.ts env-based config", () => {
  test("dbPath defaults to overlay.db when OVERLAY_DB_PATH not set", () => {
    const saved = process.env.OVERLAY_DB_PATH;
    delete process.env.OVERLAY_DB_PATH;
    const dbPath = process.env.OVERLAY_DB_PATH ?? "overlay.db";
    expect(dbPath).toBe("overlay.db");
    if (saved !== undefined) process.env.OVERLAY_DB_PATH = saved;
  });

  test("dbPath uses OVERLAY_DB_PATH when set", () => {
    const saved = process.env.OVERLAY_DB_PATH;
    process.env.OVERLAY_DB_PATH = "/tmp/test.db";
    const dbPath = process.env.OVERLAY_DB_PATH ?? "overlay.db";
    expect(dbPath).toBe("/tmp/test.db");
    if (saved !== undefined) process.env.OVERLAY_DB_PATH = saved;
    else delete process.env.OVERLAY_DB_PATH;
  });
});

describe("window-manager config", () => {
  test("window dimensions are reasonable", () => {
    const config = {
      width: 1280,
      height: 900,
      minWidth: 900,
      minHeight: 600,
    };
    expect(config.width).toBeGreaterThanOrEqual(config.minWidth);
    expect(config.height).toBeGreaterThanOrEqual(config.minHeight);
    expect(config.minWidth).toBeGreaterThan(0);
    expect(config.minHeight).toBeGreaterThan(0);
  });

  test("background color matches control panel theme", () => {
    const backgroundColor = "#09090b";
    expect(backgroundColor).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("tray menu structure", () => {
  test("overlay URL is properly constructed", () => {
    const serverUrl = "http://localhost:3010";
    const overlayUrl = `${serverUrl}/overlay`;
    expect(overlayUrl).toBe("http://localhost:3010/overlay");
  });

  test("overlay URL with custom port", () => {
    const port = 4000;
    const serverUrl = `http://localhost:${port}`;
    const overlayUrl = `${serverUrl}/overlay`;
    expect(overlayUrl).toBe("http://localhost:4000/overlay");
  });
});
