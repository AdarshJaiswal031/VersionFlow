const { contextBridge, ipcRenderer } = require("electron");

const validChannels = ["oauth-start", "oauth-success", "open-file"];
console.log("preload loaded")
contextBridge.exposeInMainWorld("electron", {
    send: (channel, data) => {
        if (validChannels.includes(channel)) {
            console.log(channel)
            ipcRenderer.send(channel, data);
        }
    },
    on: (channel, callback) => {
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_event, ...args) => callback(...args));
        }
    },
    // once: (channel, callback) => {
    //     if (validChannels.includes(channel)) {
    //         ipcRenderer.once(channel, (_event, ...args) => callback(...args));
    //     }
    // }
});
