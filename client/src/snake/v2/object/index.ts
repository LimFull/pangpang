import {SnakeGameState} from "../SnakeGameState";

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

    needComputeNextState(state: SnakeGameState, impactTarget?: GameObject): boolean

    nextState(state: SnakeGameState, impactTarget?: GameObject): GameObject[]
}

export function randomPosition(max: Position): Position {
    return {x: randomInt(0, max.x), y: randomInt(0, max.y)}
}

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}