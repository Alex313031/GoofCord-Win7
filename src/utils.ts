import * as Os from "os";
import {app, dialog} from "electron";
import path from "path";
import {getConfig} from "./config";
import fs from "fs";
import fetch from 'node-fetch';
globalThis.fetch = fetch;

// Get the version value from the "package.json" file
export const packageVersion = require("../package.json").version;

export function addStyle(styleString: string) {
    const style = document.createElement("style");
    style.textContent = styleString;
    document.head.append(style);
}

export function addScript(scriptString: string) {
    const script = document.createElement("script");
    script.textContent = scriptString;
    document.body.append(script);
}

export function getVersion() {
    return packageVersion;
}

export function isDev() {
    return process.argv.some(arg => arg === "--dev" || arg === "-d");
}

export function getDisplayVersion() {
    if (!(app.getVersion() == packageVersion)) {
        if (app.getVersion() == process.versions.electron) {
            return `Dev Build (${packageVersion})`;
        } else {
            return `${packageVersion} [Modified]`;
        }
    } else {
        return packageVersion;
    }
}

export function getCustomIcon() {
    const customIconPath = getConfig("customIconPath");
    if (typeof customIconPath === "string" && customIconPath !== "") {
        return customIconPath;
    } else if (process.platform == "win32") {
        return path.join(__dirname, "/assets/gf_icon.ico");
    } else {
        return path.join(__dirname, "/assets/gf_icon.png");
    }
}

export function getTrayIcon() {
    const customIconPath = getConfig("customIconPath");
    if (typeof customIconPath === "string" && customIconPath !== "") {
        return customIconPath;
    } else if (process.platform == "win32") {
        return path.join(__dirname, "/assets/tray_icon.ico");
    } else {
        return path.join(__dirname, "/assets/tray_icon.png");
    }
}

export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout reached while fetching from "+url+". Check your internet connection")), timeout);
    });
    return await Promise.race([fetch(url, {signal: controller.signal, ...options}), timeoutPromise]);
}

export function isSemverLower(version1: string, version2: string): boolean {
    const v1Parts = version1.split(".").map(Number);
    const v2Parts = version2.split(".").map(Number);

    for (let i = 0; i < v1Parts.length; i++) {
        const v1Part = v1Parts[i];
        const v2Part = v2Parts[i];

        if (v1Part < v2Part) {
            return true;
        } else if (v1Part > v2Part) {
            return false;
        }
    }

    return false;
}

export async function tryWithFix(toDo: () => any, attemptFix: () => any, message: string) {
    try {
        await toDo();
    } catch (error) {
        console.error(message, error);
        await attemptFix();
        try {
            await toDo();
        } catch (error: any) {
            console.error(message, error);
            dialog.showErrorBox(message, error.toString());
        }
    }
}

export async function readOrCreateFolder(path: string) {
    try {
        return await fs.promises.readdir(path);
    } catch (e) {
        await fs.promises.mkdir(path, { recursive: true });
        return [];
    }
}

export function checkForPortableFolder() {
    const dataPath = path.join(path.dirname(app.getPath("exe")), "goofcord-data");
    if (fs.existsSync(dataPath) && fs.statSync(dataPath).isDirectory()) {
        console.log("Found goofcord-data folder. Running in portable mode.");
        app.setPath("userData", dataPath);
    }
}

// Get version info
export const appName = app.getName();
export const appVer = app.getVersion();
export const electronVer = process.versions.electron;
export const chromeVer = process.versions.chrome;
export const nodeVer = process.versions.node;
export const v8Ver = process.versions.v8;
// Globally export what OS we are on
export const isLinux = process.platform === "linux";
export const isWin = process.platform === "win32";
export const isMac = process.platform === "darwin";
let OSType: any;
if (isLinux) {
    OSType = "Linux";
} else if (isWin) {
    OSType = "Windows";
} else if (isMac) {
    OSType = "MacOS";
} else {
    OSType = "BSD";
}
export const currentOS = OSType;
export const archType = Os.arch();
