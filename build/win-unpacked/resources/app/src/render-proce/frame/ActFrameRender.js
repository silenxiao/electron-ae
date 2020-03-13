"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ActFrameRender extends Laya.Box {
    constructor() {
        super();
    }
    onEnable() {
        this.frameEff = this.getChildByName('frameEff');
        this.frameEff.visible = false;
        this.frameHit = this.getChildByName('frameHit');
        this.frameHit.visible = false;
        this.frameLayer = this.getChildByName('frameLayer');
        this.frameLayer.visible = false;
        this.txtFrame = this.getChildByName('txtFrame');
    }
    setData(val) {
        this.frameEff.visible = val.isEffect;
        this.frameHit.visible = val.isHit;
        this.frameLayer.visible = (val.layLevel != 0);
        if (val.copyIndex == -1) {
            this.txtFrame.text = '•';
        }
        else {
            this.txtFrame.text = val.copyIndex.toString();
        }
    }
}
exports.default = ActFrameRender;
