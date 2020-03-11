declare class FrameData {
    isEffect: boolean;
    isHit: boolean;
    hitType: number;
    offsetX: number;
    offsetY: number;
    layLevel: number;
    copyIndex: number;
}

declare class AniInfo {
    meta: string;
    name: string;
    filePath: string;
    framesData: FrameData[];
    frames: string[];
    imgs: string[];
    pivot: Point;
}

declare class Point {
    x: number;
    y: number;
}