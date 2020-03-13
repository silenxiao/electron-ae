"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const render_dao_1 = require("../cmm/render-dao");
const EvtCenter_js_1 = require("../cmm/EvtCenter.js");
/**
 * 文件夹列表处理类
 */
class AniListRender extends Laya.Box {
    constructor() {
        super();
    }
    onEnable() {
        this.checkBox = this.getChildByName('checkBox');
        this.lblName = this.getChildByName('lblName');
        this.imgOn = this.getChildByName('imgOn');
        this.imgSelect = this.getChildByName('imgSelect');
        this.btnAniDel = this.getChildByName('btnAniDel');
        this.checkBox.on(Laya.Event.CHANGE, this, this.onCheckBoxSelect);
        this.btnAniLock = this.getChildByName('btnAniLock');
        this.btnAniLock.on(Laya.Event.CHANGE, this, this.onAniLock);
        this.btnAniScale = this.getChildByName('btnAniScale');
        this.btnAniScale.on(Laya.Event.CHANGE, this, this.onAniScale);
        this.on(Laya.Event.MOUSE_OVER, this, this.onOver);
        this.on(Laya.Event.MOUSE_OUT, this, this.onOut);
        this.on(Laya.Event.CLICK, this, this.onClick);
        this.btnAniDel.on(Laya.Event.CLICK, this, this.onDel);
    }
    setData(val, index) {
        if (this.aniName == val)
            return;
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
    set select(val) {
        this.imgSelect.visible = val;
    }
    onClick(evt) {
        if (evt.target != this.btnAniDel)
            EvtCenter_js_1.EvtCenter.send(EvtCenter_js_1.AE_Event.ANI_TO_SHOW, this.aniName);
    }
    onOver() {
        this.imgOn.visible = true;
    }
    onOut() {
        this.imgOn.visible = false;
    }
    onDel() {
        EvtCenter_js_1.EvtCenter.send(EvtCenter_js_1.AE_Event.ANI_DEL, this.aniName);
    }
    /**
     * 添加到舞台
     */
    onCheckBoxSelect() {
        if (this.checkBox.selected) {
            EvtCenter_js_1.EvtCenter.send(EvtCenter_js_1.AE_Event.ANI_TO_STAGE, this.aniName);
        }
        else {
            EvtCenter_js_1.EvtCenter.send(EvtCenter_js_1.AE_Event.ANI_REMOVE_STAGE, this.aniName);
        }
    }
    //锁定当前动画
    onAniLock() {
        render_dao_1.aniEntityDict.get(this.aniName).setLock(!this.btnAniLock.selected);
    }
    //反转
    onAniScale() {
        render_dao_1.aniEntityDict.get(this.aniName).setScale(this.btnAniScale.selected);
    }
    onDestroy() {
        super.onDestroy();
        this.btnAniDel.off(Laya.Event.CLICK, this, this.onDel);
    }
}
exports.default = AniListRender;
