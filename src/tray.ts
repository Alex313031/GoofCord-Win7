import {app, Menu, dialog, nativeImage, Tray} from "electron";
import {mainWindow} from "./window";
import {getTrayIcon, getDisplayVersion} from "./utils";
import {createSettingsWindow} from "./settings/main";
import {
    appName,
    appVer,
    electronVer,
    chromeVer,
    nodeVer,
    v8Ver,
    isLinux,
    isWin,
    isMac,
    currentOS,
    archType
} from "./utils";

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
            label: "GoofCord " + getDisplayVersion(),
            icon: getTrayMenuIcon(),
            enabled: false
        },
        {
            type: "separator"
        },
        {
            label: "About",
            click() {
                const info = [
                    appName + " v" + appVer,
                    "",
                    "Electron : " + electronVer,
                    "Chromium : " + chromeVer,
                    "Node : " + nodeVer,
                    "V8 : " + v8Ver,
                    "OS : " + currentOS + " " + archType
                ];
                dialog.showMessageBox({
                    type: "info",
                    title: "About " + appName,
                    message: info.join("\n"),
                    buttons: ["Ok"]
                });
            }
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
    tray.setToolTip("GoofCord");
    tray.on("click", function () {
        mainWindow.show();
    });
}
