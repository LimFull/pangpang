import {Game2dState} from "./Game2dState";

export enum Direction {
    UP,
    RIGHT,
    DOWN,
    LEFT
}

export interface Position {
    x: number;
    y: number;
}

export interface GameObject {
    pos: Position
    version?: number

    needComputeNextState(state: Game2dState, impactTarget?: GameObject): boolean

    nextState(state: Game2dState, impactTarget?: GameObject): GameObject[]
}

export interface Observer {
    next: (value) => void;
    error?: (err: any) => void;
    complete?: () => void;
}

export function randomPosition(max: Position): Position {
    return {x: randomInt(0, max.x), y: randomInt(0, max.y)}
}

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}
