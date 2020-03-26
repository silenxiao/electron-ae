export module EvtCenter {
    let evtTrigger = new Laya.EventDispatcher();

    export function send(type: string, data?: any) {
        evtTrigger.event(type, data);
    }
    export function on(type: string, caller: any, listener: Function, args?: any[]) {
        evtTrigger.on(type, caller, listener, args);
    }
    export function off(type: string, caller: any, listener: Function) {
        evtTrigger.off(type, caller, listener);
    }
}

export let AE_Event = {
    ANI_TO_SHOW: 'aniToShow',
    ANI_TO_STAGE: 'aniToStage',
    ANI_REMOVE_STAGE: 'aniRemoveStage',
    ANI_LAYER: 'ani_layer',
    ANI_DEL: 'ani_del',

    ANI_FRAME_EVENT: 'ani_frame_event',
    ANI_TO_PLAY: 'ani_to_play',

    ANI_SELECTED: 'ani_selected',
    ANI_PLAYOVER: 'ani_playover',
}

export let ANI_FRAME_TYPE = {
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
}

export enum ImportType {
    Effect = 1,
    Hit = 2,
    Hero = 3,
    Enemy = 4,
}