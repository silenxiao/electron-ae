"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ActAniNameRender extends Laya.Box {
    constructor() {
        super();
    }
    onEnable() {
        this.txtAniName = this.getChildByName('txtAniName');
        this.imgSelect = this.getChildByName('imgSelect');
        this.imgOn = this.getChildByName('imgOn');
        this.imgSelect.visible = false;
        this.on(Laya.Event.MOUSE_OVER, this, this.onOver);
        this.on(Laya.Event.MOUSE_OUT, this, this.onOut);
    }
    setData(val, index) {
        this.txtAniName.text = val;
        this.renderIndex = index;
    }
    set selected(val) {
        this.imgSelect.visible = val;
    }
    onOver() {
        this.imgOn.visible = true;
    }
    onOut() {
        this.imgOn.visible = false;
    }
}
exports.default = ActAniNameRender;
