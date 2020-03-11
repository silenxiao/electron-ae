import { app, BrowserWindow } from "electron"
import { saveAppData } from "./main-proce/ipcMain-on";

let mainWindow: BrowserWindow;

let createWindow = () => {
    mainWindow = new
        BrowserWindow({
            width: 1416,
            height: 980,
            titleBarStyle: 'hidden',
            useContentSize: false,
            resizable: true,
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true
            },
            frame: true
        })
    mainWindow.loadFile('renderer-src/index.html');

    //打开开发者工具
    //mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
});

app.on('quit', () => {
    saveAppData();
})
