import { stagePropertyHandle } from "./stage-attr";
import { aniFrameEffectHandle } from "./ani-frame-effect";
import { aniSaveHandle } from "./ani-save";
import { aniFrameOffsetHandle } from "./ani-frame-offset";
import { ui } from "../../ui/layaMaxUI";

export default class AttrPanel extends ui.scene.AttrPanelUI {
    constructor() {
        super();
    }

    onEnable() {
        stagePropertyHandle(this);
        aniFrameEffectHandle(this);
        aniSaveHandle(this);
        aniFrameOffsetHandle(this);
    }
}