"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const main_dao_1 = require("./main-proce/main-dao");
const utils_1 = require("./main-proce/utils");
require("./main-proce/ipcMain-on");
let mainWindow;
let createWindow = () => {
    mainWindow = new electron_1.BrowserWindow({
        width: 1418,
        height: 964,
        titleBarStyle: 'hidden',
        useContentSize: false,
        resizable: true,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true
        },
        frame: true
    });
    mainWindow.loadFile('index.html');
    //打开开发者工具
    //mainWindow.webContents.openDevTools();
};
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
electron_1.app.on('quit', () => {
    saveconfParam();
});
//保存ae的设置数据
let saveconfParam = () => {
    fs_1.default.writeFileSync(path_1.default.join(main_dao_1.ENV_PATH.ROOT_PATH, 'data/config.json'), JSON.stringify(main_dao_1.globalParam, null, 4));
};
//设置环境路径
let appPath = path_1.default.dirname(electron_1.app.getPath('exe'));
if (__dirname.indexOf(appPath) < 0) {
    appPath = path_1.default.join(__dirname, '..');
}
else {
    appPath = path_1.default.join(appPath, 'resources');
}
main_dao_1.ENV_PATH.ROOT_PATH = appPath;
main_dao_1.ENV_PATH.TEMP_PATH = path_1.default.join(appPath, 'data/tmp');
if (!fs_1.default.existsSync(main_dao_1.ENV_PATH.TEMP_PATH)) {
    utils_1.utils.mkdirsSync(main_dao_1.ENV_PATH.TEMP_PATH);
}
main_dao_1.ENV_PATH.CONF_PATH = path_1.default.join(appPath, 'data/confs');
if (!fs_1.default.existsSync(main_dao_1.ENV_PATH.CONF_PATH)) {
    utils_1.utils.mkdirsSync(main_dao_1.ENV_PATH.CONF_PATH);
}
if (fs_1.default.existsSync(path_1.default.join(main_dao_1.ENV_PATH.ROOT_PATH, 'data/config.json'))) {
    let conf = JSON.parse(fs_1.default.readFileSync(path_1.default.join(main_dao_1.ENV_PATH.ROOT_PATH, 'data/config.json'), { encoding: 'UTF-8' }));
    main_dao_1.globalParam.frameRate = conf.frameRate;
    main_dao_1.globalParam.bgParam = conf.bgParam;
    main_dao_1.globalParam.frameIntev = conf.frameIntev;
}
