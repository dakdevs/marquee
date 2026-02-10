import { app } from "electron";
import { startServer, stopServer } from "./server-manager.js";
import { createWindow, getMainWindow } from "./window-manager.js";
import { createTray, destroyTray } from "./tray.js";

let isQuitting = false;

app.whenReady().then(async () => {
  try {
    await startServer();
  } catch (err) {
    console.error("Failed to start server:", err);
    app.quit();
    return;
  }

  createWindow();
  createTray();

  app.on("activate", () => {
    if (getMainWindow() === null) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  isQuitting = true;
  destroyTray();
  stopServer();
});

// On macOS, keep running in tray on window close
app.on("browser-window-created", (_event, window) => {
  window.on("close", (event) => {
    if (process.platform === "darwin" && !isQuitting) {
      event.preventDefault();
      window.hide();
    }
  });
});
