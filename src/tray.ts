import {app, Menu, nativeImage, Tray} from "electron";
import {mainWindow} from "./window";
import {getCustomIcon, getDisplayVersion} from "./utils";
import {createSettingsWindow} from "./settings/main";

export let tray: Tray;
export async function createTray() {

    // This is maybe unnecessary, but I can't test it so it stays
    const getTrayMenuIcon = () => {
        let trayImage = nativeImage.createFromPath(getCustomIcon());
        if (process.platform == "darwin") {
            return trayImage.resize({height: 22});
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
