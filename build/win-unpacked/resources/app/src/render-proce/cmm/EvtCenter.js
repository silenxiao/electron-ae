"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EvtCenter;
(function (EvtCenter) {
    let evtTrigger = new Laya.EventDispatcher();
    function send(type, data) {
        evtTrigger.event(type, data);
    }
    EvtCenter.send = send;
    function on(type, caller, listener, args) {
        evtTrigger.on(type, caller, listener, args);
    }
    EvtCenter.on = on;
    function off(type, caller, listener) {
        evtTrigger.off(type, caller, listener);
    }
    EvtCenter.off = off;
})(EvtCenter = exports.EvtCenter || (exports.EvtCenter = {}));
exports.AE_Event = {
    ANI_TO_SHOW: 'aniToShow',
    ANI_TO_STAGE: 'aniToStage',
    ANI_REMOVE_STAGE: 'aniRemoveStage',
    ANI_LAYER: 'ani_layer',
    ANI_DEL: 'ani_del',
    ANI_FRAME_EVENT: 'ani_frame_event',
    ANI_TO_PLAY: 'ani_to_play',
    ANI_SELECTED: 'ani_selected',
};
exports.ANI_FRAME_TYPE = {
    ANI_FRAME_OFFSET_RESET: 'ani_frame_offset_reset',
    ANI_FRAME_OFFSET_SAVE: 'ani_frame_offset_save',
    ANI_FRAME_OFFSETX: 'ani_frame_offsetx',
    ANI_FRAME_OFFSETY: 'ani_frame_offsety',
    ANI_FRAME_OFFSETX_RESET: 'ani_frame_offsetx_reset',
    ANI_FRAME_OFFSETY_RESET: 'ani_frame_offsety_reset',
    ANI_FRAME_EFFECT_RESET: 'ani_frame_effect_reset',
    ANI_FRAME_EFFECT_SAVE: 'ani_frame_effect_save',
    ANI_FRAMES_RESET: 'ani_frames_reset',
    ANI_FRAMES_SAVE: 'ani_frames_save',
};
