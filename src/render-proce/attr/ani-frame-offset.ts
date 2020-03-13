import { globalDao } from "../cmm/render-dao";
import { EvtCenter, AE_Event, ANI_FRAME_TYPE } from "../cmm/EvtCenter";
import AttrPanel from "./AttrPanel";

/**
 * 帧移动
 */
let chkFrameMv: Laya.CheckBox;
let txtFramex: Laya.TextInput;
let txtFramey: Laya.TextInput;
let btnUp;
let btnDown;
export function aniFrameOffsetHandle(editorView: AttrPanel) {
    let btnOffsetReset = editorView.btnOffsetReset;
    btnOffsetReset.toolTip = '重置所有帧的位置';
    btnOffsetReset.on(Laya.Event.CLICK, null, onOffsetReset);

    let btnOffsetSave = editorView.btnOffsetSave;
    btnOffsetSave.toolTip = '保存所有帧的位置';
    btnOffsetSave.on(Laya.Event.CLICK, null, onOffsetSave);

    chkFrameMv = editorView.chkFrameMv;
    chkFrameMv.on(Laya.Event.CHANGE, null, onChkFrameMv);

    txtFramex = editorView.txtFramex;
    txtFramex.on(Laya.Event.INPUT, null, onFrameXInput);

    txtFramey = editorView.txtFramey;
    txtFramey.on(Laya.Event.INPUT, null, onFrameYInput);

    let xReset = editorView.xReset;
    xReset.toolTip = '对齐上一帧的位置';
    xReset.on(Laya.Event.CLICK, null, onXReset);

    let yReset = editorView.yReset;
    yReset.toolTip = '对齐上一帧的位置';
    yReset.on(Laya.Event.CLICK, null, onYReset);

    btnUp = editorView.btnUp;
    btnUp.toolTip = '上移一层';
    btnUp.on(Laya.Event.CLICK, null, onUpClick);

    btnDown = editorView.btnDown;
    btnDown.toolTip = '下移动一层';
    btnDown.on(Laya.Event.CLICK, null, onDownClick);
}

/**
 * 同步当前帧的偏移量
 * @param {*} x 
 * @param {*} y 
 */
export function sysAniFrameOffset(x: number, y: number) {
    txtFramex.text = x.toString();
    txtFramey.text = y.toString();
}


/* 位置重置 */
function onOffsetReset() {
    EvtCenter.send(AE_Event.ANI_FRAME_EVENT, ANI_FRAME_TYPE.ANI_FRAME_OFFSET_RESET);
}

function onOffsetSave() {
    EvtCenter.send(AE_Event.ANI_FRAME_EVENT, ANI_FRAME_TYPE.ANI_FRAME_OFFSET_SAVE);
}

function onChkFrameMv() {
    globalDao.frameDrag = chkFrameMv.selected;
}

function onFrameXInput() {
    let x = Number(txtFramex.text);
    if (!isNaN(x))
        EvtCenter.send(AE_Event.ANI_FRAME_EVENT, [ANI_FRAME_TYPE.ANI_FRAME_OFFSETX, x]);
}

function onFrameYInput() {
    let y = Number(txtFramey.text);
    if (!isNaN(y))
        EvtCenter.send(AE_Event.ANI_FRAME_EVENT, [ANI_FRAME_TYPE.ANI_FRAME_OFFSETY, y]);
}

function onXReset() {
    EvtCenter.send(AE_Event.ANI_FRAME_EVENT, ANI_FRAME_TYPE.ANI_FRAME_OFFSETX_RESET);
}

function onYReset() {
    EvtCenter.send(AE_Event.ANI_FRAME_EVENT, ANI_FRAME_TYPE.ANI_FRAME_OFFSETY_RESET);
}


function onUpClick() {
    EvtCenter.send(AE_Event.ANI_LAYER, 1);
}

function onDownClick() {
    EvtCenter.send(AE_Event.ANI_LAYER, -1);
}