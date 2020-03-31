import { EvtCenter, AE_Event, ANI_FRAME_TYPE } from "../cmm/EvtCenter";
import { globalDao, aniEntityDict } from "../cmm/render-dao";
import { updateFramePanelData } from "../frame/ani-frame-edit";
import AttrPanel from "./AttrPanel";
import { setAniFirstPlay } from "../stage/ani-on-stage";

let chkEffect: Laya.CheckBox;
let cbbEffect: Laya.ComboBox;
let chkHit: Laya.CheckBox;
let cbbHit: Laya.ComboBox;
let txtHitX: Laya.TextInput;
let txtHitY: Laya.TextInput;

let txtUdef: Laya.TextInput;
//let grpHit: Laya.RadioGroup;
let grpLayer: Laya.RadioGroup;
let frameEffect: FrameEffect;
let chkBlank: Laya.CheckBox;

let cbbModel: Laya.ComboBox;
let chkFollow: Laya.CheckBox;

let effNames = "绑定攻击特效";
let hitNames = "绑定受击特效";
let modNames = "绑定受击模型";
let aniName: string[] = [];
let lblHitXY: Laya.Text;
export function aniFrameEffectHandle(editor: AttrPanel) {

    let btnEffReset = editor.btnEffReset;
    btnEffReset.toolTip = '重置所有帧的位置';
    btnEffReset.on(Laya.Event.CLICK, null, onEffReset);

    let btnEffSave = editor.btnEffSave;
    btnEffSave.toolTip = '保存所有帧的位置';
    btnEffSave.on(Laya.Event.CLICK, null, onEffSave);

    chkEffect = editor.chkEffect;
    chkEffect.on(Laya.Event.CHANGE, null, onChkEffect);
    cbbEffect = editor.cbbEffect;
    cbbEffect.selectHandler = Laya.Handler.create(null, onCbbEffect, [cbbEffect], false);

    chkHit = editor.chkHit;
    chkHit.on(Laya.Event.CHANGE, null, onChkHit);

    cbbHit = editor.cbbHit;
    cbbHit.selectHandler = Laya.Handler.create(null, onCbbHit, [cbbHit], false);

    chkFollow = editor.chkFollow;
    chkFollow.on(Laya.Event.CHANGE, null, onChkFollow);


    txtUdef = editor.lblUdef;
    txtUdef.on(Laya.Event.INPUT, null, onUdefInput);

    txtHitX = editor.txtHitX;
    txtHitX.on(Laya.Event.INPUT, null, onHitXInput);
    txtHitY = editor.txtHitY;
    txtHitY.on(Laya.Event.INPUT, null, onHitYInput);

    //grpHit = editor.grpHit;
    //grpHit.on(Laya.Event.CHANGE, null, onGrpHit);

    grpLayer = editor.grpLayer;
    grpLayer.on(Laya.Event.CHANGE, null, onGrpLayer);

    //chkBlank = editor.chkBlank;
    //chkBlank.on(Laya.Event.CHANGE, null, onChkBlank);

    cbbModel = editor.cbbModel;
    cbbModel.selectHandler = Laya.Handler.create(null, onCbbModel, [cbbModel], false);

    lblHitXY = editor.lblHitXY;
}

/**
 * 新增动画名到效果编辑面板的combobox
 * @param name 
 */
export function addAniToComboBox(name: string) {
    aniName.push(name);
    let label = cbbEffect.selectedLabel;
    cbbEffect.labels = effNames + ',' + aniName.join(',');
    cbbEffect.selectedLabel = label;

    label = cbbHit.selectedLabel;
    cbbHit.labels = hitNames + ',' + aniName.join(',');
    cbbHit.selectedLabel = label;

    label = cbbModel.selectedLabel;
    cbbModel.labels = modNames + ',' + aniName.join(',');
    cbbModel.selectedLabel = label;
}

/**
 * 效果编辑面板combobox，删除动画名
 * @param name 
 */
