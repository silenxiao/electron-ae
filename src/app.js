"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var ipcMain_on_1 = require("./main-proce/ipcMain-on");
var mainWindow;
var createWindow = function () {
    mainWindow = new electron_1.BrowserWindow({
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
    });
    mainWindow.loadFile('renderer-src/index.html');
    //打开开发者工具
    //mainWindow.webContents.openDevTools();
};
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
electron_1.app.on('quit', function () {
    ipcMain_on_1.saveAppData();
});
