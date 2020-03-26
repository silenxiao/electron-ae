import { EvtCenter, AE_Event, ANI_FRAME_TYPE } from "../cmm/EvtCenter";
import { globalDao, aniEntityDict } from "../cmm/render-dao";
import { updateFramePanelData } from "../frame/ani-frame-edit";
import AttrPanel from "./AttrPanel";

let chkEffect: Laya.CheckBox;
let lblEffect: Laya.Text;
let chkHit: Laya.CheckBox;
let lblHit: Laya.Text;
//let grpHit: Laya.RadioGroup;
let grpLayer: Laya.RadioGroup;
let frameEffect: FrameEffect;
let chkBlank: Laya.CheckBox;
let chkHero: Laya.CheckBox;
let lblHero: Laya.Text;
let chkEnemy: Laya.CheckBox;
let lblEnemy: Laya.Text;
let txtHitX: Laya.TextInput;
let txtHitY: Laya.TextInput;
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

    //grpHit = editor.grpHit;
    //grpHit.on(Laya.Event.CHANGE, null, onGrpHit);

    lblEffect = editor.lblEffect;
    lblHit = editor.lblHit;

    grpLayer = editor.grpLayer;
    grpLayer.on(Laya.Event.CHANGE, null, onGrpLayer);

    chkBlank = editor.chkBlank;
    chkBlank.on(Laya.Event.CHANGE, null, onChkBlank);

    chkHero = editor.chkHero;
    chkHero.on(Laya.Event.CHANGE, null, onChkHero);
    lblHero = editor.lblHero;

    chkEnemy = editor.chkEnemy;
    chkEnemy.on(Laya.Event.CHANGE, null, onChkEnemy);
    lblEnemy = editor.lblEnemy;

    txtHitX = editor.txtHitX;
    txtHitX.on(Laya.Event.INPUT, null, onHitXInput);
    txtHitY = editor.txtHitY;
    txtHitY.on(Laya.Event.INPUT, null, onHitYInput);
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
export function sysAniFrameEffect(_frameEffect: FrameEffect, effectName: string, hitName: string,
    hasHero: boolean, heroName: string,
    hasEnemy: boolean, enemyName: string) {
    frameEffect = _frameEffect;
    chkEffect.selected = frameEffect.isEffect;
    lblEffect.text = effectName;
    lblHit.text = hitName;
    chkHit.selected = frameEffect.isHit;
    txtHitX.text = frameEffect.hitXY[0].toString();
    txtHitY.text = frameEffect.hitXY[1].toString();
    // grpHit.selectedIndex = frameEffect.hitType;
    grpLayer.selectedIndex = frameEffect.layLevel;
    chkBlank.selected = frameEffect.isBlank;
    chkHero.selected = hasHero;
    lblHero.text = heroName ? heroName : "";
    chkEnemy.selected = hasEnemy;
    lblEnemy.text = enemyName ? enemyName : "";

}

function onChkEffect() {
    if (globalDao.curAniName == "") return;
    frameEffect.isEffect = chkEffect.selected;
    updateFramePanelData(globalDao.curAniName);
}

function onChkBlank() {
    if (globalDao.curAniName == '') return;
    frameEffect.isBlank = chkBlank.selected;
    updateFramePanelData(globalDao.curAniName);
}

function onChkHit() {
    if (globalDao.curAniName == "") return;
    frameEffect.isHit = chkHit.selected;
    updateFramePanelData(globalDao.curAniName);
}

function onChkHero() {
    if (globalDao.curAniName == "") return;
    let entity = aniEntityDict.get(globalDao.curAniName);
    if (entity) {
        entity.updateHero(chkHero.selected);
    }
}

function onChkEnemy() {
    if (globalDao.curAniName == "") return;
    let entity = aniEntityDict.get(globalDao.curAniName);
    if (entity) {
        entity.updateEnemy(chkEnemy.selected);
    }
}

function onHitXInput() {
    let x = Number(txtHitX.text);
    frameEffect.hitXY[0] = x;
}

function onHitYInput() {
    let y = Number(txtHitY.text);
    frameEffect.hitXY[1] = y;
}



function onGrpHit() {
    if (globalDao.curAniName == "") return;
    //frameEffect.hitType = grpHit.selectedIndex;
    updateFramePanelData(globalDao.curAniName);
}

function onGrpLayer() {
    if (globalDao.curAniName == "") return;
    frameEffect.layLevel = grpLayer.selectedIndex;
    updateFramePanelData(globalDao.curAniName);
    let entity = aniEntityDict.get(globalDao.curAniName);
    if (entity) {
        entity.updateLayer(grpLayer.selectedIndex);
    }
}