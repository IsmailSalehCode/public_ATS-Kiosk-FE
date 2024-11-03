// === ENV VARS START ===
process.env.KIOSK_ID = "hidden-from-public";
process.env.LOCALE = "bg";
// dev
// process.env.BASE_URL = "http://localhost:8098/kiosk/";
// prod
process.env.BASE_URL = "hidden-from-public";
// === ENV VARS END ===
import addToLogFile from "./logger";
import { app, BrowserWindow, ipcMain, session } from "electron";
import PCSC from "@tockawa/nfc-pcsc";
const acceptedTagStandards = ["TAG_ISO_14443_3"];
app.disableHardwareAcceleration(); // fixes the start-up issue, but it could be this pc's GPU that is glitchin out. May not happen on other computer maybe:
/**
 * [electron] [7720:0713/013548.587:ERROR:gpu_process_host.cc(991)] GPU process exited unexpectedly: exit_code=-1073740791
[electron] [7720:0713/013549.064:ERROR:gpu_process_host.cc(991)] GPU process exited unexpectedly: exit_code=-1073740791
[electron] [7720:0713/013549.528:ERROR:gpu_process_host.cc(991)] GPU process exited unexpectedly: exit_code=-1073740791
*/
import { regexNFCtag } from "./rules";
import { join } from "path";
const appTitle = "Attendance Tracker";
const iconPath = join(app.getAppPath(), "static", "app-icon.ico");
let mainWindow: BrowserWindow;
const isDev = process.env.NODE_ENV === "development" ? true : false; //works
function createWindow() {
  mainWindow = new BrowserWindow({
    title: appTitle,
    width: 500,
    height: 500,
    webPreferences: {
      backgroundThrottling: false,
      preload: join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: iconPath,
  });

  mainWindow.removeMenu();

  // mainWindow.webContents.setWindowOpenHandler((details) => {
  //   shell.openExternal(details.url); // Open URL in user's browser.
  //   return { action: "deny" }; // Prevent the app from opening the URL.
  // });

  // const isDev = app.isPackaged; doesn't work idk why
  if (isDev) {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  } else {
    mainWindow.loadFile(join(app.getAppPath(), "renderer", "index.html"));
  }

  if (isDev) {
    // Open the DevTools
    mainWindow.webContents.openDevTools();
  } else {
    initKioskMode(mainWindow);
  }
}

// Unable to spawn > 1 instance of the app.
const additionalData = { key: 123 };
const gotTheLock = app.requestSingleInstanceLock(additionalData);

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    mainWindow.show();
    mainWindow.focus();
  });
}
//======================
app.whenReady().then(() => {
  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": ["script-src 'self'"],
      },
    });
  });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  mainWindow.webContents.on("did-finish-load", () => {
    //*********NFC tag reader start */
    const nfc = new PCSC();
    nfc.on("reader", (reader) => {
      sendReaderConnectionStatusChanged(true);

      reader.on("card", (card) => {
        const tagId = card.uid || "x";
        const tagStandard = card.standard;
        if (!regexNFCtag.test(tagId)) {
          throw new Error("bad-tag");
        }
        if (!acceptedTagStandards.includes(tagStandard)) {
          throw new Error("bad-tag");
        }

        sendTagIdFromReader(tagId);
      });

      reader.on("error", (err) => {
        let typeOfAlert;
        let msg;
        if (err.message.includes("bad-tag")) {
          msg =
            "Incompatible tag detected. Please use company-issued NFC tags.";
          typeOfAlert = "info";
        } else if (
          err.message.includes("Could not get card UID") ||
          err.message.includes("An error occurred while transmitting") ||
          err.message.includes(
            "The smart card has been removed, so that further communication is not possible"
          )
        ) {
          msg = "Please hold the card longer on the reader.";
          typeOfAlert = "warning";
        } else {
          msg = `${reader.name} an unexpected error occured.\n${err.message}\n | Contact a sys admin to check NFC reader logs for more information.`;
          typeOfAlert = "error";
        }

        sendAlertFromReader({ type: typeOfAlert, message: msg });

        if (typeOfAlert === "error") {
          addToLogFile("nfc-reader", err);
        }
      });

      reader.on("end", () => {
        sendReaderConnectionStatusChanged(false);
        sendAlertFromReader({
          type: "error",
          message: `${reader.name} device removed`,
        });
      });
    });

    nfc.on("error", (err) => {
      addToLogFile("nfc-reader", err);
    });
    // NFC tag reader end
  });
});

function sendAlertFromReader(alert: Object) {
  // alert has to have the following attributes: type , message
  mainWindow.webContents.send("received-alert-from-reader", alert);
}
function sendTagIdFromReader(tagId: string) {
  mainWindow.webContents.send("received-tag-id-from-reader", tagId);
}
function sendReaderConnectionStatusChanged(isConnected: boolean) {
  mainWindow.webContents.send("reader-connection-status-changed", isConnected);
}

ipcMain.on("add-log", (event, content) => {
  addToLogFile("from-renderer", content);
});

ipcMain.on("bring-main-window-to-front", () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

ipcMain.on("minimize-main-window", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on("maximize-main-window", () => {
  if (mainWindow) {
    mainWindow.maximize();
  }
});

function initKioskMode(mainWindow: BrowserWindow) {
  mainWindow.setAlwaysOnTop(true);
  mainWindow.kiosk = true;
}
// helper to prevent the app from losing focus. Commented out during dev, because it prevents me from inputting stuff in DevTools.
app.on("browser-window-blur", (event, bw) => {
  if (isDev === false) {
    bw.restore();
    bw.focus();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});
// function restartApp() {
//   app.relaunch();
//   app.quit(); // doesn't work in dev, but maybe it'll work in prod?
// }
// function addActivityShutDown() {
//   const exitActivity = "Shutting down Attendance Tracker ...";
//   mainWindow.webContents.send("received-info-from-reader", exitActivity);
// }
