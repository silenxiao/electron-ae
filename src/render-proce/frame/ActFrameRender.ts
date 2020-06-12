export default class ActFrameRender extends Laya.Box {
    frameEff: Laya.Image;
    frameHit: Laya.Image;
    frameHide: Laya.Image;
    frameLayer: Laya.Image;
    frameUdef: Laya.Image;
    frameFire: Laya.Image;
    txtFrame: Laya.Label;
    frameData: FrameEffect
    constructor() {
        super()
    }

    onEnable() {
        this.frameEff = this.getChildByName('frameEff') as Laya.Image;
        this.frameEff.visible = false;

        this.frameHit = this.getChildByName('frameHit') as Laya.Image;
        this.frameHit.visible = false;

        this.frameLayer = this.getChildByName('frameLayer') as Laya.Image;
        this.frameLayer.visible = false;

        this.frameUdef = this.getChildByName('frameUdef') as Laya.Image;
        this.frameUdef.visible = false;

        this.frameFire = this.getChildByName('frameFire') as Laya.Image;
        this.frameFire.visible = false;

        this.frameHide = this.getChildByName('frameHide') as Laya.Image;
        this.frameHide.visible = false;

        this.txtFrame = this.getChildByName('txtFrame') as Laya.Label;
        this.on(Laya.Event.DOUBLE_CLICK, this, this.onClick)
    }

    onClick(evt: Laya.Event) {
        if (this.frameData) {
            this.frameData.isHide = !this.frameData.isHide;
            this.frameHide.visible = this.frameData.isHide;
        }
    }

    setData(val: FrameEffect) {
        if (!val) return;
        this.frameData = val;
        this.frameHide.visible = this.frameData.isHide;
        this.frameEff.visible = (val.isEffect != 0);
        this.frameHit.visible = (val.hitXY.length > 0);
        this.frameLayer.visible = (val.layLevel != 0);
        this.frameFire.visible = (val.fireXY.length > 0);
        this.frameUdef.visible = (val.lblName != '');
        if (val.isBlank) {
            this.txtFrame.text = '•';
        } else {
            this.txtFrame.text = val.copyIndex.toString();
        }
    }
}