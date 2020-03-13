"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EvtCenter_1 = require("../cmm/EvtCenter");
const render_dao_1 = require("../cmm/render-dao");
const ani_frame_edit_1 = require("../frame/ani-frame-edit");
let chkEffect;
let chkHit;
let grpHit;
let grpLayer;
let frameEffect;
function aniFrameEffectHandle(editor) {
    let btnEffReset = editor.btnEffReset;
    btnEffReset.toolTip = '重置所有帧的位置';
    btnEffReset.on(Laya.Event.CLICK, null, onEffReset);
    let btnEffSave = editor.btnEffSave;
    btnEffSave.toolTip = '保存所有帧的位置';
    btnEffSave.on(Laya.Event.CLICK, null, onEffSave);
    chkEffect = editor.chkEffect;
    chkEffect.on(Laya.Event.CHANGE, null, onChkEffect);
    chkHit = editor.chkHit;
    chkHit.on(Laya.Event.CHANGE, null, onChkHit);
    grpHit = editor.grpHit;
    grpHit.on(Laya.Event.CHANGE, null, onGrpHit);
    grpLayer = editor.grpLayer;
    grpLayer.on(Laya.Event.CHANGE, null, onGrpLayer);
}
exports.aniFrameEffectHandle = aniFrameEffectHandle;
/* 位置重置 */
function onEffReset() {
    EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_EFFECT_RESET);
}
function onEffSave() {
    EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_EFFECT_SAVE);
}
/**
 * 同步当前帧的效果
 */
function sysAniFrameEffect(_frameEffect = { isEffect: false, isHit: false, hitType: 0, offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: 0, indxId: 0 }) {
    frameEffect = _frameEffect;
    chkEffect.selected = frameEffect.isEffect;
    chkHit.selected = frameEffect.isHit;
    grpHit.selectedIndex = frameEffect.hitType;
    grpLayer.selectedIndex = frameEffect.layLevel;
}
exports.sysAniFrameEffect = sysAniFrameEffect;
function onChkEffect() {
    if (render_dao_1.globalDao.curAniName == "")
        return;
    frameEffect.isEffect = chkEffect.selected;
    ani_frame_edit_1.updateFramePanelData(render_dao_1.globalDao.curAniName);
}
function onChkHit() {
    if (render_dao_1.globalDao.curAniName == "")
        return;
    frameEffect.isHit = chkHit.selected;
    ani_frame_edit_1.updateFramePanelData(render_dao_1.globalDao.curAniName);
}
function onGrpHit() {
    if (render_dao_1.globalDao.curAniName == "")
        return;
    frameEffect.hitType = grpHit.selectedIndex;
    ani_frame_edit_1.updateFramePanelData(render_dao_1.globalDao.curAniName);
}
function onGrpLayer() {
    if (render_dao_1.globalDao.curAniName == "")
        return;
    frameEffect.layLevel = grpLayer.selectedIndex;
    ani_frame_edit_1.updateFramePanelData(render_dao_1.globalDao.curAniName);
}
