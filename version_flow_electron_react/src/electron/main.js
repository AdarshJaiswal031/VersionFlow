/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { app, BrowserWindow, ipcMain, shell, Menu, dialog } from "electron";
import path from "path";
import { isDev } from "./utils.js";
import express from "express";
import http from "http";
import axios from "axios";
import keytar from "keytar";
import { fileURLToPath } from "url";
import { diff_match_patch } from "diff-match-patch";
import fs from "fs";
import { diffLines } from "diff";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dmp = new diff_match_patch();

const SERVICE_NAME = "VersionFlowApp";
const ACCOUNT_NAME = "jwt_token";
const ACCOUNT_NAME_REFRESH = "jwt_refresh_token";
const VERSIONS_DIR = path.join(__dirname, ".versions");
let mainWindow;
async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        // frame: false,
        // titleBarStyle: "hidden", // Keeps the system buttons
        // titleBarOverlay: {
        //     color: "#1A212A", // Background color of the title bar
        //     symbolColor: "white", // Color of the close/minimize/maximize buttons
        //     height: 45, // Adjust height as needed
        // },
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        },
    });
    // Menu.setApplicationMenu(null)
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5173/");
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
    }
    if (!fs.existsSync(VERSIONS_DIR)) {
        fs.mkdirSync(VERSIONS_DIR);
    }
    // checkJWTToken();
}

app.whenReady().then(() => {
    createWindow();

    ipcMain.on("oauth-start", () => {
        console.log("oauth-start inside main");
        const authUrl = "http://localhost:8082/oauth2/authorization/google";
        shell.openExternal(authUrl);
    });

    const expressApp = express();

    expressApp.get("/oauth2/callback", async (req, res) => {
        const code = req.query.code;

        try {
            const response = await axios.get(
                "http://localhost:8082/auth/google/callback",
                {
                    params: { code },
                }
            );

            const token = response.data.accessToken;
            const refreshToken = response.data.refreshToken;

            if (token && refreshToken) {
                try {
                    await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
                    await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME_REFRESH);

                    await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, token);
                    await keytar.setPassword(
                        SERVICE_NAME,
                        ACCOUNT_NAME_REFRESH,
                        refreshToken
                    );

                    await checkJWTToken();
                } catch (error) {
                    console.error("Failed to save tokens:", error);
                }
            }

            res.send(
                "<h2>✅ Authentication Successful. You can close this tab.</h2>"
            );
        } catch (error) {
            console.error("OAuth Callback Error:");
            res.send("<h2>❌ Authentication Failed. Please try again.</h2>");
        }
    });

    //---- File Editor
    ipcMain.on("open-file", async (event) => {
        const { filePaths } = await dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [
                {
                    name: "Text Files",
                    extensions: ["txt", "js", "html", "java", "json", "md", "css"],
                },
            ],
        });

        if (filePaths.length > 0) {
            const content = fs.readFileSync(filePaths[0], "utf-8");
            event.sender.send("open-file", { path: filePaths[0], content });
        } else {
            event.sender.send("open-file", null);
        }
    });

    ipcMain.on("save-file", async (event, { filePath, content }) => {
        if (filePath) {
            // ✅ Now it's correct
            fs.writeFile(filePath, content, "utf-8", () => {
                event.sender.send("save-file", { success: true, path: filePath });
            });
        } else {
            const { filePath: newFilePath } = await dialog.showSaveDialog({
                filters: [
                    {
                        name: "Text Files",
                        extensions: ["txt", "js", "html", "java", "json", "md", "css"],
                    },
                ],
            });

            if (newFilePath) {
                fs.writeFileSync(newFilePath, content, "utf-8", () => {
                    event.sender.send("save-file", { success: true, path: newFilePath });
                });
            } else {
                event.sender.send("save-file", { success: false });
            }
        }
    });

    ipcMain.on("recreate-version", (event, { filePath, versionNumber }) => {
        var recreatedContent = regenerateFile(filePath, versionNumber);
        // console.log(recreatedContent);
        event.reply("recreate-version", { success: true, recreatedContent });
    });

    ipcMain.on("get-versions", (event, { filePath }) => {
        const versions = getVersionHistory(filePath);
        event.reply("get-versions", { success: true, versions });
    });
    ipcMain.on("commit-file", (event, { filePath, content }) => {
        console.log("Received commit request:", { filePath, content });

        if (!filePath || typeof content !== "string") {
            console.error("Invalid commit data:", { filePath, content });
            return;
        }

        const versionFile = filePath.replace(/[^a-zA-Z0-9]/g, "_") + ".json";
        const versionPath = path.join(VERSIONS_DIR, versionFile);

        let previousContent = "";
        let versionHistory = [];

        // 🛠️ **Read previous versions if they exist**
        if (fs.existsSync(versionPath)) {
            try {
                versionHistory = JSON.parse(fs.readFileSync(versionPath, "utf-8"));

                if (Array.isArray(versionHistory) && versionHistory.length > 0) {
                    // Reconstruct previous content from stored patches
                    previousContent = versionHistory.reduce((acc, entry) => {
                        entry.patches.forEach((patchStr) => {
                            const patches = dmp.patch_fromText(patchStr);
                            acc = dmp.patch_apply(patches, acc)[0]; // Apply patch
                        });
                        return acc;
                    }, "");
                }
            } catch (error) {
                console.error("Error reading previous version:", error);
            }
        }

        previousContent = previousContent.replace(/\r\n/g, "\n");
        content = content.replace(/\r\n/g, "\n");

        // 🔍 **Compute the Diff using `diff-match-patch`**
        const diffs = dmp.diff_main(previousContent, content);
        dmp.diff_cleanupSemantic(diffs);

        // 📝 **Convert diff to patch format**
        const patches = dmp.patch_make(previousContent, diffs);
        const patchText = dmp.patch_toText(patches);

        // **Store only the patches**
        const newVersionEntry = {
            timestamp: Date.now(),
            patches: [patchText], // Storing as text to keep it compact
        };

        versionHistory.push(newVersionEntry);
        fs.writeFileSync(
            versionPath,
            JSON.stringify(versionHistory, null, 2),
            "utf-8"
        );

        console.log("File committed successfully!");

        event.reply("commit-success", { success: true, versionPath });
    });

    http.createServer(expressApp).listen(3000, () => {
        console.log("OAuth listener running on http://localhost:3000");
    });
});

