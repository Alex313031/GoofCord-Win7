// This file contains everything that uses session.defaultSession.webRequest
import {mainWindow} from "../window";
import {session} from "electron";
import {getConfig, getDefaultValue} from "../config";

function getConfigOrDefault(key: string): string[] {
    return getConfig("customFirewallRules") ? getConfig(key) : getDefaultValue(key);
}

export async function initializeFirewall() {
    if (!getConfig("firewall")) return;
    const blocklist = getConfigOrDefault("blocklist");
    const blockedStrings = getConfigOrDefault("blockedStrings");
    const allowedStrings = getConfigOrDefault("allowedStrings");

    // If blocklist is not empty
    if (blocklist[0] !== "") {
        // Blocking URLs. This list works in tandem with "blockedStrings" list.
        session.defaultSession.webRequest.onBeforeRequest(
            {
                urls: blocklist
            },
            (_, callback) => callback({cancel: true})
        );
    }

    /* If the request url includes any of those, it is blocked.
        * By doing so, we can match multiple unwanted URLs, making the blocklist cleaner and more efficient */
    const blockRegex = new RegExp(blockedStrings.join("|"), "i"); // 'i' flag for case-insensitive matching
    const allowRegex = new RegExp(allowedStrings.join("|"), "i");

    session.defaultSession.webRequest.onBeforeSendHeaders({urls: ["<all_urls>"]}, (details, callback) => {
        if (details.resourceType != "xhr") { // Filtering out non-xhr requests for performance
            callback({cancel: false});
            return;
        }

        if (blockRegex.test(details.url)) {
            if (!allowRegex.test(details.url)) {
                callback({cancel: true});
                return;
            }
        }
        callback({
            cancel: false,
            requestHeaders: {
                ...details.requestHeaders,
                "User-Agent": mainWindow.webContents.userAgent
            }
        });
    });

    console.log("Firewall initialized");
}

export async function unstrictCSP() {
    console.log("Setting up CSP unstricter...");

    session.defaultSession.webRequest.onHeadersReceived(({responseHeaders, resourceType}, done) => {
        if (!responseHeaders) return done({});

        if (resourceType === "mainFrame") {
            // This behaves very strangely. For some, everything works without deleting CSP,
            // for some "CSP" works, for some "csp"
            delete responseHeaders["Content-Security-Policy"];
            delete responseHeaders["content-security-policy"];
        } else if (resourceType === "stylesheet") {
            // Fix hosts that don't properly set the css content type, such as
            // raw.githubusercontent.com
            responseHeaders["content-type"] = ["text/css"];
        }
        done({responseHeaders});
    });
}
