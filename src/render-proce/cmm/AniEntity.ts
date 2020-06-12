import { ANI_FRAME_TYPE, EvtCenter, AE_Event } from "./EvtCenter";
import { globalDao, cmmAniConf, aniEntityDict, confParam } from "./render-dao";
import { setCurFrameIndex, updateFramePanelData } from "../frame/ani-frame-edit";
import { sysAniFrameOffset } from "../attr/ani-frame-offset";
import { sysAniFrameEffect } from "../attr/ani-frame-effect";
import { setConfName } from "../attr/ani-save";

/**
 * 主场景中显示的实体对象
 */
export default class AniEntity extends Laya.Sprite {
    /** 动画信息 **/
    aniInfo: AniInfo;
    curFrameIndex = 0;
    //帧序列id
    frameIndxs: number[] = [];
    //默认的帧信息
    defFrameEffects: FrameEffect[] = [];
    //修改后的帧信息
    frameEffects: FrameEffect[] = [];
    //导入的配置
    confName: string = '';
    //帧数据的唯一id
    indxId: number;
    /**  */
    container: Laya.Sprite;
    //当前显示对象
    image: Laya.Sprite;

    isResLoaded = false;
    //锁定
    isLocked = false;
    //拖拽中
    isDraging = true;
    //当前的空白帧
    blankNum = 0;

    glowFilter = new Laya.GlowFilter("#ff0000", 5, 0, 0);
    //技能效果
    effects: string[];
    //命中效果
    hits: string[];

    totalFrameNum: number;
    //aniFrameNum: number;

    /** 挂载的对象 */
    bindTarget: string = "";
    /** 攻击目标的动画名 */
    atkTarget: string = "";
    isFollow: boolean = true;

    flyPoint: Point[] = [];

    constructor(val: AniInfo) {
        super()
        this.aniInfo = val;
        this.effects = [];
        this.hits = [];

        this.frameIndxs = JSON.parse(JSON.stringify(val.frameIndxs));
        this.indxId = this.frameIndxs.length;
        this.defFrameEffects = JSON.parse(JSON.stringify(val.frameEffects));
        this.frameEffects = JSON.parse(JSON.stringify(val.frameEffects));
        //设置点击区域
        this.hitArea = new Laya.Rectangle(-512, -1024, 1024, 2048);

        this.container = new Laya.Sprite();
        this.addChild(this.container);

        this.image = new Laya.Sprite();
        this.container.addChild(this.image);

        this.isResLoaded = false;
        if (val.images.length > 0) {
            Laya.loader.load(val.images, Laya.Handler.create(this, this.onAssetsLoaded));
        }
        //this.aniFrameNum = 
        this.totalFrameNum = this.frameIndxs.length;
        //拖拽
        this.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);

