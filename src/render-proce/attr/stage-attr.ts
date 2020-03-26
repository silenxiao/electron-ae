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
let scaleContain: Laya.Sprite;

let bgLock: Laya.CheckBox;
let bgX: Laya.TextInput;
let bgY: Laya.TextInput;
let txtBGUrl: Laya.TextInput;
let isDraging = false;
let txtCoordinateX: Laya.TextInput;
let txtCoordinateY: Laya.TextInput;
let btnHide: Laya.CheckBox;
let isBGLocked = false;


export function imgBGHandle(mainUI: StagePanel) {

    imgBG = mainUI.imgBG;
    imgBG.on(Laya.Event.MOUSE_DOWN, null, onMouseDown);
    imgBG.on(Laya.Event.MOUSE_UP, null, onMouseUp);
    imgBG.on(Laya.Event.MOUSE_OUT, null, onMouseUp);

    coordinateX = mainUI.coordinateX;
    coordinateY = mainUI.coordinateY;

    scaleContain = mainUI.scaleContain;
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

    btnHide = panel.btnHide;
    btnHide.on(Laya.Event.CLICK, null, onCoorHide);

    let btCurAniCoordReset = panel.btCurAniCoordReset;
    btCurAniCoordReset.on(Laya.Event.CLICK, null, onCurAniCoordReset);

    let btAllAniCoordReset = panel.btAllAniCoordReset;
    btAllAniCoordReset.on(Laya.Event.CLICK, null, onAllAniCoordReset);

    ipcRenderer.send('r2m_read-conf');
    ipcRenderer.on('m2r_read-conf', (event, confData) => {
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

    buildScale();
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
    buildScale();
}

function txtCoordinateYInput() {
    globalDao.coordinateY = coordinateY.y = Number(txtCoordinateY.text);
    buildScale();
}

function onCoorHide() {
    coordinateX.visible = coordinateY.visible = scaleContain.visible = !btnHide.selected;
}

function toSaveConfig() {
    ipcRenderer.send('r2m_save-conf', confParam);
}

/** 构建刻度尺 */
function buildScale() {
    let c = scaleContain;
    c.removeChildren();
    //计算x刻度
    let coordY = coordinateY.y;
    for (let i = coordY - 30; i > 0; i -= 30) {
        let t = new CoorScale(true);
        c.addChild(t);
        t.setScalVal((i - coordY).toString());
        t.x = coordinateX.x;
        t.y = i;
    }
    for (let i = coordY + 30; i < 590; i += 30) {
        let t = new CoorScale(true);
        c.addChild(t);
        t.setScalVal((i - coordY).toString());
        t.x = coordinateX.x;
        t.y = i;
    }

    //计算y刻度
    let coordX = coordinateX.x;
    for (let i = coordX - 30; i > 0; i -= 30) {
        let t = new CoorScale(false);
        c.addChild(t);
        t.setScalVal((i - coordX).toString());
        t.y = coordinateY.y - 9;
        t.x = i;
    }
    for (let i = coordX + 30; i < 860; i += 30) {
        let t = new CoorScale(false);
        c.addChild(t);
        t.setScalVal((i - coordX).toString());
        t.y = coordinateY.y - 9;
        t.x = i;
    }
}


class CoorScale extends Laya.Sprite {
    img: Laya.Image;
    label: Laya.Label;
    isAxis: boolean;
    constructor(isAxis: boolean) {
        super();
        this.isAxis = isAxis;
        this.img = new Laya.Image();
        this.addChild(this.img);

        this.label = new Laya.Label();
        this.addChild(this.label);


        if (isAxis) {
            this.img.skin = "comp/line2.png";
            this.label.x = 12;
            this.label.y = -4;
        } else {
            this.label.width = 50;
            this.label.align = 'center';
            this.img.skin = "comp/line1.png";
            this.label.y = -12;
            this.label.x = -25;
        }
        this.label.color = '#FFFFFF';
        this.label.text = '120';
    }

    setScalVal(val: string) {
        this.label.text = val;
    }
}