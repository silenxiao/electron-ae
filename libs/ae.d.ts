/** 动画信息 */
declare class AniInfo {
    /**动画名 */
    aniName: string;
    /** 动画路径 */
    aniPath: string;
    /** 轴心 */
    pivot: Point;
    pivotIsDefaut: boolean;
    /**动画分解后的图片地址 */
    images: string[]
    /** 序列帧对应序列图id */
    frameIndxs: number[];
    /**序列帧对应的效果  */
    frameEffects: FrameEffect[];
}

/** 图集信息 */
declare class AtlasInfo {
    /** 轴中心点 */
    pivot: Point;
    /** 关联的图片 */
    meta: Meta;
    /** 帧数据 */
    frames: FrameData[];
}
/** 关联的图片 */
declare class Meta {
    image: string;
    prefix: string;
}

/** 帧数据 */
declare class FrameData {
    frame: Frame;
    sourceSize: SourceSize;
    spriteSourceSize: SpriteSourceSize;
    ani: FrameEffect;
}

/** 帧基础数据 */
declare class Frame {
    idx: number;
    x: number;
    y: number;
    w: number;
    h: number;
}

/** 动画的大小 */
declare class SourceSize {
    w: number;
    h: number;
}
/** 帧相对动画的偏移位置 */
declare class SpriteSourceSize {
    x: number;
    y: number;
}

/** 帧效果 */
declare class FrameEffect {
    isEffect: number;
    hitXY: number[];
    offset: number[];
    layLevel: number;
    /**复制的图片序列id */
    copyIndex: number;
    lblName: string;

    /** 唯一id */
    indxId: number;
    /**
     * @deprecated 弃用
     *是否是空白帧，不导出 
     */
    isBlank: boolean;
}

declare class Point {
    x: number;
    y: number;
}

/** ae 全局数据 */
declare class GlobalData {
    /** 默认帧率 */
    frameRate: number;

    bgParam: BGParam;
    frameIntev: FrameIntev;

    tinify_key: string;
}

/** 背景参数 */
declare class BGParam {
    url: string;
    posX: number;
    posY: number;
    coordinateX: number;
    coordinateY: number;
}

/** 动作的默认帧率 */
declare class FrameIntev {
    idle_s: number;
    atk1_s: number;
    die_s: number;
    hit_s: number;
    run_s: number;
}