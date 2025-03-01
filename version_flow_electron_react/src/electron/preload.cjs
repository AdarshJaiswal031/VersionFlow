const { contextBridge, ipcRenderer } = require("electron");

const validChannels = ["recreate-version", "get-versions", "oauth-start", "oauth-success", "open-file", "save-file", "commit-file", "commit-success"];
console.log("preload loaded")
contextBridge.exposeInMainWorld("electron", {
    send: (channel, data) => {
        if (validChannels.includes(channel)) {
            console.log(`Sending: ${channel}`, data);
            ipcRenderer.send(channel, data);
        }
    },
    on: (channel, callback) => {
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_event, ...args) => {
                console.log(`Received: ${channel}`, args);
                callback(...args);
            });
        }
    },
});
