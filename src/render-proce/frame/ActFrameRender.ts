export default class ActFrameRender extends Laya.Box {
    frameEff: Laya.Image;
    frameHit: Laya.Image;
    frameLayer: Laya.Image;
    txtFrame: Laya.Label;

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

        this.txtFrame = this.getChildByName('txtFrame') as Laya.Label;
    }

    setData(val: FrameEffect) {
        this.frameEff.visible = val.isEffect;
        this.frameHit.visible = val.isHit;
        this.frameLayer.visible = (val.layLevel != 0);

        if (val.isBlank) {
            this.txtFrame.text = '•';
        } else {
            this.txtFrame.text = val.copyIndex.toString();
        }
    }
}