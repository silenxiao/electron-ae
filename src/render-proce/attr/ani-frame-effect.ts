import { EvtCenter, AE_Event, ANI_FRAME_TYPE } from "../cmm/EvtCenter";
import { globalDao } from "../cmm/render-dao";
import { updateFramePanelData } from "../frame/ani-frame-edit";
import AttrPanel from "./AttrPanel";


let chkEffect: Laya.CheckBox;
let chkHit: Laya.CheckBox;
let grpHit: Laya.RadioGroup;
let grpLayer: Laya.RadioGroup;
let frameEffect: FrameEffect;
export function aniFrameEffectHandle(editor: AttrPanel) {

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

/* 位置重置 */
function onEffReset() {
    EvtCenter.send(AE_Event.ANI_FRAME_EVENT, ANI_FRAME_TYPE.ANI_FRAME_EFFECT_RESET);
}

function onEffSave() {
    EvtCenter.send(AE_Event.ANI_FRAME_EVENT, ANI_FRAME_TYPE.ANI_FRAME_EFFECT_SAVE);
}

/**
 * 同步当前帧的效果
 */
export function sysAniFrameEffect(_frameEffect = { isEffect: false, isHit: false, hitType: 0, offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: 0, indxId: 0 }) {
    frameEffect = _frameEffect;
    chkEffect.selected = frameEffect.isEffect;
    chkHit.selected = frameEffect.isHit;
    grpHit.selectedIndex = frameEffect.hitType;
    grpLayer.selectedIndex = frameEffect.layLevel;
}

function onChkEffect() {
    if (globalDao.curAniName == "") return;
    frameEffect.isEffect = chkEffect.selected;
    updateFramePanelData(globalDao.curAniName);
}


function onChkHit() {
    if (globalDao.curAniName == "") return;
    frameEffect.isHit = chkHit.selected;
    updateFramePanelData(globalDao.curAniName);
}


function onGrpHit() {
    if (globalDao.curAniName == "") return;
    frameEffect.hitType = grpHit.selectedIndex;
    updateFramePanelData(globalDao.curAniName);
}

function onGrpLayer() {
    if (globalDao.curAniName == "") return;
    frameEffect.layLevel = grpLayer.selectedIndex;
    updateFramePanelData(globalDao.curAniName);
}