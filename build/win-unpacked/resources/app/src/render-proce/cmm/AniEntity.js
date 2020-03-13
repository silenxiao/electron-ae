"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EvtCenter_1 = require("./EvtCenter");
const render_dao_1 = require("./render-dao");
const ani_frame_edit_1 = require("../frame/ani-frame-edit");
const ani_frame_offset_1 = require("../attr/ani-frame-offset");
const ani_frame_effect_1 = require("../attr/ani-frame-effect");
const ani_save_1 = require("../attr/ani-save");
/**
 * 主场景中显示的实体对象
 */
class AniEntity extends Laya.Sprite {
    constructor(val) {
        super();
        this.curFrameIndex = 0;
        //帧序列id
        this.frameIndxs = [];
        //默认的帧信息
        this.defFrameEffects = [];
        //修改后的帧信息
        this.frameEffects = [];
        //导入的配置名
        this.confName = '';
        this.isResLoaded = false;
        //锁定
        this.isLocked = false;
        //拖拽中
        this.isDraging = true;
        //当前的空白帧
        this.blankNum = 0;
        this.glowFilter = new Laya.GlowFilter("#ff0000", 5, 0, 0);
        this.aniInfo = val;
        this.frameIndxs = JSON.parse(JSON.stringify(val.frameIndxs));
        this.indxId = this.frameIndxs.length;
        this.defFrameEffects = JSON.parse(JSON.stringify(val.frameEffects));
        this.frameEffects = JSON.parse(JSON.stringify(val.frameEffects));
        //设置点击区域
        this.hitArea = new Laya.Rectangle(-512, -1024, 1024, 2048);
        this.image = new Laya.Sprite();
        this.addChild(this.image);
        this.isResLoaded = false;
        if (val.images.length > 0) {
            Laya.loader.load(val.images, Laya.Handler.create(this, this.onAssetsLoaded));
        }
        //拖拽
        this.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        EvtCenter_1.EvtCenter.on(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, this, this.aniFrameEvent);
    }
    //资源加载完毕
    onAssetsLoaded() {
        this.image.pivot(this.aniInfo.pivot.x, this.aniInfo.pivot.y);
        this.isResLoaded = true;
        this.setTexture(this.curFrameIndex);
    }
    get totalFrameNum() {
        return this.frameIndxs.length;
    }
    //设置帧纹理
    setTexture(frameIndx) {
        this.curFrameIndex = frameIndx;
        if (!this.isResLoaded)
            return;
        if (frameIndx >= this.totalFrameNum || frameIndx == -1) {
            this.image.texture = null;
            return;
        }
        let resPath = this.aniInfo.images[this.frameIndxs[frameIndx]];
        if (resPath != '' && resPath != undefined) {
            let texture = Laya.loader.getRes(resPath);
            this.image.texture = Laya.loader.getRes(resPath);
            this.image.width = texture.width;
            this.image.height = texture.height;
        }
        else {
            this.image.texture = null;
        }
        let frameEffect = this.getFrameEffect(frameIndx);
        this.setImageOffset(frameEffect.offsetX, frameEffect.offsetY);
    }
    //设置当前帧的附加信息
    setImageOffset(offsetX, offsetY) {
        this.image.x = offsetX;
        this.image.y = offsetY;
    }
    //获取帧的效果数据
    getFrameEffect(frameIndx) {
        if (frameIndx >= this.totalFrameNum)
            return { isEffect: false, isHit: false, hitType: 0, offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: -1, indxId: frameIndx };
        if (!this.frameEffects[frameIndx])
            this.frameEffects[frameIndx] = { isEffect: false, isHit: false, hitType: 0, offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: frameIndx, indxId: frameIndx };
        return this.frameEffects[frameIndx];
    }
    //同步帧数据到面板
    sysFrameDataToPanel() {
        let frameEffect = this.getFrameEffect(this.curFrameIndex);
        ani_frame_offset_1.sysAniFrameOffset(frameEffect.offsetX, frameEffect.offsetY);
        ani_frame_effect_1.sysAniFrameEffect(frameEffect);
    }
    //增加空白帧
    addBlankFrame(num) {
        if (num == this.blankNum)
            return;
        if (num < this.blankNum) {
            this.frameIndxs.splice(0, this.blankNum - num);
            this.frameEffects.splice(0, this.blankNum - num);
        }
        else {
            for (let i = this.blankNum; i < num; i++) {
                this.frameIndxs.splice(0, 0, -1);
                this.frameEffects.splice(0, 0, { isEffect: false, isHit: false, hitType: 0, offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: -1, indxId: this.indxId });
                this.indxId++;
            }
        }
        this.blankNum = num;
        this.setTexture(this.curFrameIndex);
    }
    //增加复制帧
    addCopyFrameNum(num) {
        this.resetFramesData();
        if (num < 2)
            return;
        let tmpFrameIndxs = [];
        let tmpFrameEffects = [];
        for (let i = 0; i < this.frameIndxs.length; i++) {
            tmpFrameIndxs.push(this.frameIndxs[i]);
            tmpFrameEffects.push(this.getFrameEffect(i));
            for (let j = 1; j < num; j++) {
                tmpFrameIndxs.push(this.frameIndxs[i]);
                let frameData = this.getCopyFrameEffect(i);
                tmpFrameEffects.push(frameData);
            }
        }
        this.frameIndxs = tmpFrameIndxs;
        this.frameEffects = tmpFrameEffects;
        let t = this.blankNum;
        this.blankNum = 0;
        this.addBlankFrame(t);
        this.setTexture(this.curFrameIndex);
    }
    //插入当前帧
    insertFrame() {
        this.frameIndxs.splice(this.curFrameIndex, 0, this.frameIndxs[this.curFrameIndex]);
        let frameEffect = this.getCopyFrameEffect(this.curFrameIndex);
        this.frameEffects.splice(this.curFrameIndex, 0, frameEffect);
    }
    getCopyFrameEffect(index) {
        let frameData = JSON.parse(JSON.stringify(this.getFrameEffect(index)));
        frameData.isEffect = false;
        frameData.isHit = false;
        frameData.hitType = 0;
        frameData.frameId = this.indxId;
        this.indxId++;
        return frameData;
    }
    //覆盖当前帧
    rewriteCurFrame(oldIndex) {
        this.frameIndxs[this.curFrameIndex] = this.frameIndxs[oldIndex];
        this.frameEffects[this.curFrameIndex] = this.getCopyFrameEffect(oldIndex);
        this.setTexture(this.curFrameIndex);
    }
    //删除当前帧
    delCurFrame() {
        this.frameIndxs.splice(this.curFrameIndex, 1);
        this.frameEffects.splice(this.curFrameIndex, 1);
        this.setTexture(this.curFrameIndex);
    }
    //设置锁定
    setLock(val) {
        this.isLocked = val;
    }
    //设置镜像
    setScale(val) {
        if (val) {
            this.scaleX = -1;
        }
        else {
            this.scaleX = 1;
        }
    }
    /* 动画拖拽 */
    onMouseDown(evt) {
        EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_SELECTED, this.aniInfo.aniName);
        if (this.isLocked)
            return;
        this.isDraging = true;
        if (render_dao_1.globalDao.frameDrag) {
            this.image.startDrag();
        }
        else {
            this.startDrag();
        }
    }
    onMouseUp(evt) {
        if (this.isDraging) {
            this.isDraging = false;
            if (render_dao_1.globalDao.frameDrag) {
                this.image.stopDrag();
                this.getFrameEffect(this.curFrameIndex).offsetX = this.image.x;
                this.getFrameEffect(this.curFrameIndex).offsetY = this.image.y;
                ani_frame_offset_1.sysAniFrameOffset(this.image.x, this.image.y);
            }
            else {
                this.stopDrag();
            }
        }
    }
    //被选中
    set selected(val) {
        if (val) {
            this.showFilter();
            ani_save_1.setConfName(this.confName);
        }
        else {
            this.image.filters = null;
        }
    }
    //显示发光
    showFilter() {
        if (render_dao_1.globalDao.showSelected) {
            this.image.filters = [this.glowFilter];
        }
        else {
            this.image.filters = null;
        }
    }
    //动画帧事件
    aniFrameEvent(type, val) {
        if (render_dao_1.globalDao.curAniName != this.aniInfo.aniName)
            return;
        switch (type) {
            case EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAMES_RESET:
                this.resetFramesData();
                break;
            case EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAMES_SAVE:
                this.saveFramesData();
                break;
            case EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_EFFECT_RESET:
                this.resetCurFrameEffectData();
                break;
            case EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_EFFECT_SAVE:
                this.saveCurFrameEffectData();
                break;
            case EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSET_RESET:
                this.resetCurFrameOffsetData();
                break;
            case EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSET_SAVE:
                this.saveCurFrameOffsetData();
                break;
            case EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSETX:
                this.getFrameEffect(this.curFrameIndex).offsetX = this.image.x = val;
                break;
            case EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSETY:
                this.getFrameEffect(this.curFrameIndex).offsetY = this.image.y = val;
                break;
            case EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSETX_RESET:
                if (this.curFrameIndex > 0)
                    this.getFrameEffect(this.curFrameIndex).offsetX = this.image.x = this.frameEffects[this.curFrameIndex - 1].offsetX;
                else
                    this.getFrameEffect(this.curFrameIndex).offsetX = this.image.x = 0;
                ani_frame_offset_1.sysAniFrameOffset(this.image.x, this.image.y);
                break;
            case EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSETY_RESET:
                if (this.curFrameIndex > 0)
                    this.getFrameEffect(this.curFrameIndex).offsetY = this.image.y = this.frameEffects[this.curFrameIndex - 1].offsetY;
                else
                    this.getFrameEffect(this.curFrameIndex).offsetY = this.image.y = 0;
                ani_frame_offset_1.sysAniFrameOffset(this.image.x, this.image.y);
                break;
        }
    }
    //重置当前帧偏移数据
    resetCurFrameOffsetData() {
        let frameEffect = this.getFrameEffect(this.curFrameIndex);
        let defFrameData = this.defFrameEffects[frameEffect.indxId];
        if (defFrameData) {
            frameEffect.offsetX = defFrameData.offsetX;
            frameEffect.offsetY = defFrameData.offsetY;
            this.setImageOffset(frameEffect.offsetX, frameEffect.offsetY);
            ani_frame_offset_1.sysAniFrameOffset(frameEffect.offsetX, frameEffect.offsetY);
        }
    }
    //保存当前帧偏移数据
    saveCurFrameOffsetData() {
        let frameEffect = this.getFrameEffect(this.curFrameIndex);
        let defFrameData = this.defFrameEffects[frameEffect.indxId];
        if (defFrameData) {
            defFrameData.offsetX = frameEffect.offsetX;
            defFrameData.offsetY = frameEffect.offsetY;
        }
        else {
            this.defFrameEffects[frameEffect.indxId] = JSON.parse(JSON.stringify(frameEffect));
        }
    }
    //重置当前帧效果数据
    resetCurFrameEffectData() {
        let frameEffect = this.getFrameEffect(this.curFrameIndex);
        let defFrameEffect = this.defFrameEffects[frameEffect.indxId];
        if (defFrameEffect) {
            frameEffect.isEffect = defFrameEffect.isEffect;
            frameEffect.isHit = defFrameEffect.isHit;
            frameEffect.hitType = defFrameEffect.hitType;
            frameEffect.layLevel = defFrameEffect.layLevel;
            ani_frame_effect_1.sysAniFrameEffect(frameEffect);
        }
    }
    //保存当前帧效果数据
    saveCurFrameEffectData() {
        let frameEffect = this.getFrameEffect(this.curFrameIndex);
        let defFrameEffect = this.defFrameEffects[frameEffect.indxId];
        if (defFrameEffect) {
            defFrameEffect.isEffect = frameEffect.isEffect;
            defFrameEffect.isHit = frameEffect.isHit;
            defFrameEffect.hitType = frameEffect.hitType;
            defFrameEffect.layLevel = frameEffect.layLevel;
        }
        else {
            this.defFrameEffects[frameEffect.indxId] = JSON.parse(JSON.stringify(frameEffect));
        }
    }
    //重置帧数据
    resetFramesData() {
        this.frameEffects = JSON.parse(JSON.stringify(this.aniInfo.frameEffects));
        this.frameIndxs = JSON.parse(JSON.stringify(this.aniInfo.frameIndxs));
        let total = this.totalFrameNum - 1;
        if (this.curFrameIndex > total) {
            this.setTexture(total);
            ani_frame_edit_1.setCurFrameIndex(total, this);
        }
        this.sysFrameDataToPanel();
    }
    //保存帧数据
    saveFramesData() {
        this.aniInfo.frameEffects = JSON.parse(JSON.stringify(this.frameEffects));
        this.aniInfo.frameIndxs = JSON.parse(JSON.stringify(this.frameIndxs));
    }
    ///设置帧特效数据
    setCmmEffect(confName) {
        if (confName == "")
            this.confName = confName;
        let frameEffects = render_dao_1.cmmAniConf.get(confName);
        if (frameEffects == null) {
            frameEffects = JSON.parse(JSON.stringify(this.aniInfo.frameEffects));
        }
        this.frameIndxs = [];
        for (let i = 0; i < frameEffects.length; i++) {
            let frameEffect = frameEffects[i];
            if (frameEffect.copyIndex >= 0)
                this.frameIndxs.push(frameEffect.copyIndex);
            else
                this.frameIndxs.push(-1);
            frameEffect.indxId = i;
        }
        this.frameEffects = frameEffects;
        ani_frame_edit_1.updateFramePanelData(this.aniInfo.aniName);
        if (this.aniInfo.aniName == render_dao_1.globalDao.curAniName) {
            this.sysFrameDataToPanel();
        }
        this.setTexture(this.curFrameIndex);
    }
    //实体销毁
    destroy() {
        this.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        this.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        EvtCenter_1.EvtCenter.off(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, this, this.aniFrameEvent);
    }
}
exports.default = AniEntity;