        EvtCenter.on(AE_Event.ANI_FRAME_EVENT, this, this.aniFrameEvent);
    }

    //资源加载完毕
    private onAssetsLoaded() {
        this.image.pivot(this.aniInfo.pivot.x, this.aniInfo.pivot.y);
        this.isResLoaded = true;
        this.setTexture(this.curFrameIndex);
    }

    //设置帧纹理
    setTexture(frameIndx: number) {
        this.curFrameIndex = frameIndx;
        if (!this.isResLoaded) return;
        if (frameIndx >= this.totalFrameNum || frameIndx == -1) {
            this.image.texture = null;
        } else {
            let playIndex = frameIndx
            //播放最后一帧
            /*if (frameIndx >= this.aniFrameNum) {
                playIndex = this.aniFrameNum - 1;
            }*/
            let resPath = this.aniInfo.images[this.frameIndxs[playIndex]];
            if (resPath != '' && resPath != undefined) {
                let texture = Laya.loader.getRes(resPath);
                this.image.texture = Laya.loader.getRes(resPath);
                this.image.width = texture.width;
                this.image.height = texture.height;
            } else {
                this.image.texture = null;
            }
            let frameEffect = this.getFrameEffect(playIndex);
            this.setImageOffset(frameEffect.offset);
        }

        if (frameIndx >= this.totalFrameNum - 1) {
            this.playOver();
        }
    }

    playOver() {
        //this.totalFrameNum = this.aniFrameNum;
        EvtCenter.send(AE_Event.ANI_PLAYOVER, this.aniInfo.aniName);
    }

    //设置当前帧的附加信息
    private setImageOffset(offset: number[]) {
        let target = aniEntityDict.get(this.bindTarget);
        this.image.x = offset[0];
        this.image.y = offset[1];
        if (target && this.isFollow) {
            this.x = target.x;
            this.y = target.y;
            this.container.x = target.container.x + target.image.x;
            this.container.y = target.container.y + target.image.y;
        }
        let point = this.flyPoint[this.curFrameIndex];
        if (point) {
            this.container.x = point.x;// + this.image.x;
            this.container.y = point.y;// + this.image.y;
        }
    }

    //获取帧的效果数据
    private getFrameEffect(frameIndx: number): FrameEffect {
        if (frameIndx >= this.totalFrameNum)
            this.frameEffects[frameIndx] = { isEffect: 0, hitXY: [], offset: [0, 0], fireXY: [], layLevel: 0, copyIndex: -1, indxId: frameIndx, isBlank: false, lblName: '', isHide: false };
        if (!this.frameEffects[frameIndx])
            this.frameEffects[frameIndx] = { isEffect: 0, hitXY: [], offset: [0, 0], fireXY: [], layLevel: 0, copyIndex: frameIndx, indxId: frameIndx, isBlank: false, lblName: '', isHide: false }
        return this.frameEffects[frameIndx];
    }

    //同步帧数据到面板
    sysFrameDataToPanel() {
        if (globalDao.curAniName != this.aniInfo.aniName) return;
        if (globalDao.isPlay) return;
        if (this.curFrameIndex >= this.totalFrameNum) return;
        let frameEffect: FrameEffect = this.getFrameEffect(this.curFrameIndex);
        sysAniFrameOffset(frameEffect.offset[0], frameEffect.offset[1]);
        sysAniFrameEffect(frameEffect,
            this.getEffectName(this.curFrameIndex), this.getHitName(this.curFrameIndex),
            this.atkTarget, this.isFollow, this.flyPoint[this.curFrameIndex]);
    }

    //增加空白帧
    addBlankFrame(num: number) {
        if (num == this.blankNum) return;
        if (num < this.blankNum) {
            this.frameIndxs.splice(0, this.blankNum - num);
            this.frameEffects.splice(0, this.blankNum - num);
        } else {
            for (let i = this.blankNum; i < num; i++) {
                this.frameIndxs.splice(0, 0, -1);
                this.frameEffects.splice(0, 0, { isEffect: 0, hitXY: [], offset: [0, 0], fireXY: [], layLevel: 0, copyIndex: -1, indxId: this.indxId, isBlank: true, lblName: '', isHide: false });
                this.indxId++;
            }
        }
        this.blankNum = num;
        //        this.aniFrameNum = 
        this.totalFrameNum = this.frameIndxs.length;
        this.setTexture(this.curFrameIndex);
    }
    //增加复制帧
    addCopyFrameNum(num: number) {
        this.resetFramesData();
        if (num < 2) return;
        let tmpFrameIndxs: number[] = [];
        let tmpFrameEffects: FrameEffect[] = [];
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
        //        this.aniFrameNum = 
        this.totalFrameNum = this.frameIndxs.length;
        this.setTexture(this.curFrameIndex);
    }

    //插入当前帧
    insertFrame(frameIndex: number) {
        this.insertFrameOnPos(frameIndex, this.curFrameIndex);
    }

    /**在指定位置插入帧 */
    insertFrameOnPos(frameIndex: number, pos: number): FrameEffect {
        this.frameIndxs.splice(pos, 0, this.frameIndxs[frameIndex]);
        let frameEffect = this.getCopyFrameEffect(frameIndex);
        this.frameEffects.splice(pos, 0, frameEffect);
        //this.aniFrameNum = 
        this.totalFrameNum = this.frameIndxs.length;
        return frameEffect;
    }

    /**插入多帧 */
    insertRangeFrame(beginIndex: number, endIndex: number) {
        this.insertRangeFrameOnPos(beginIndex, endIndex, this.curFrameIndex);
    }

    /**在指定的位置插入多帧 */
    insertRangeFrameOnPos(beginIndex: number, endIndex: number, pos: number) {
        let copyIndexs: number[] = [];
        let copyEffects: FrameEffect[] = [];
        for (let i = beginIndex; i <= endIndex; i++) {
            copyIndexs.push(this.frameIndxs[i]);
            copyEffects.push(this.getCopyFrameEffect(i))
        }

        this.frameIndxs.splice(pos, 0, ...copyIndexs);
        this.frameEffects.splice(pos, 0, ...copyEffects);
        //this.aniFrameNum = 
        this.totalFrameNum = this.frameIndxs.length;
    }

    /**在指定的位置插入多帧 */
    insertOriginFrameOnPos(pos: number) {
        let copyIndexs: number[] = [];
        let copyEffects: FrameEffect[] = [];
        for (let i = 0; i < this.aniInfo.frameIndxs.length; i++) {
            copyIndexs.push(this.aniInfo.frameIndxs[i]);
            copyEffects.push(this.getOriginCopyFrameEffect(i))
        }

        this.frameIndxs.splice(pos, 0, ...copyIndexs);
        this.frameEffects.splice(pos, 0, ...copyEffects);
        //this.aniFrameNum = 
        this.totalFrameNum = this.frameIndxs.length;
    }


    private getCopyFrameEffect(index: number): FrameEffect {
        let frameData: FrameEffect = JSON.parse(JSON.stringify(this.getFrameEffect(index)));
        frameData.isEffect = 0;
        frameData.hitXY = [];
        frameData.lblName = '';
        frameData.indxId = this.indxId;
        this.indxId++;
        return frameData;
    }


    private getOriginCopyFrameEffect(index: number): FrameEffect {
        let frameData: FrameEffect = JSON.parse(JSON.stringify(this.aniInfo.frameEffects[index]));
        frameData.isEffect = 0;
        frameData.hitXY = [];
        frameData.lblName = '';
        frameData.indxId = this.indxId;
        this.indxId++;
        return frameData;
    }
    //覆盖当前帧
    rewriteCurFrame(oldIndex: number) {
        this.frameIndxs[this.curFrameIndex] = this.frameIndxs[oldIndex];
        this.frameEffects[this.curFrameIndex] = this.getCopyFrameEffect(oldIndex);
        this.setTexture(this.curFrameIndex);
    }

    //删除当前帧
    delCurFrame() {
        this.delFrameOnPos(this.curFrameIndex);
    }

    delFrameOnPos(pos: number) {
        if (pos < this.blankNum) this.blankNum--;
        this.frameIndxs.splice(pos, 1);
        this.frameEffects.splice(pos, 1);
        //this.aniFrameNum = 
        this.totalFrameNum = this.frameIndxs.length;
        this.setTexture(pos);
    }


    //设置锁定
    setLock(val: boolean) {
        this.isLocked = val;
    }

    //设置镜像
    setScale(val: boolean) {
        if (val) {
            this.image.scaleX = -1;
        } else {
            this.image.scaleX = 1;
        }
        aniEntityDict.get(this.bindTarget)?.updateAtkTarget();
    }

    /* 动画拖拽 */
    private onMouseDown(evt: Laya.Event) {
        EvtCenter.send(AE_Event.ANI_SELECTED, this.aniInfo.aniName);
        if (this.isLocked) return;
        this.isDraging = true;
        if (globalDao.frameDrag) {
            this.image.startDrag();
        } else {
            this.startDrag();
        }
    }

    private onMouseUp(evt: Laya.Event) {
        if (this.isDraging) {
            this.isDraging = false;
            if (globalDao.frameDrag) {
                this.image.stopDrag();
                this.getFrameEffect(this.curFrameIndex).offset[0] = this.image.x;
                this.getFrameEffect(this.curFrameIndex).offset[1] = this.image.y;
                sysAniFrameOffset(this.image.x, this.image.y);
            } else {
                this.stopDrag();
            }
        }
    }

    //被选中
    set selected(val: boolean) {
        if (val) {
            this.showFilter();
            //设置点击区域
            this.hitArea = new Laya.Rectangle(-512, -1024, 1024, 2048);
            setConfName(this.confName);
        } else {
            this.image.filters = null;
            //设置点击区域
            this.hitArea = null;
        }
    }
    //显示发光
    showFilter() {
        if (globalDao.showSelected) {
            this.image.filters = [this.glowFilter];
        } else {
            this.image.filters = null;
        }
    }

    //动画帧事件
    aniFrameEvent(type: string, val: number) {
        if (globalDao.curAniName != this.aniInfo.aniName) return;
        switch (type) {
            case ANI_FRAME_TYPE.ANI_FRAMES_RESET:
                this.resetFramesData();
                break;
            case ANI_FRAME_TYPE.ANI_FRAMES_SAVE:
                this.saveFramesData();
                break;
            case ANI_FRAME_TYPE.ANI_FRAME_EFFECT_RESET:
                this.resetCurFrameEffectData();
                break;
            case ANI_FRAME_TYPE.ANI_FRAME_EFFECT_SAVE:
                this.saveCurFrameEffectData();
                break;
            case ANI_FRAME_TYPE.ANI_FRAME_OFFSET_RESET:
                this.resetCurFrameOffsetData();
                break;
            case ANI_FRAME_TYPE.ANI_FRAME_OFFSET_SAVE:
                this.saveCurFrameOffsetData();
                break;
            case ANI_FRAME_TYPE.ANI_FRAME_OFFSETX:
                this.getFrameEffect(this.curFrameIndex).offset[0] = val;
                this.image.x = val;
                break;
            case ANI_FRAME_TYPE.ANI_FRAME_OFFSETY:
                this.getFrameEffect(this.curFrameIndex).offset[1] = val;
                this.image.y = val;
                break;
            case ANI_FRAME_TYPE.ANI_FRAME_OFFSETX_RESET:
                if (this.curFrameIndex > 0)
                    this.getFrameEffect(this.curFrameIndex).offset[0] = this.image.x = this.frameEffects[this.curFrameIndex - 1].offset[0];
                else
                    this.getFrameEffect(this.curFrameIndex).offset[0] = this.image.x = 0;
                sysAniFrameOffset(this.image.x, this.image.y);
                break;
            case ANI_FRAME_TYPE.ANI_FRAME_OFFSETY_RESET:
                if (this.curFrameIndex > 0)
                    this.getFrameEffect(this.curFrameIndex).offset[1] = this.image.y = this.frameEffects[this.curFrameIndex - 1].offset[1];
                else
                    this.getFrameEffect(this.curFrameIndex).offset[1] = this.image.y = 0;
                sysAniFrameOffset(this.image.x, this.image.y);
                break;
        }
    }

    //重置当前帧偏移数据
    resetCurFrameOffsetData() {
        let frameEffect = this.getFrameEffect(this.curFrameIndex);
        let defFrameData = this.defFrameEffects[frameEffect.indxId];
        if (defFrameData) {
            frameEffect.offset[0] = defFrameData.offset[0];
            frameEffect.offset[1] = defFrameData.offset[1];
            this.setImageOffset(frameEffect.offset);
            sysAniFrameOffset(frameEffect.offset[0], frameEffect.offset[1]);
        }
    }

    //保存当前帧偏移数据
    saveCurFrameOffsetData() {
        let frameEffect = this.getFrameEffect(this.curFrameIndex);
        let defFrameData = this.defFrameEffects[frameEffect.indxId];
        if (defFrameData) {
            defFrameData.offset[0] = frameEffect.offset[0];
            defFrameData.offset[1] = frameEffect.offset[1];
        } else {
            this.defFrameEffects[frameEffect.indxId] = JSON.parse(JSON.stringify(frameEffect));
        }
    }

    //重置当前帧效果数据
    resetCurFrameEffectData() {
        let frameEffect = this.getFrameEffect(this.curFrameIndex);
        let defFrameEffect = this.defFrameEffects[frameEffect.indxId];
        if (defFrameEffect) {
            this.overrideframeEffect(defFrameEffect, frameEffect);
            this.sysFrameDataToPanel();
        }
    }

    //保存当前帧效果数据
    saveCurFrameEffectData() {
        let frameEffect = this.getFrameEffect(this.curFrameIndex);
        let defFrameEffect = this.defFrameEffects[frameEffect.indxId];
        if (defFrameEffect) {
            this.overrideframeEffect(frameEffect, defFrameEffect);
        } else {
            this.defFrameEffects[frameEffect.indxId] = JSON.parse(JSON.stringify(frameEffect));
        }
    }

    overrideframeEffect(srcFrameEffect: FrameEffect, dstFrameEffect: FrameEffect) {
        dstFrameEffect.isEffect = srcFrameEffect.isEffect;
        if (srcFrameEffect.hitXY.length > 0) {
            dstFrameEffect.hitXY[0] = srcFrameEffect.hitXY[0];
            dstFrameEffect.hitXY[1] = srcFrameEffect.hitXY[1];
        } else {
            dstFrameEffect.hitXY = [];
        } 1

        if (srcFrameEffect.offset.length > 0) {
            dstFrameEffect.offset[0] = srcFrameEffect.offset[0];
            dstFrameEffect.offset[1] = srcFrameEffect.offset[1];
        } else {
            dstFrameEffect.offset = [];
        }
        dstFrameEffect.layLevel = srcFrameEffect.layLevel;
        dstFrameEffect.copyIndex = srcFrameEffect.copyIndex;
        dstFrameEffect.lblName = srcFrameEffect.lblName;
        dstFrameEffect.indxId = srcFrameEffect.indxId;
        dstFrameEffect.isBlank = srcFrameEffect.isBlank;
    }


    //重置帧数据
    resetFramesData() {
        this.blankNum = 0;
        this.frameEffects = JSON.parse(JSON.stringify(this.aniInfo.frameEffects));
        this.frameIndxs = JSON.parse(JSON.stringify(this.aniInfo.frameIndxs));
        //this.aniFrameNum = 
        this.totalFrameNum = this.frameIndxs.length;
        let total = this.totalFrameNum - 1;
        if (this.curFrameIndex > total && globalDao.curAniName == this.aniInfo.aniName) {
            this.setTexture(total);
            setCurFrameIndex(total, this)
        }
        this.sysFrameDataToPanel();
        this.effects.forEach((val, key) => {
            let aniEntity = aniEntityDict.get(val);
            for (let i = 0; i < this.frameEffects.length; i++) {
                let frameEffect = this.frameEffects[i];
                if (frameEffect.isEffect) {
                    aniEntity.addBlankFrame(i);
                }
            }
        })

        this.hits.forEach((val, key) => {
            let aniEntity = aniEntityDict.get(val);
            for (let i = 0; i < this.frameEffects.length; i++) {
                let frameEffect = this.frameEffects[i];
                if (frameEffect.isEffect) {
                    aniEntity.addBlankFrame(i);
                }
            }
        })
    }

    //保存帧数据
    saveFramesData() {
        this.aniInfo.frameIndxs = [];
        this.aniInfo.frameEffects = []
        for (let i = 0; i < this.frameIndxs.length; i++) {
            if (this.frameIndxs[i] != -1) {
                this.aniInfo.frameIndxs.push(this.frameIndxs[i]);
                this.aniInfo.frameEffects.push(JSON.parse(JSON.stringify(this.frameEffects[i])));
            }
        }
    }

    ///设置帧特效数据
    setCmmEffect(confName: string) {
        if (confName == "" && this.confName == "") return;
        let frameEffects: FrameEffect[] = cmmAniConf.get(confName);
        this.setConfEffect(confName, frameEffects);
    }

    /**
     * 根据配置设置帧效果
     * @param confName 配置名
     * @param frameEffects 
     */
    setConfEffect(confName: string, frameEffects: FrameEffect[]) {
        this.confName = confName;
        if (frameEffects == null) {
            frameEffects = JSON.parse(JSON.stringify(this.aniInfo.frameEffects));
        } else {
            frameEffects = JSON.parse(JSON.stringify(frameEffects));
        }
        this.frameIndxs = [];
        for (let i = 0; i < frameEffects.length; i++) {
            let frameEffect = frameEffects[i];
            if (frameEffect.copyIndex >= 0)
                this.frameIndxs.push(frameEffect.copyIndex);
            else
                this.frameIndxs.push(-1);
            frameEffect.indxId = i;

            if ('isHit' in (<any>frameEffect)) {
                if ((<any>frameEffect)['isHit'])
                    frameEffect.hitXY = [0, 0];
                else
                    frameEffect.hitXY = [];
                delete (<any>frameEffect)['isHit'];
            }
            if ('hitType' in (<any>frameEffect)) {
                delete (<any>frameEffect)['hitType'];
            }
            if ('offsetX' in (<any>frameEffect)) {
                frameEffect.offset = [(<any>frameEffect)['offsetX'], (<any>frameEffect)['offsetY']];
                delete (<any>frameEffect)['offsetX'];
                delete (<any>frameEffect)['offsetY'];
            }
            if (!('fireXY' in (<any>frameEffect))) {
                frameEffect.fireXY = [];
            }
            if (frameEffect.isEffect) frameEffect.isEffect = 1;
            else frameEffect.isEffect = 0;
            if (frameEffect.offset.length == 0)
                frameEffect.offset = [0, 0];
            frameEffect.lblName = "";
        }
        this.frameEffects = frameEffects;
        updateFramePanelData(this.aniInfo.aniName);
        if (this.aniInfo.aniName == globalDao.curAniName) {
            this.sysFrameDataToPanel();
        }
        //this.aniFrameNum = 
        this.totalFrameNum = this.frameIndxs.length;
        this.setTexture(this.curFrameIndex);
    }

    /**
     * 当前帧绑定特效
     * @param aniName
     */
    bindEffect(aniName: string) {
        let oldAniName = this.effects[this.curFrameIndex];
        let aniEntity = aniEntityDict.get(oldAniName);
        if (aniEntity) aniEntity.bindTarget = "";

        aniEntity = aniEntityDict.get(aniName);
        if (aniEntity) {
            aniEntity.bindTarget = this.aniInfo.aniName;
            this.effects[this.curFrameIndex] = aniName;
            aniEntity.addBlankFrame(this.curFrameIndex);
        } else {
            delete this.effects[this.curFrameIndex];
        }
        this.updateAtkTarget();
    }

    /**
     * 获取指定帧的特效
     * @param frameIndex 第几帧
     */
    getEffectName(frameIndex: number) {
        let aniName = this.effects[frameIndex];
        if (aniName) {
            return aniName;
        }
        return "";
    }

    /**
     * 当前帧绑定命中特效
     * @param aniName 动画名
     */
    bindHit(aniName: string) {
        let oldAniName = this.hits[this.curFrameIndex];
        let aniEntity = aniEntityDict.get(oldAniName);
        if (aniEntity) aniEntity.bindTarget = "";

        aniEntity = aniEntityDict.get(aniName);
        if (aniEntity) {
            aniEntity.bindTarget = this.aniInfo.aniName;
            this.hits[this.curFrameIndex] = aniName;
            aniEntity.addBlankFrame(this.curFrameIndex);
        } else {
            delete this.hits[this.curFrameIndex];
        }
        this.updateAtkTarget();
    }

    /**
     * 获取指定帧的命中特效
     * @param frameIndex 第几帧
     */
    getHitName(frameIndex: number) {
        let aniName = this.hits[frameIndex];
        if (aniName) {
            return aniName;
        }
        return "";
    }

    /**
     * 绑定攻击目标
     * @param aniName 攻击目标动画名
     */
    bindAtkTarget(aniName: string) {
        this.atkTarget = aniName;
        this.updateAtkTarget();
    }

    /**
     * 更新攻击目标被命中的帧数
     */
    updateAtkTarget() {
        if (this.atkTarget == "") return;
        let entity = aniEntityDict.get(this.atkTarget);
        if (!entity) return;
        entity.bindTarget = this.aniInfo.aniName;
        entity.isFollow = false;
        entity.resetFramesData();
        this.flyPoint = [];
        for (let i = 0; i < this.frameEffects.length; i++) {
            let frameEffect = this.frameEffects[i];
            if (frameEffect.hitXY.length > 0) {
                entity.setHitXY(i, frameEffect.hitXY);
            }
        }

        this.effects.forEach((val, key) => {
            let aniEntity = aniEntityDict.get(val);
            let frameEffects = aniEntity.frameEffects;
            for (let i = 0; i < frameEffects.length; i++) {
                let frameEffect = frameEffects[i];
                if (frameEffect.hitXY.length > 0) {
                    entity.setHitXY(i, frameEffect.hitXY);
                }
            }
        })

        this.hits.forEach((val, key) => {
            let aniEntity = aniEntityDict.get(val);
            let frameEffects = aniEntity.frameEffects;
            for (let i = 0; i < frameEffects.length; i++) {
                let frameEffect = frameEffects[i];
                if (frameEffect.hitXY.length > 0) {
                    entity.setHitXY(i, frameEffect.hitXY);
                }
            }
        });
        entity.downToFloor();
    }

    lastStepX: number = 0;
    lastStepY: number = 0;
    lastA: number = 0;
    /**
     * 设置命中的偏移
     * @param frameIdx 指定帧
     * @param hitXY 命中偏移量
     */
    private setHitXY(frameIdx: number, hitXY: number[]) {
        let num = this.aniInfo.frameEffects.length - 1;
        let a = hitXY[0];
        let b = hitXY[1];
        if (this.image.scaleX == 1) a = -a;
        let k = 0;
        if (a != 0) {
            k = b / (a * a)
        }
        if (this.blankNum == 0) {
            this.addBlankFrame(frameIdx);
            this.lastStepX = 0;
            this.lastStepY = 0;
        } else {
            let needToInsert = frameIdx - this.totalFrameNum;
            if (needToInsert >= 0) {
                let lastOffset = this.frameEffects[this.totalFrameNum - 1].offset;
                let lastFrameFlyPoint = this.flyPoint[this.totalFrameNum - 1];
                let ta, tb = 0;
                if (lastFrameFlyPoint) {
                    ta = lastFrameFlyPoint.x;// + lastOffset[0];
                    tb = lastFrameFlyPoint.y + lastOffset[1];
                }
                this.lastStepX = ta;
                this.lastStepY = tb;
                let lastPosX = this.lastStepX + this.lastA;
                let offsetX = 0;
                if (tb != 0)
                    offsetX = -this.lastA * confParam.move_y / tb;

                //根据上次的击退偏移量，掉落
                let i = 0;
                for (; i < needToInsert; i++) {//掉落
                    let insertFrame = this.insertFrameOnPos(this.totalFrameNum - 1, this.totalFrameNum);
                    insertFrame.offset = [0, 0];
                    this.lastStepY += confParam.move_y;

                    this.lastStepX += offsetX;

                    if (Math.abs(this.lastStepX) - Math.abs(lastPosX) > 0) this.lastStepX = lastPosX;

                    if (this.lastStepY > -confParam.move_y / 2) {
                        this.flyPoint[this.totalFrameNum - 1] = { x: this.lastStepX >> 0, y: 0 };
                        this.lastStepY = 0;
                        i++;
                        break;
                    } else {
                        this.flyPoint[this.totalFrameNum - 1] = { x: this.lastStepX >> 0, y: this.lastStepY >> 0 };
                    }
                }
                for (; i < needToInsert; i++) {
                    let insertFrame = this.insertFrameOnPos(this.totalFrameNum - 1, this.totalFrameNum);
                    insertFrame.offset = [0, 0];
                    this.flyPoint[this.totalFrameNum - 1] = { x: this.lastStepX >> 0, y: 0 };
                }
            } else {
                for (let i = needToInsert; i < 0; i++) {
                    this.delFrameOnPos(this.totalFrameNum - 1);
                }
                let lastFrameFlyPoint = this.flyPoint[this.totalFrameNum - 1];
                if (lastFrameFlyPoint) {
                    this.lastStepX = lastFrameFlyPoint.x;
                    this.lastStepY = lastFrameFlyPoint.y;
                }
            }
            //a = a + this.lastStepX
            //b = b - this.lastStepY;
            /*if (a != 0) {
                this.lastStepX += offsetX;
                this.lastStepY = k * (this.lastStepX - a) * (this.lastStepX - a) - b;
            } else {
                this.lastStepY += offsetY;
            }*/
            //插入复制帧
            this.insertOriginFrameOnPos(this.totalFrameNum);
        }
        this.lastA = a;
        let offsetX = a / num;
        //let offsetY = -b / num;
        a = a + this.lastStepX
        b = b - this.lastStepY;
        for (let i = frameIdx; i <= frameIdx + num; i++) {
            this.flyPoint[i] = { x: this.lastStepX >> 0, y: this.lastStepY >> 0 };
            if (offsetX != 0) {
                if (k == 0) {
                    this.lastStepX += a * (frameIdx + num - i) * 2 / ((num + 1) * num);
                    this.lastStepY = 0;
                } else {
                    this.lastStepX += offsetX;
                    this.lastStepY = k * (this.lastStepX - a) * (this.lastStepX - a) - b;
                }
            } else {
                //this.lastStepY += offsetY;

                this.lastStepY += -b * (frameIdx + num - i) * 2 / ((num + 1) * num);
            }
        }
        //this.lastK = k;
    }

    private downToFloor() {
        let lastOffset = this.frameEffects[this.totalFrameNum - 1].offset;
        let lastFrameFlyPoint = this.flyPoint[this.totalFrameNum - 1];
        let ta, tb = 0;
        if (lastFrameFlyPoint) {
            ta = lastFrameFlyPoint.x;// + lastOffset[0];
            tb = lastFrameFlyPoint.y + lastOffset[1];
        }
        this.lastStepX = ta;
        this.lastStepY = tb;
        let offsetX = 0;
        if (tb != 0)
            offsetX = -this.lastA * confParam.move_y / tb;

        let lastPosX = this.lastStepX + this.lastA;

        while (this.lastStepY < 0) {
            let insertFrame = this.insertFrameOnPos(this.totalFrameNum - 1, this.totalFrameNum);
            insertFrame.offset = [0, 0];
            this.lastStepY += confParam.move_y;

            this.lastStepX += offsetX;
            if (Math.abs(this.lastStepX) - Math.abs(lastPosX) > 0) this.lastStepX = lastPosX;
            if (this.lastStepY > -confParam.move_y / 2) {
                this.flyPoint[this.totalFrameNum - 1] = { x: this.lastStepX >> 0, y: 0 };
                this.lastStepY = 0;
            } else {
                this.flyPoint[this.totalFrameNum - 1] = { x: this.lastStepX >> 0, y: this.lastStepY >> 0 };
            }
        }
    }

    resetHitXY() {
        this.bindTarget = "";
        this.resetFramesData();
    }

    updateLayer(val: number) {
        if (val == 0) {
            this.addChildAt(this.image, this.numChildren);
        } else {
            this.addChildAt(this.image, 0);
        }
    }


    //实体销毁
    destroy() {
        this.aniInfo.images.forEach(val => {
            Laya.loader.clearRes(val);
        })
        this.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        this.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        EvtCenter.off(AE_Event.ANI_FRAME_EVENT, this, this.aniFrameEvent);
    }
}