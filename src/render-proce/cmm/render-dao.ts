import AniEntity from "./AniEntity";


export let globalDao = {
    coordinateX: 0,
    coordinateY: 0,
    curAniName: '',
    curFrameIndex: 0,
    frameDrag: true,
    showSelected: true,
    isCopyFrame: false,
    isLoopPlay: true,
    copyIndexRang: [0, 0],
}

/**通用的动画配置 */
export let cmmAniConf: Map<string, FrameEffect[]> = new Map<string, FrameEffect[]>();
export let aniEntityDict: Map<String, AniEntity> = new Map<String, AniEntity>();

export let frameCopy = {
    isCopyFrame: false,
    copyAniName: '',
    beginIdx: 0,
    endIdx: 0,
}

export let confParam: GlobalData = {
    frameRate: 30,
    bgParam: {
        url: 'scene.jpg',
        posX: 110,
        posY: -30,
        coordinateX: 430,
        coordinateY: 515
    },

    frameIntev: {
        idle_s: 6,
        atk1_s: 1,
        die_s: 3,
        hit_s: 4,
        run_s: 2
    }
}