import {app, BrowserWindow, clipboard, ipcMain, shell} from "electron";
import {getConfig, getConfigLocation, getDisplayVersion, getVersion, setConfigBulk, Settings} from "../utils";
import path from "path";
import os from "os";
import fs from "fs";

let settingsWindow: BrowserWindow;
let instance: number = 0;
const userDataPath = app.getPath("userData");
const storagePath = path.join(userDataPath, "/storage/");
const scriptsPath = path.join(userDataPath, "/scripts/");
const extensionsPath = path.join(userDataPath, "/extensions/");

export function createSettingsWindow() {
    console.log("Creating a settings window.");
    instance = instance + 1;
    if (instance > 1) {
        if (settingsWindow) {
            settingsWindow.show();
            settingsWindow.restore();
        }
    } else {
        settingsWindow = new BrowserWindow({
            width: 660,
            height: 670,
            title: `GoofCord Settings | Version: ${getDisplayVersion()}`,
            darkTheme: true,
            frame: true,
            icon: path.join(__dirname, "../", "/assets/gf_icon.png"),
            backgroundColor: "#2f3136",
            autoHideMenuBar: true,
            webPreferences: {
                sandbox: false,
                preload: path.join(__dirname, "preload.js"),
                nodeIntegrationInSubFrames: false,
                webSecurity: true,
                plugins: false
            }
        });

        async function settingsLoadPage() {
            await settingsWindow.loadURL(`file://${__dirname}/settings.html`);
        }

        ipcMain.on("saveSettings", (event, args: Settings) => {
            console.log(args);
            setConfigBulk(args);
        });
        ipcMain.on("openStorageFolder", async () => {
            await shell.openPath(storagePath);
        });
        ipcMain.on("openScriptsFolder", async () => {
            await shell.openPath(scriptsPath);
        });
        ipcMain.on("openExtensionsFolder", async () => {
            await shell.openPath(extensionsPath);
        });
        ipcMain.on("openCrashesFolder", async () => {
            await shell.openPath(path.join(app.getPath("temp"), app.getName() + " Crashes"));
        });
        ipcMain.on("crash", async () => {
            process.crash();
        });
        ipcMain.handle("getSetting", (event, toGet: string) => {
            return getConfig(toGet);
        });
        ipcMain.on("copyDebugInfo", () => {
            let settingsFileContent = fs.readFileSync(getConfigLocation(), "utf-8");
            clipboard.writeText(
                "**OS:** " +
                os.platform() +
                " " +
                os.version() +
                "\n**Architecture:** " +
                os.arch() +
                "\n**GoofCord version:** " +
                getVersion() +
                "\n**Electron version:** " +
                process.versions.electron +
                "\n`" +
                settingsFileContent +
                "`"
            );
        });
        settingsWindow.webContents.setWindowOpenHandler(({url}) => {
            shell.openExternal(url);
            return {action: "deny"};
        });
        settingsLoadPage();
        settingsWindow.on("close", () => {
            ipcMain.removeHandler("getSetting");
            ipcMain.removeAllListeners("saveSettings");
            instance = 0;
        });
    }
}
