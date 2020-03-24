import { aniEntityDict } from "../cmm/render-dao";
import { AE_Event, EvtCenter } from "../cmm/EvtCenter.js";

/**
 * 文件夹列表处理类
 */
export default class AniListRender extends Laya.Box {
    checkBox: Laya.CheckBox;
    lblName: Laya.Label;
    imgOn: Laya.Image;
    imgSelect: Laya.Image;
    btnAniDel: Laya.Button;
    btnAniLock: Laya.Button;
    btnAniScale: Laya.Button;
    index: number;
    aniName: string;
    constructor() {
        super();
    }
    onEnable() {
        this.checkBox = this.getChildByName('checkBox') as Laya.CheckBox;
        this.lblName = this.getChildByName('lblName') as Laya.Label;
        this.imgOn = this.getChildByName('imgOn') as Laya.Image;
        this.imgSelect = this.getChildByName('imgSelect') as Laya.Image;
        this.btnAniDel = this.getChildByName('btnAniDel') as Laya.Button;
        this.checkBox.on(Laya.Event.CHANGE, this, this.onCheckBoxSelect)

        this.btnAniLock = this.getChildByName('btnAniLock') as Laya.Button;
        this.btnAniLock.on(Laya.Event.CHANGE, this, this.onAniLock) as Laya.Button;

        this.btnAniScale = this.getChildByName('btnAniScale') as Laya.Button;
        this.btnAniScale.on(Laya.Event.CHANGE, this, this.onAniScale);

        this.on(Laya.Event.MOUSE_OVER, this, this.onOver);
        this.on(Laya.Event.MOUSE_OUT, this, this.onOut);
        this.on(Laya.Event.CLICK, this, this.onClick)
        this.btnAniDel.on(Laya.Event.CLICK, this, this.onDel);
    }

    setData(val: string, index: number) {
        if (this.aniName == val) return;
        this.aniName = val;
        this.index = index;
        this.lblName.text = this.aniName;
        this.checkBox.selected = false;
    }
    /**
     * 获取模型数据
     */
    get Data() {
        return this.aniName;
    }

    /**
     * 获取当前项在list中的索引
     */
    get Index() {
        return this.index;
    }

    /**
     * 选中模型，在预览区域显示
     */
    set select(val: boolean) {
        this.imgSelect.visible = val;
    }

    onClick(evt: Laya.Event) {
        if (evt.target != this.btnAniDel)
            EvtCenter.send(AE_Event.ANI_TO_SHOW, this.aniName)
    }


    onOver() {
        this.imgOn.visible = true;
    }
    onOut() {
        this.imgOn.visible = false;
    }

    onDel() {
        EvtCenter.send(AE_Event.ANI_DEL, this.aniName);
    }

    reset() {
        this.imgSelect.visible = false;
        this.checkBox.selected = false;
    }
    /**
     * 添加到舞台
     */
    onCheckBoxSelect() {
        if (this.checkBox.selected) {
            EvtCenter.send(AE_Event.ANI_TO_STAGE, this.aniName);
        } else {
            EvtCenter.send(AE_Event.ANI_REMOVE_STAGE, this.aniName);
        }
    }

    //锁定当前动画
    onAniLock() {
        aniEntityDict.get(this.aniName).setLock(!this.btnAniLock.selected);
    }

    //反转
    onAniScale() {
        aniEntityDict.get(this.aniName).setScale(this.btnAniScale.selected);
    }

    onDestroy() {
        super.onDestroy();
        this.btnAniDel.off(Laya.Event.CLICK, this, this.onDel);
    }

}