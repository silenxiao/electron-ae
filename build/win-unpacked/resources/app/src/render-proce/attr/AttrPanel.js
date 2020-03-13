"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stage_attr_1 = require("./stage-attr");
const ani_frame_effect_1 = require("./ani-frame-effect");
const ani_save_1 = require("./ani-save");
const ani_frame_offset_1 = require("./ani-frame-offset");
const layaMaxUI_1 = require("../../ui/layaMaxUI");
class AttrPanel extends layaMaxUI_1.ui.scene.AttrPanelUI {
    constructor() {
        super();
    }
    onEnable() {
        stage_attr_1.stagePropertyHandle(this);
        ani_frame_effect_1.aniFrameEffectHandle(this);
        ani_save_1.aniSaveHandle(this);
        ani_frame_offset_1.aniFrameOffsetHandle(this);
    }
}
exports.default = AttrPanel;
