/**
 * 主场景中显示的实体对象
 */
export default class PartEntity extends Laya.Sprite {
    /** 动画信息 **/
    aniInfo: AniInfo;
    curFrameIndex = 0;
    //帧序列id
    frameIndxs: number[] = [];
    //修改后的帧信息
    frameEffects: FrameEffect[] = [];
    //导入的配置
    confName: string = '';
    //帧数据的唯一id
    indxId: number;
    //当前显示对象
    image: Laya.Sprite;

    isResLoaded = false;
    //拖拽中
    isDraging = true;
    //当前的空白帧
    blankNum = 0;
    isActive: boolean;
    aniFrameNum: number;

    glowFilter = new Laya.GlowFilter("#ff0000", 5, 0, 0);

    beginIndex: number = 0;
    effectFrameIndex: number = 0;

    isSkill: boolean = false;

    constructor(val: AniInfo, isSkill: boolean = true) {
        super()
        this.aniInfo = val;
        this.isSkill = isSkill;

        this.frameIndxs = JSON.parse(JSON.stringify(val.frameIndxs));
        this.aniFrameNum = this.frameIndxs.length;
        this.indxId = this.frameIndxs.length;
        this.frameEffects = JSON.parse(JSON.stringify(val.frameEffects));
        for (let i = 0; i < this.frameEffects.length; i++) {
            if (this.frameEffects[i].isEffect) {
                this.effectFrameIndex = i;
            }
        }
        //设置点击区域
        this.hitArea = new Laya.Rectangle(-this.aniInfo.pivot.x, -this.aniInfo.pivot.y, this.aniInfo.pivot.x * 2, this.aniInfo.pivot.y);

        this.image = new Laya.Sprite();
        this.addChild(this.image);

        this.isResLoaded = false;
        if (val.images.length > 0) {
            Laya.loader.load(val.images, Laya.Handler.create(this, this.onAssetsLoaded));
        }

        //拖拽
        this.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
    }

    //资源加载完毕
    private onAssetsLoaded() {
        this.image.pivot(this.aniInfo.pivot.x, this.aniInfo.pivot.y);
        this.isResLoaded = true;
        this.setTexture(this.curFrameIndex);
    }

    get totalFrameNum() {
        return this.aniFrameNum + this.beginIndex;
    }

    //设置帧纹理
    setTexture(frameIndx: number) {
        frameIndx = frameIndx - this.beginIndex;
        this.curFrameIndex = frameIndx;
        if (!this.isResLoaded) return;
        if (frameIndx >= this.aniFrameNum || frameIndx == -1) {
            if (this.isSkill) {
                this.parent.removeChild(this);
                this.isActive = false;
                this.image.texture = null;
            } else {
                this.image.x = 0;
                this.image.y = 0;
            }
            return;
        }
        let resPath = this.aniInfo.images[this.frameIndxs[frameIndx]];
        if (resPath != '' && resPath != undefined) {
            let texture = Laya.loader.getRes(resPath);
            this.image.texture = Laya.loader.getRes(resPath);
            this.image.width = texture.width;
            this.image.height = texture.height;
        } else {
            this.image.texture = null;
        }
        let frameEffect = this.getFrameEffect(frameIndx);
        this.setImageOffset(frameEffect.offsetX, frameEffect.offsetY);
    }

    //设置当前帧的附加信息
    private setImageOffset(offsetX: number, offsetY: number) {
        this.image.x = offsetX;
        this.image.y = offsetY;
    }

    //获取帧的效果数据
    private getFrameEffect(frameIndx: number): FrameEffect {
        if (frameIndx >= this.aniFrameNum)
            return { isEffect: false, isHit: false, hitXY: [0, 0], offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: -1, indxId: frameIndx, isBlank: false };
        if (!this.frameEffects[frameIndx])
            this.frameEffects[frameIndx] = { isEffect: false, isHit: false, hitXY: [0, 0], offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: frameIndx, indxId: frameIndx, isBlank: false }
        return this.frameEffects[frameIndx];
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
        this.setTexture(this.curFrameIndex);
    }

    setBeginIndex(val: number): void {
        this.beginIndex = val;
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
        this.isDraging = true;
        this.startDrag();
    }

    private onMouseUp(evt: Laya.Event) {
        if (this.isDraging) {
            this.isDraging = false;
            this.stopDrag();
        }
    }

    //实体销毁
    destroy() {
        this.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        this.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
    }
}