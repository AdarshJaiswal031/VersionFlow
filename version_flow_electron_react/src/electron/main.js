/* eslint-disable no-undef */
import { app, BrowserWindow, ipcMain, shell, Menu, dialog } from "electron";
import path from "path";
import { isDev } from "./utils.js";
import express from "express";
import http from "http";
import axios from "axios";
import keytar from "keytar";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVICE_NAME = "VersionFlowApp";
const ACCOUNT_NAME = "jwt_token";
const ACCOUNT_NAME_REFRESH = "jwt_refresh_token";
let mainWindow;
async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        titleBarStyle: "hidden", // Keeps the system buttons
        titleBarOverlay: {
            color: "#1A212A", // Background color of the title bar
            symbolColor: "white", // Color of the close/minimize/maximize buttons
            height: 45, // Adjust height as needed
        },
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        }
    });
    Menu.setApplicationMenu(null)
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5173/");
    }
    else {
        mainWindow.loadFile(path.join(app.getAppPath(), 'dist-react/index.html'))
    }
    checkJWTToken();
}

app.whenReady().then(() => {
    createWindow();

    ipcMain.on("oauth-start", () => {
        console.log("oauth-start inside main")
        const authUrl = "http://localhost:8082/oauth2/authorization/google";
        shell.openExternal(authUrl);
    });

    const expressApp = express();

    expressApp.get("/oauth2/callback", async (req, res) => {
        const code = req.query.code;

        try {
            const response = await axios.get("http://localhost:8082/auth/google/callback", {
                params: { code }
            });

            const token = response.data.accessToken;
            const refreshToken = response.data.refreshToken;

            if (token && refreshToken) {
                try {
                    await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
                    await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME_REFRESH);

                    await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, token);
                    await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME_REFRESH, refreshToken);

                    await checkJWTToken();
                } catch (error) {
                    console.error("Failed to save tokens:", error);
                }
            }


            res.send("<h2>✅ Authentication Successful. You can close this tab.</h2>");
        } catch (error) {
            console.error("OAuth Callback Error:", error);
            res.send("<h2>❌ Authentication Failed. Please try again.</h2>");
        }
    });

    //---- File Editor
    ipcMain.handle("open-file", async () => {
        const { filePaths } = await dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [{ name: "Text Files", extensions: ["txt", "js", "html", "java", "json", "md", "css"] }]
        });

        if (filePaths.length > 0) {
            const content = fs.readFileSync(filePaths[0], "utf-8");
            return { path: filePaths[0], content };
        }
        return null;
    });

    http.createServer(expressApp).listen(3000, () => {
        console.log("OAuth listener running on http://localhost:3000");
    });
});

async function checkJWTToken() {
    const token = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);

    if (token) {
        try {
            const response = await axios.get("http://localhost:8082/user", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200) {
                console.log("✅ Access token is valid");
                mainWindow.webContents.send("oauth-success", response.data);
            }
            else if (response.status === 401) {
                console.log("⚠️ Access token expired. Attempting refresh...");
                await checkRefreshToken();
            } else {
                console.log("JWT verification failed:");
                await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
            }
        } catch (error) {
            console.log(error)
        }
    } else {
        console.log("⚠️ No JWT token found. Please login.");
    }
}


async function checkRefreshToken() {
    const refreshToken = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME_REFRESH);

    if (refreshToken) {
        try {
            const response = await axios.post("http://localhost:8082/auth/refresh", {
                refreshToken: refreshToken
            });

            const newAccessToken = response.data.accessToken;
            const newRefreshToken = response.data.refreshToken;


            await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, newAccessToken);
            await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME_REFRESH, newRefreshToken);

            console.log("🔄 Access token refreshed successfully");

            mainWindow.webContents.send("oauth-success", response.data);
        } catch (error) {
            console.log("❌ Refresh token failed:", error.response?.data || error.message);
            await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
            await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME_REFRESH);
        }
    } else {
        console.log("⚠️ No refresh token found. Please login again.");
    }
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
