const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  KIOSK_ID: process.env.KIOSK_ID,
  BASE_URL: process.env.BASE_URL,
  APP_VERSION: process.env.APP_VERSION,
  onReceivedTagIdFromReader: (callback) => {
    ipcRenderer.on("received-tag-id-from-reader", (_event, value) =>
      callback(value)
    );
  },
  onReceivedAlertFromReader: (callback) => {
    ipcRenderer.on("received-alert-from-reader", (_event, value) =>
      callback(value)
    );
  },
  onReaderConnectionStatusChanged: (callback) => {
    // console.log("1");
    ipcRenderer.on("reader-connection-status-changed", (_event, value) => {
      // console.log("2");
      callback(value);
    });
  },
  addLog: (content: string) => {
    ipcRenderer.send("add-log", content);
  },
  closeAT: () => {
    ipcRenderer.send("close-attendance-tracker");
  },
  maximizeMainWindow: () => {
    ipcRenderer.send("maximize-main-window");
  },
  minimizeMainWindow() {
    ipcRenderer.send("minimize-main-window");
  },
  bringMainWindowToFront: () => {
    ipcRenderer.send("bring-main-window-to-front");
  },
});