export function delAniToComboBox(name: string) {
    let idx = aniName.indexOf(name);
    if (idx < 0) return;
    aniName.splice(idx, 1);
    if (aniName.length > 0) {
        let label = cbbEffect.selectedLabel;
        cbbEffect.labels = effNames + ',' + aniName.join(',');
        if (label == name) {
            cbbEffect.selectedIndex = 0;
        } else {
            cbbEffect.selectedLabel = label;
        }

        label = cbbHit.selectedLabel;
        cbbHit.labels = hitNames + ',' + aniName.join(',');
        if (label == name) {
            cbbHit.selectedIndex = 0;
        } else {
            cbbHit.selectedLabel = label;
        }

        label = cbbModel.selectedLabel;
        cbbModel.labels = modNames + ',' + aniName.join(',');
        if (label == name) {
            cbbModel.selectedIndex = 0;
        } else {
            cbbModel.selectedLabel = label;
        }
    } else {
        cbbEffect.labels = effNames;
        cbbHit.labels = hitNames;
        cbbModel.labels = modNames;
        cbbEffect.selectedIndex = cbbHit.selectedIndex = cbbModel.selectedIndex = 0;
    }
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
export function sysAniFrameEffect(_frameEffect: FrameEffect, effectName: string, hitName: string, modelName: string,
    isFollow: boolean, hitXY: Point) {
    frameEffect = _frameEffect;
    chkEffect.selected = frameEffect.isEffect == 1;
    chkHit.selected = frameEffect.hitXY.length != 0;
    if (frameEffect.hitXY.length > 0) {
        txtHitX.text = frameEffect.hitXY[0].toString();
        txtHitY.text = frameEffect.hitXY[1].toString();
    } else {
        txtHitX.text = '0';
        txtHitY.text = '0';
    }
    grpLayer.selectedIndex = frameEffect.layLevel;
    //chkBlank.selected = frameEffect.isBlank;
    txtUdef.text = _frameEffect.lblName;

    if (effectName == "")
        cbbEffect.selectedIndex = 0;
    else
        cbbEffect.selectedLabel = effectName;

    if (hitName == "")
        cbbHit.selectedIndex = 0;
    else
        cbbHit.selectedLabel = hitName;

    if (modelName == "")
        cbbModel.selectedIndex = 0;
    else
        cbbModel.selectedLabel = modelName;

    chkFollow.selected = isFollow;
    if (hitXY)
        lblHitXY.text = [hitXY.x, hitXY.y].join(', ')
    else
        lblHitXY.text = '0, 0'
}

function onChkEffect() {
    if (globalDao.curAniName == "") return;
    frameEffect.isEffect = (chkEffect.selected ? 1 : 0);
    updateFramePanelData(globalDao.curAniName);
}

function onChkFollow() {
    if (globalDao.curAniName == "") return;
    let entity = aniEntityDict.get(globalDao.curAniName);
    entity.isFollow = chkFollow.selected;
}

function onCbbEffect(cbb: Laya.ComboBox) {
    if (globalDao.curAniName == "" || globalDao.curAniName == cbb.selectedLabel) return;
    let entity = aniEntityDict.get(globalDao.curAniName);
    if (!entity) return;
    if (cbb.selectedIndex > 0) {
        setAniFirstPlay(globalDao.curAniName);
        entity.bindEffect(cbb.selectedLabel)
        addToStage(cbb.selectedLabel);
    } else {
        entity.bindEffect("");
    }
}


function onChkHit() {
    if (globalDao.curAniName == "") return;
    if (frameEffect.hitXY.length == 0 && chkHit.selected)
        frameEffect.hitXY = [0, 0];
    if (!chkHit.selected) frameEffect.hitXY = [];
    updateFramePanelData(globalDao.curAniName);
}

function onCbbHit(cbb: Laya.ComboBox) {
    if (globalDao.curAniName == "" || globalDao.curAniName == cbb.selectedLabel) return;
    let entity = aniEntityDict.get(globalDao.curAniName);
    if (!entity) return;
    if (cbb.selectedIndex > 0) {
        setAniFirstPlay(globalDao.curAniName);
        entity.bindHit(cbb.selectedLabel);
        addToStage(cbb.selectedLabel);
    } else {
        entity.bindHit("");
    }
}

function onHitXInput() {
    if (globalDao.curAniName == "") return;
    let x = Number(txtHitX.text);
    frameEffect.hitXY[0] = x;
    let entity = aniEntityDict.get(globalDao.curAniName);
    if (entity.bindTarget != "") {
        let bindTarget = aniEntityDict.get(entity.bindTarget);
        bindTarget.updateAtkTarget();
    }
}

function onHitYInput() {
    if (globalDao.curAniName == "") return;
    let y = Number(txtHitY.text);
    frameEffect.hitXY[1] = y;
    let entity = aniEntityDict.get(globalDao.curAniName);
    if (entity.bindTarget != "") {
        let bindTarget = aniEntityDict.get(entity.bindTarget);
        bindTarget.updateAtkTarget();
    }
}

function onCbbModel(cbb: Laya.ComboBox) {
    if (globalDao.curAniName == "" || globalDao.curAniName == cbb.selectedLabel) return;
    let entity = aniEntityDict.get(globalDao.curAniName);
    if (!entity) return;
    if (entity.atkTarget == cbb.selectedLabel) return;
    if (entity.atkTarget != '') {
        aniEntityDict.get(entity.atkTarget).resetHitXY();
    }
    if (cbb.selectedIndex > 0) {
        entity.bindAtkTarget(cbb.selectedLabel);
        addToStage(cbb.selectedLabel);
    } else {
        entity.atkTarget = "";
    }
}

function addToStage(aniName: string) {
    EvtCenter.send(AE_Event.ANI_TO_STAGE, aniName);
}

function onUdefInput() {
    if (globalDao.curAniName == "") return;
    let x = Number(txtUdef.text);
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


function onChkBlank() {
    if (globalDao.curAniName == '') return;
    frameEffect.isBlank = chkBlank.selected;
    updateFramePanelData(globalDao.curAniName);
}