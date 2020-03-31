export default class ActAniNameRender extends Laya.Box {
    txtAniName: Laya.Label;
    imgOn: Laya.Image;
    imgSelect: Laya.Image;
    renderIndex: number;
    constructor() {
        super();
    }

    onEnable() {
        this.txtAniName = this.getChildByName('txtAniName') as Laya.Label;
        this.imgSelect = this.getChildByName('imgSelect') as Laya.Image;
        this.imgOn = this.getChildByName('imgOn') as Laya.Image;
        this.imgOn.visible = false;
        this.imgSelect.visible = false;
        this.on(Laya.Event.MOUSE_OVER, this, this.onOver);
        this.on(Laya.Event.MOUSE_OUT, this, this.onOut);
    }

    setData(val: string, index: number) {
        this.txtAniName.text = val;
        this.renderIndex = index;
    }

    set selected(val: boolean) {
        this.imgSelect.visible = val;
    }
    onOver() {
        this.imgOn.visible = true;
    }
    onOut() {
        this.imgOn.visible = false;
    }
}