import { confParam, globalDao } from "../cmm/render-dao";
import StagePanel from "../stage/StagePanel";
import AttrPanel from "./AttrPanel";
import { syncAniCoord } from "../stage/ani-on-stage";
import { ipcRenderer } from "electron";

/**
 * 主舞台基础属性设置（背景，坐标系）
 */
let imgBG: Laya.Image;
let coordinateX: Laya.Image;
let coordinateY: Laya.Image;

let bgLock: Laya.CheckBox;
let bgX: Laya.TextInput;
let bgY: Laya.TextInput;
let txtBGUrl: Laya.TextInput;
let isDraging = false;
let txtCoordinateX: Laya.TextInput;
let txtCoordinateY: Laya.TextInput;
let isBGLocked = false;

export function imgBGHandle(mainUI: StagePanel) {
    imgBG = mainUI.imgBG;
    imgBG.on(Laya.Event.MOUSE_DOWN, null, onMouseDown);
    imgBG.on(Laya.Event.MOUSE_UP, null, onMouseUp);
    imgBG.on(Laya.Event.MOUSE_OUT, null, onMouseUp);

    coordinateX = mainUI.coordinateX;
    coordinateY = mainUI.coordinateY;
}

export function stagePropertyHandle(panel: AttrPanel) {
    let btnBG = panel.btnBG;
    btnBG.toolTip = '选择背景图';
    btnBG.on(Laya.Event.CLICK, null, onBtnBGClick);

    txtBGUrl = panel.txtBGUrl;

    bgLock = panel.bgLock;
    isBGLocked = !bgLock.selected;
    bgLock.toolTip = '锁定背景图，禁止拖动';
    bgLock.on(Laya.Event.CLICK, null, onBGLock);

    let bgReset = panel.bgReset;
    bgReset.toolTip = '重置背景参数';
    bgReset.on(Laya.Event.CLICK, null, onBGReset);


    let bgSave = panel.bgSave;
    bgSave.toolTip = '保存背景参数';
    bgSave.on(Laya.Event.CLICK, null, onBGSave);

    bgX = panel.bgX;
    bgX.toolTip = '坐标系x轴的位置';
    bgX.on(Laya.Event.INPUT, null, bgXInput);

    bgY = panel.bgY;
    bgY.toolTip = '坐标系y轴的位置';
    bgY.on(Laya.Event.INPUT, null, bgYInput);


    let coordReset = panel.coordReset;
    coordReset.toolTip = '重置坐标系位置';
    coordReset.on(Laya.Event.CLICK, null, onCoordReset);

    let coordSave = panel.coordSave;
    coordSave.toolTip = '保存坐标系位置';
    coordSave.on(Laya.Event.CLICK, null, onCoordSave);

    txtCoordinateX = panel.txtCoordinateX;
    txtCoordinateX.toolTip = '坐标系x轴的位置';
    txtCoordinateX.on(Laya.Event.INPUT, null, txtCoordinateXInput);

    txtCoordinateY = panel.txtCoordinateY;
    txtCoordinateY.toolTip = '坐标系y轴的位置';
    txtCoordinateY.on(Laya.Event.INPUT, null, txtCoordinateYInput);

    let btCurAniCoordReset = panel.btCurAniCoordReset;
    btCurAniCoordReset.on(Laya.Event.CLICK, null, onCurAniCoordReset);

    let btAllAniCoordReset = panel.btAllAniCoordReset;
    btAllAniCoordReset.on(Laya.Event.CLICK, null, onAllAniCoordReset);

    ipcRenderer.send('read-conf-data');
    ipcRenderer.on('read-conf-data', (event, confData) => {
        confParam.frameRate = confData.frameRate;
        confParam.bgParam = confData.bgParam;
        confParam.frameIntev = confData.frameIntev;
        //初始化数据
        onBGReset();
        onCoordReset();
    });
}

/* 背景拖拽 */
function onMouseDown() {
    if (isBGLocked) return;
    isDraging = true;
    imgBG.startDrag();
}

function onMouseUp() {
    if (isDraging) {
        isDraging = false;
        imgBG.stopDrag();
        bgX.text = imgBG.x.toString();
        bgY.text = imgBG.y.toString();
    }
}

//更换背景
function onBtnBGClick() {
    ipcRenderer.send('open-file-dialog');

    ipcRenderer.on('selected-img', (event, path) => {
        txtBGUrl.text = imgBG.skin = path;
    })
}

//背景锁定，不允许拖动
function onBGLock() {
    isBGLocked = !bgLock.selected;
}
//背景参数重置
function onBGReset() {
    imgBG.x = confParam.bgParam.posX;
    imgBG.y = confParam.bgParam.posY;
    bgX.text = imgBG.x.toString();
    bgY.text = imgBG.y.toString();
    imgBG.skin = txtBGUrl.text = confParam.bgParam.url;
}
//背景参数保存
function onBGSave() {
    confParam.bgParam.posX = imgBG.x;
    confParam.bgParam.posY = imgBG.y;
    confParam.bgParam.url = txtBGUrl.text;
    toSaveConfig();
}

//背景x坐标设置
function bgXInput() {
    imgBG.x = Number(bgX.text);
}
//背景y坐标设置
function bgYInput() {
    imgBG.y = Number(bgY.text);
}

//坐标系重置
function onCoordReset() {
    globalDao.coordinateX = coordinateX.x = confParam.bgParam.coordinateX;
    globalDao.coordinateY = coordinateY.y = confParam.bgParam.coordinateY;
    txtCoordinateX.text = globalDao.coordinateX.toString();
    txtCoordinateY.text = globalDao.coordinateY.toString();
}

//坐标系参数保存
function onCoordSave() {
    confParam.bgParam.coordinateX = coordinateX.x;
    confParam.bgParam.coordinateY = coordinateY.y;
    toSaveConfig()
}
function onCurAniCoordReset() {
    syncAniCoord(1);
}

function onAllAniCoordReset() {
    syncAniCoord(0);
}

function txtCoordinateXInput() {
    globalDao.coordinateX = coordinateX.x = Number(txtCoordinateX.text);
}

function txtCoordinateYInput() {
    globalDao.coordinateY = coordinateY.y = Number(txtCoordinateY.text);
}

function toSaveConfig() {
    ipcRenderer.send('save-conf-data', confParam);
}