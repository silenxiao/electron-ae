"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const render_dao_1 = require("../cmm/render-dao");
const electron_1 = require("electron");
let confNames = "不使用配置";
let cbbConf;
let txtCurAni;
function aniSaveHandle(editor) {
    let btnAE = editor.btnAE;
    btnAE.toolTip = '导出AE';
    btnAE.on(Laya.Event.CLICK, null, onBtnAEClick);
    let btnAtlas = editor.btnAtlas;
    btnAtlas.toolTip = '导出图集';
    btnAtlas.on(Laya.Event.CLICK, null, onBtnAtlasClick);
    let btnConf = editor.btnConf;
    btnConf.toolTip = '导出配置';
    btnConf.on(Laya.Event.CLICK, null, onBtnConfClick);
    let btnOther = editor.btnOther;
    btnOther.on(Laya.Event.CLICK, null, onBtnReadConf);
    cbbConf = editor.cbbConf;
    cbbConf.selectHandler = Laya.Handler.create(null, onCbbConf, [cbbConf], false);
    txtCurAni = editor.txtCurAni;
    electron_1.ipcRenderer.send('read-ani-confs');
    electron_1.ipcRenderer.on('selected-ani-conf', (event, fileName, framesDataStr) => {
        addConf(fileName, framesDataStr);
    });
    //保存ae成功
    electron_1.ipcRenderer.on('save-ae-succ', (event, aniName, savePath) => {
        let index = electron_1.remote.dialog.showMessageBoxSync({
            type: 'info',
            title: 'AE导出',
            message: `AE导出完成: ${aniName} `,
            buttons: ['前往', '取消'],
            cancelId: 2
        });
        if (index == 0) {
            electron_1.shell.openItem(savePath);
        }
    });
    //保存图集成功
    electron_1.ipcRenderer.on('save-atlas-succ', (event, aniName, savePath) => {
        let index = electron_1.remote.dialog.showMessageBoxSync({
            type: 'info',
            title: '图集打包',
            message: `图集打包成功: ${aniName} `,
            buttons: ['前往', '取消'],
            cancelId: 2
        });
        if (index == 0) {
            electron_1.shell.openItem(savePath);
        }
    });
    electron_1.ipcRenderer.on('save-atlas-fail', (event, err) => {
        electron_1.remote.dialog.showErrorBox('打包失败', err);
    });
}
exports.aniSaveHandle = aniSaveHandle;
function setConfName(confName) {
    if (confName == '') {
        cbbConf.selectedIndex = 0;
    }
    else {
        cbbConf.selectedLabel = confName;
    }
}
exports.setConfName = setConfName;
function addConf(confName, framesDataStr) {
    if (!render_dao_1.cmmAniConf.get(confName)) {
        confNames = confNames + ',' + confName;
    }
    render_dao_1.cmmAniConf.set(confName, JSON.parse(framesDataStr));
    let selectedIndex = cbbConf.selectedIndex;
    if (selectedIndex == -1)
        selectedIndex = 0;
    cbbConf.labels = confNames;
    cbbConf.selectedIndex = selectedIndex;
}
exports.addConf = addConf;
function setTxtCurAniName(val) {
    txtCurAni.text = val;
}
exports.setTxtCurAniName = setTxtCurAniName;
function onBtnAEClick() {
    if (render_dao_1.globalDao.curAniName == '')
        return;
    let aniEntity = render_dao_1.aniEntityDict.get(render_dao_1.globalDao.curAniName);
    electron_1.ipcRenderer.send('save-ae', render_dao_1.globalDao.curAniName, aniEntity.frameEffects);
}
function onBtnAtlasClick() {
    if (render_dao_1.globalDao.curAniName == '')
        return;
    let aniEntity = render_dao_1.aniEntityDict.get(render_dao_1.globalDao.curAniName);
    aniEntity.saveFramesData();
    electron_1.ipcRenderer.send('save-atlas', render_dao_1.globalDao.curAniName, aniEntity.frameEffects);
}
function onBtnConfClick() {
    if (render_dao_1.globalDao.curAniName == '')
        return;
    let aniEntity = render_dao_1.aniEntityDict.get(render_dao_1.globalDao.curAniName);
    electron_1.ipcRenderer.send('save-ani-file', render_dao_1.globalDao.curAniName, aniEntity.frameEffects);
}
function onBtnReadConf() {
    electron_1.ipcRenderer.send('read-ani-conf-dialog');
}
function onCbbConf(cb) {
    if (render_dao_1.globalDao.curAniName == '')
        return;
    let aniEntity = render_dao_1.aniEntityDict.get(render_dao_1.globalDao.curAniName);
    if (cb.selectedIndex > 0) {
        aniEntity.setCmmEffect(cb.selectedLabel);
    }
    else {
        aniEntity.setCmmEffect('');
    }
}
