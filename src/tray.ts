import {app, Menu, nativeImage, Tray} from "electron";
import {mainWindow} from "./window";
import {getTrayIcon, getDisplayVersion} from "./utils";
import {createSettingsWindow} from "./settings/main";

export let tray: Tray;
export async function createTray() {
    const trayImage = nativeImage.createFromPath(getTrayIcon());

    // This is maybe unnecessary, but I can't test it so it stays
    const getTrayMenuIcon = () => {
        if (process.platform == "win32") {
            return trayImage.resize({height: 16});
        } else if (process.platform == "darwin") {
            return trayImage.resize({height: 22});
        } else if (process.platform == "linux") {
            return trayImage.resize({height: 20});
        } else {
            return trayImage;
        }
    };

    tray = new Tray(getTrayMenuIcon());

    const contextMenu = Menu.buildFromTemplate([
        {
            label: "GoofCord",
            icon: getTrayMenuIcon(),
            enabled: false
        },
        {
            type: "separator"
        },
        {
            label: "Open GoofCord",
            click: function () {
                mainWindow.show();
            }
        },
        {
            label: "Open Settings",
            click: function () {
                createSettingsWindow();
            }
        },
        {
            type: "separator"
        },
        {
            label: "Quit GoofCord",
            click: function () {
                app.quit();
            }
        }
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip("GoofCord " + getDisplayVersion());
    tray.on("click", function () {
        mainWindow.show();
    });
}