function getVersionFilePath(filePath) {
    const versionFile = filePath.replace(/[^a-zA-Z0-9]/g, "_") + ".json";
    const versionPath = path.join(VERSIONS_DIR, versionFile);
    return versionPath
}

function regenerateFile(filePath, versionNumber) {
    const versionPath = getVersionFilePath(filePath);

    if (!fs.existsSync(versionPath)) {
        console.error("Version file not found:", versionPath);
        return "";
    }

    const versionHistory = JSON.parse(fs.readFileSync(versionPath, "utf-8"));

    if (versionNumber < 1 || versionNumber > versionHistory.length) {
        console.error("Invalid version number. Available range: 1 -", versionHistory.length);
        return "";
    }

    let regeneratedContent = "";

    for (let i = 0; i < versionNumber; i++) {
        versionHistory[i].patches.forEach(patchStr => {
            const patches = dmp.patch_fromText(patchStr);
            regeneratedContent = dmp.patch_apply(patches, regeneratedContent)[0];
        });
    }

    return regeneratedContent;
}

async function checkJWTToken() {
    const token = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);

    if (token) {
        try {
            const response = await axios.get("http://localhost:8082/user", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                console.log("✅ Access token is valid");
                mainWindow.webContents.send("oauth-success", response.data);
            } else if (response.status === 401) {
                console.log("⚠️ Access token expired. Attempting refresh...");
                await checkRefreshToken();
            } else {
                console.log("JWT verification failed:");
                await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("⚠️ No JWT token found. Please login.");
    }
}

async function checkRefreshToken() {
    const refreshToken = await keytar.getPassword(
        SERVICE_NAME,
        ACCOUNT_NAME_REFRESH
    );

    if (refreshToken) {
        try {
            const response = await axios.post("http://localhost:8082/auth/refresh", {
                refreshToken: refreshToken,
            });

            const newAccessToken = response.data.accessToken;
            const newRefreshToken = response.data.refreshToken;

            await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, newAccessToken);
            await keytar.setPassword(
                SERVICE_NAME,
                ACCOUNT_NAME_REFRESH,
                newRefreshToken
            );

            console.log("🔄 Access token refreshed successfully");

            mainWindow.webContents.send("oauth-success", response.data);
        } catch (error) {
            console.log(
                "❌ Refresh token failed:",
                error.response?.data || error.message
            );
            await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
            await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME_REFRESH);
        }
    } else {
        console.log("⚠️ No refresh token found. Please login again.");
    }
}

function getVersionHistory(filePath) {
    const versionPath = getVersionFilePath(filePath);

    if (!fs.existsSync(versionPath)) {
        console.error("Version file not found:", versionPath);
        return [];
    }

    const versionHistory = JSON.parse(fs.readFileSync(versionPath, "utf-8"));

    return versionHistory.map((entry, index) => ({
        version: (index + 1).toString(),
        time: new Date(entry.timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }),
        msg: "default",
    }));
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
