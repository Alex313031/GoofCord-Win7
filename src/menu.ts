import {app, BrowserWindow, clipboard, dialog, Menu, shell} from "electron";
import {mainWindow} from "./window";
import {createSettingsWindow} from "./settings/main";
import {cycleThroughPasswords} from "./modules/messageEncryption";
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
import contextMenu from "electron-context-menu";

interface Pasteable {
    paste(): void;
}
function paste(contents: Pasteable) {
    const contentTypes = clipboard.availableFormats().toString();
    // Workaround: fix pasting the images.
    if (contentTypes.includes("image/") && contentTypes.includes("text/html")) {
        clipboard.writeImage(clipboard.readImage());
    }
    contents.paste();
}

export async function setMenu() {
    setApplicationMenu();
    setContextMenu();
}

export async function setApplicationMenu() {
    const userDataDir = app.getPath('userData');
    const template: Electron.MenuItemConstructorOptions[] = [
        {
            label: "GoofCord",
            submenu: [
                {label: "About GoofCord", role: "about", visible: isMac ? true : false},
                {
                    label: "Open settings",
                    accelerator: "CmdOrCtrl+Shift+'",
                    click: function () {
                        createSettingsWindow();
                    }
                },
                {
                    label: "Cycle through passwords",
                    accelerator: "F9",
                    click: async function () {
                        cycleThroughPasswords();
                    }
                },
                {
                    label: "Reload",
                    accelerator: "CmdOrCtrl+R",
                    click: async function () {
                        mainWindow.reload();
                    }
                },
                {
                    label: "Restart",
                    accelerator: "CmdOrCtrl+Alt+R",
                    click: async function () {
                        app.relaunch();
                        app.quit();
                    }
                },
                {
                    label: "Fullscreen",
                    role: "togglefullscreen"
                },
                {
                    label: "Quit",
                    accelerator: "CmdOrCtrl+Q",
                    click: function () {
                        app.quit();
                    }
                },
            ]
        },
        {
            role: "editMenu",
            submenu: [
                {role: "undo"},
                {role: "redo"},
                {type: "separator"},
                {role: "cut"},
                {role: "copy"},
                {
                    label: "Paste",
                    role: "paste",
                    accelerator: "CmdOrCtrl+V",
                    click() {
                        paste(mainWindow.webContents);
                    }
                },
                {role: "delete"},
                {type: "separator"},
                {role: "selectAll"}
            ]
        },
        {role: "viewMenu"},
        {role: "windowMenu"},
        {
            label: "Developer",
            submenu: [
                {
                    label: "Reload F5",
                    accelerator: "F5",
                    visible: false,
                    acceleratorWorksWhenHidden: true,
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.reload();
                    }
                },
                {
                    label: 'Open User Data Dir',
                    click() {
                        shell.openPath(userDataDir);
                    }
                },
                {
                    label: "Open Electron DevTools",
                    accelerator: isMac ? "Cmd+Shift+F12" : "F12",
                    click(item, focusedWindow) {
                        // @ts-expect-error
                        BrowserWindow.getFocusedWindow().openDevTools({mode: "detach"});
                    }
                },
                {type: "separator"},
                {
                    label: "Open chrome://gpu",
                    accelerator: "CmdorCtrl+Alt+G",
                    click() {
                        const gpuWindow = new BrowserWindow({
                            width: 900,
                            height: 700,
                            useContentSize: true,
                            title: "GPU Internals"
                        });
                        gpuWindow.loadURL("chrome://gpu");
                    }
                },
                {
                    label: "Open chrome://process-internals",
                    click() {
                        const procsWindow = new BrowserWindow({
                            width: 900,
                            height: 700,
                            useContentSize: true,
                            title: "Process Model Internals"
                        });
                        procsWindow.loadURL("chrome://process-internals");
                    }
                }
            ]
        },
        {
            role: "help",
            label: "About",
            submenu: [
                {label: appName + " v" + appVer, enabled: false},
                {
                    label: "File an Issue",
                    click() {
                        shell.openExternal("https://github.com/Alex313031/GoofCord-Win7/issues/new/choose");
                    }
                },
                {
                    label: "About",
                    accelerator: "CmdorCtrl+Alt+A",
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
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

export function setContextMenu() {
    contextMenu({
        showSelectAll: true,
        showSaveImageAs: true,
        showCopyImage: true,
        showCopyImageAddress: true,
        showCopyLink: true,
        showSaveLinkAs: true,
        showInspectElement: true,
        showSearchWithGoogle: true,
        showSearchWithDuckDuckGo: true,
        prepend: (_defaultActions, parameters) => [
            {
                label: 'Open Link in New Window',
                // Only show it when right-clicking a link
                visible: parameters.linkURL.trim().length > 0,
                click: () => {
                    const toURL = parameters.linkURL;
                    const linkWin = new BrowserWindow({
                        title: 'New Window',
                        width: 1024,
                        height: 700,
                        useContentSize: true,
                        darkTheme: true,
                        webPreferences: {
                            nodeIntegration: false,
                            nodeIntegrationInWorker: false,
                            experimentalFeatures: true,
                            devTools: true
                        }
                    });
                    linkWin.loadURL(toURL);
                    console.log('Opened Link in New Window');
                }
            }
        ]
    });
}
