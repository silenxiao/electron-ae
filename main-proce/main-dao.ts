export let ENV_PATH = {
    ROOT_PATH: "",
    TEMP_PATH: "",
    CONF_PATH: "",
}

export let globalParam: GlobalData = {
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
    },
    tinify_key: 'fHWleyCjV8lBEde9QWYFcmzMg7ns8fMb',
    move_y: 20,
}

export let aniDict: Map<string, AniInfo> = new Map();