"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const render_dao_1 = require("../cmm/render-dao");
const EvtCenter_1 = require("../cmm/EvtCenter");
/**
 * 帧移动
 */
let chkFrameMv;
let txtFramex;
let txtFramey;
let btnUp;
let btnDown;
function aniFrameOffsetHandle(editorView) {
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
exports.aniFrameOffsetHandle = aniFrameOffsetHandle;
/**
 * 同步当前帧的偏移量
 * @param {*} x
 * @param {*} y
 */
function sysAniFrameOffset(x, y) {
    txtFramex.text = x.toString();
    txtFramey.text = y.toString();
}
exports.sysAniFrameOffset = sysAniFrameOffset;
/* 位置重置 */
function onOffsetReset() {
    EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSET_RESET);
}
function onOffsetSave() {
    EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSET_SAVE);
}
function onChkFrameMv() {
    render_dao_1.globalDao.frameDrag = chkFrameMv.selected;
}
function onFrameXInput() {
    let x = Number(txtFramex.text);
    if (!isNaN(x))
        EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, [EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSETX, x]);
}
function onFrameYInput() {
    let y = Number(txtFramey.text);
    if (!isNaN(y))
        EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, [EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSETY, y]);
}
function onXReset() {
    EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSETX_RESET);
}
function onYReset() {
    EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSETY_RESET);
}
function onUpClick() {
    EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_LAYER, 1);
}
function onDownClick() {
    EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_LAYER, -1);
}
