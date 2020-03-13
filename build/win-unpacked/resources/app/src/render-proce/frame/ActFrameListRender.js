"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const render_dao_1 = require("../cmm/render-dao");
const ani_frame_edit_1 = require("./ani-frame-edit");
const ani_on_stage_1 = require("../stage/ani-on-stage");
class ActAniRender extends Laya.Box {
    constructor() {
        super();
    }
    onEnable() {
        this.listFrame = this.getChildByName('listFrame');
        this.listFrame.renderHandler = Laya.Handler.create(this, this.onFrameRender, null, false);
        this.listFrame.selectHandler = Laya.Handler.create(this, this.onFrameSelect, null, false);
        this.listFrame.dataSource;
        this.listFrame.selectEnable = true;
    }
    setData(val) {
        this.aniEntity = render_dao_1.aniEntityDict.get(val);
        this.listFrame.dataSource = this.aniEntity.frameEffects;
    }
    onFrameRender(cell) {
        cell.setData(cell.dataSource);
    }
    onFrameSelect(index) {
        ani_on_stage_1.setAllAniFrameIndex(index);
        ani_frame_edit_1.setCurFrameIndex(index, this.aniEntity);
    }
}
exports.default = ActAniRender;
