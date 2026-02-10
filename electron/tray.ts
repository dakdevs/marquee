import { Tray, Menu, nativeImage, clipboard, app } from "electron";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { getServerUrl } from "./server-manager.js";
import { showWindow } from "./window-manager.js";

let tray: Tray | null = null;

export function createTray(): Tray {
  const iconPath = join(__dirname, "..", "electron", "assets", "tray-icon.png");
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 18, height: 18 });
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip("Marquee");

  const overlayUrl = `${getServerUrl()}/overlay`;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Control Panel",
      click: () => showWindow(),
    },
    { type: "separator" },
    {
      label: `Overlay: ${overlayUrl}`,
      enabled: false,
    },
    {
      label: "Copy Overlay URL",
      click: () => clipboard.writeText(overlayUrl),
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    showWindow();
  });

  return tray;
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
