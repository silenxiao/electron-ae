import { ANI_FRAME_TYPE, EvtCenter, AE_Event } from "./EvtCenter";
import { globalDao, cmmAniConf } from "./render-dao";
import { setCurFrameIndex, updateFramePanelData } from "../frame/ani-frame-edit";
import { sysAniFrameOffset } from "../attr/ani-frame-offset";
import { sysAniFrameEffect } from "../attr/ani-frame-effect";
import { setConfName } from "../attr/ani-save";
import PartEntity from "./PartEntity";

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
    //展示
    effectEntity: Map<number, PartEntity>;
    hitEntity: Map<number, PartEntity>;
    hasHero: boolean = false;
    heroEntity: PartEntity;
    hasEnemy: boolean = false;
    enemyEntity: PartEntity;
    totalFrameNum: number;
    aniFrameNum: number;

    constructor(val: AniInfo) {
        super()
        this.aniInfo = val;
        this.effectEntity = new Map<number, PartEntity>();
        this.hitEntity = new Map<number, PartEntity>();

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
        this.aniFrameNum = this.totalFrameNum = this.frameIndxs.length;
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
            this.playOver();
            this.image.texture = null;
            return;
        }
        let playIndex = frameIndx
        //播放最后一帧
        if (frameIndx >= this.aniFrameNum) {
            playIndex = this.aniFrameNum - 1;
        }
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
        this.setImageOffset(frameEffect.offsetX, frameEffect.offsetY);

        if (frameEffect.isEffect) {
            let party = this.effectEntity.get(this.curFrameIndex);
            if (party) {
                this.addChild(party);
                party.isActive = true;
                if (this.totalFrameNum < party.totalFrameNum) this.totalFrameNum = party.totalFrameNum;
            }
        }

        if (frameEffect.isHit) {
            let party = this.hitEntity.get(this.curFrameIndex);
            if (party) {
                this.addChild(party);
                party.isActive = true;
                if (this.totalFrameNum < party.totalFrameNum) this.totalFrameNum = party.totalFrameNum;
            }

            if (this.enemyEntity && this.enemyEntity.isActive) {
                this.enemyEntity.setBeginIndex(frameIndx);
                if (this.totalFrameNum < this.enemyEntity.totalFrameNum) this.totalFrameNum = this.enemyEntity.totalFrameNum;
            }
        }
        if (this.enemyEntity && this.enemyEntity.isActive) {
            this.enemyEntity.setTexture(frameIndx)
        }

        this.effectEntity.forEach(val => {
            if (val.isActive) val.setTexture(frameIndx)
        });
        this.hitEntity.forEach(val => {
            if (val.isActive) val.setTexture(frameIndx)
        })

        if (this.heroEntity && this.heroEntity.isActive) {
            if (this.totalFrameNum < this.heroEntity.totalFrameNum) this.totalFrameNum = this.heroEntity.totalFrameNum;
            this.heroEntity.setTexture(frameIndx);
        }

        if (frameIndx >= this.totalFrameNum - 1) {
            this.playOver();
        }
    }

    playOver() {
        this.totalFrameNum = this.aniFrameNum;
        EvtCenter.send(AE_Event.ANI_PLAYOVER, this.aniInfo.aniName);
    }

    //设置当前帧的附加信息
    private setImageOffset(offsetX: number, offsetY: number) {
        this.container.x = offsetX;
        this.container.y = offsetY;
    }

    //获取帧的效果数据
    private getFrameEffect(frameIndx: number): FrameEffect {
        if (frameIndx >= this.aniFrameNum)
            this.frameEffects[frameIndx] = { isEffect: false, isHit: false, hitXY: [0, 0], offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: -1, indxId: frameIndx, isBlank: false };
        if (!this.frameEffects[frameIndx])
            this.frameEffects[frameIndx] = { isEffect: false, isHit: false, hitXY: [0, 0], offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: frameIndx, indxId: frameIndx, isBlank: false }
        return this.frameEffects[frameIndx];
    }

    //同步帧数据到面板
    sysFrameDataToPanel() {
        if (this.curFrameIndex >= this.aniFrameNum) return;
        let frameEffect: FrameEffect = this.getFrameEffect(this.curFrameIndex);
        sysAniFrameOffset(frameEffect.offsetX, frameEffect.offsetY);
        sysAniFrameEffect(frameEffect,
            this.getEffectName(this.curFrameIndex), this.getHitName(this.curFrameIndex),
            this.hasHero, this.heroEntity?.aniInfo.aniName,
            this.hasEnemy, this.enemyEntity?.aniInfo.aniName);
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
                this.frameEffects.splice(0, 0, { isEffect: false, isHit: false, hitXY: [0, 0], offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: -1, indxId: this.indxId, isBlank: true });
                this.indxId++;
            }
        }
        this.blankNum = num;
        this.aniFrameNum = this.totalFrameNum = this.frameIndxs.length;
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
        this.aniFrameNum = this.totalFrameNum = this.frameIndxs.length;
        this.setTexture(this.curFrameIndex);
    }

    //插入当前帧
    insertFrame(frameIndex: number) {
        this.frameIndxs.splice(this.curFrameIndex, 0, this.frameIndxs[frameIndex]);
        let frameEffect = this.getCopyFrameEffect(frameIndex);
        this.frameEffects.splice(this.curFrameIndex, 0, frameEffect);
        this.aniFrameNum = this.totalFrameNum = this.frameIndxs.length;
    }

    /**插入多帧 */
    insertRangeFrame(beginIndex: number, endIndex: number) {
        let copyIndexs: number[] = [];
        let copyEffects: FrameEffect[] = [];
        for (let i = beginIndex; i <= endIndex; i++) {
            copyIndexs.push(this.frameIndxs[i]);
            copyEffects.push(this.getCopyFrameEffect(i))
        }

        this.frameIndxs.splice(this.curFrameIndex, 0, ...copyIndexs);
        this.frameEffects.splice(this.curFrameIndex, 0, ...copyEffects);
        this.aniFrameNum = this.totalFrameNum = this.frameIndxs.length;
    }


    private getCopyFrameEffect(index: number): FrameEffect {
        let frameData = JSON.parse(JSON.stringify(this.getFrameEffect(index)));
        frameData.isEffect = false;
        frameData.isHit = false;
        frameData.hitType = 0;
        frameData.frameId = this.indxId;
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
        this.frameIndxs.splice(this.curFrameIndex, 1);
        this.frameEffects.splice(this.curFrameIndex, 1);
        this.setTexture(this.curFrameIndex);
        this.aniFrameNum = this.totalFrameNum = this.frameIndxs.length;
    }


    //设置锁定
    setLock(val: boolean) {
        this.isLocked = val;
    }

    //设置镜像
    setScale(val: boolean) {
        if (val) {
            this.scaleX = -1;
        } else {
            this.scaleX = 1;
        }
    }

    /* 动画拖拽 */
    private onMouseDown(evt: Laya.Event) {
        EvtCenter.send(AE_Event.ANI_SELECTED, this.aniInfo.aniName);
        if (this.isLocked) return;
        this.isDraging = true;
        if (globalDao.frameDrag) {
            this.container.startDrag();
        } else {
            this.startDrag();
        }
    }

    private onMouseUp(evt: Laya.Event) {
        if (this.isDraging) {
            this.isDraging = false;
            if (globalDao.frameDrag) {
                this.container.stopDrag();
                this.getFrameEffect(this.curFrameIndex).offsetX = this.container.x;
                this.getFrameEffect(this.curFrameIndex).offsetY = this.container.y;
                sysAniFrameOffset(this.container.x, this.container.y);
            } else {
                this.stopDrag();
            }
        }
    }

    //被选中
    set selected(val: boolean) {
        if (val) {
            this.showFilter();
            setConfName(this.confName);
        } else {
            this.image.filters = null;
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
                this.getFrameEffect(this.curFrameIndex).offsetX = this.container.x = val;
                break;
            case ANI_FRAME_TYPE.ANI_FRAME_OFFSETY:
                this.getFrameEffect(this.curFrameIndex).offsetY = this.container.y = val;
                break;
            case ANI_FRAME_TYPE.ANI_FRAME_OFFSETX_RESET:
                if (this.curFrameIndex > 0)
                    this.getFrameEffect(this.curFrameIndex).offsetX = this.container.x = this.frameEffects[this.curFrameIndex - 1].offsetX;
                else
                    this.getFrameEffect(this.curFrameIndex).offsetX = this.container.x = 0;
                sysAniFrameOffset(this.image.x, this.image.y);
                break;
            case ANI_FRAME_TYPE.ANI_FRAME_OFFSETY_RESET:
                if (this.curFrameIndex > 0)
                    this.getFrameEffect(this.curFrameIndex).offsetY = this.container.y = this.frameEffects[this.curFrameIndex - 1].offsetY;
                else
                    this.getFrameEffect(this.curFrameIndex).offsetY = this.container.y = 0;
                sysAniFrameOffset(this.image.x, this.image.y);
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
            sysAniFrameOffset(frameEffect.offsetX, frameEffect.offsetY);
        }
    }

    //保存当前帧偏移数据
    saveCurFrameOffsetData() {
        let frameEffect = this.getFrameEffect(this.curFrameIndex);
        let defFrameData = this.defFrameEffects[frameEffect.indxId];
        if (defFrameData) {
            defFrameData.offsetX = frameEffect.offsetX;
            defFrameData.offsetY = frameEffect.offsetY;
        } else {
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
            frameEffect.hitXY = defFrameEffect.hitXY;
            frameEffect.layLevel = defFrameEffect.layLevel;
            this.sysFrameDataToPanel();
        }
    }

    //保存当前帧效果数据
    saveCurFrameEffectData() {
        let frameEffect = this.getFrameEffect(this.curFrameIndex);
        let defFrameEffect = this.defFrameEffects[frameEffect.indxId];
        if (defFrameEffect) {
            defFrameEffect.isEffect = frameEffect.isEffect;
            defFrameEffect.isHit = frameEffect.isHit;
            defFrameEffect.hitXY = frameEffect.hitXY;
            defFrameEffect.layLevel = frameEffect.layLevel;
        } else {
            this.defFrameEffects[frameEffect.indxId] = JSON.parse(JSON.stringify(frameEffect));
        }
    }

    //重置帧数据
    resetFramesData() {
        this.frameEffects = JSON.parse(JSON.stringify(this.aniInfo.frameEffects));
        this.frameIndxs = JSON.parse(JSON.stringify(this.aniInfo.frameIndxs));
        let total = this.aniFrameNum - 1;
        if (this.curFrameIndex > total) {
            this.setTexture(total);
            setCurFrameIndex(total, this)
        }
        this.sysFrameDataToPanel();
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
        let frameEffects: FrameEffect[] = cmmAniConf.get(confName);
        this.setConfEffect(confName, frameEffects);
    }

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
        }
        this.frameEffects = frameEffects;
        updateFramePanelData(this.aniInfo.aniName);
        if (this.aniInfo.aniName == globalDao.curAniName) {
            this.sysFrameDataToPanel();
        }
        this.setTexture(this.curFrameIndex);
    }

    bindEffect(val: PartEntity) {
        this.effectEntity.set(this.curFrameIndex, val);
        val.setBeginIndex(this.curFrameIndex);
        this.sysFrameDataToPanel();
    }

    getEffectName(frameIndex: number) {
        let enity = this.effectEntity.get(frameIndex);
        if (enity) {
            return enity.aniInfo.aniName;
        }
        return "";
    }

    bindHit(val: PartEntity) {
        this.hitEntity.set(this.curFrameIndex, val);
        val.setBeginIndex(this.curFrameIndex);
        this.sysFrameDataToPanel();
    }

    getHitName(frameIndex: number) {
        let enity = this.hitEntity.get(frameIndex);
        if (enity) {
            return enity.aniInfo.aniName;
        }
        return "";
    }

    bindHero(val: PartEntity) {
        this.heroEntity = val;
        val.isActive = this.hasHero;
        if (this.hasHero) {
            this.addChildAt(this.heroEntity, 0);
            this.addBlankFrame(this.heroEntity.effectFrameIndex);
            updateFramePanelData(this.aniInfo.aniName);
        }
        this.sysFrameDataToPanel();
    }

    bindEnemy(val: PartEntity) {
        this.enemyEntity = val;
        val.setScale(true);
        val.isActive = this.hasEnemy;
        if (this.hasEnemy) {
            this.addChild(this.enemyEntity);
            this.enemyEntity.x = 500;
            this.x = 160;
        }
        this.sysFrameDataToPanel();
    }

    updateHero(val: boolean) {
        this.hasHero = val;
        if (!this.heroEntity) return;
        if (val) {
            //显示绑定的模型
            this.addChildAt(this.heroEntity, 0);
            this.addBlankFrame(this.heroEntity.effectFrameIndex);
        } else {
            this.removeChild(this.heroEntity);
            this.addBlankFrame(0);
        }
        updateFramePanelData(this.aniInfo.aniName);
        this.heroEntity.isActive = val;
    }

    updateEnemy(val: boolean) {
        this.hasEnemy = val;
        if (!this.enemyEntity) return;
        if (val) {
            this.addChild(this.enemyEntity)
            this.enemyEntity.x = 500;
            this.x = 160;
        } else {
            this.removeChild(this.enemyEntity);
        }
        this.enemyEntity.isActive = val;
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
        this.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        this.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        EvtCenter.off(AE_Event.ANI_FRAME_EVENT, this, this.aniFrameEvent);
    }
}