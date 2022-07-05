import {GameObject, Position} from "./index";

export class SnakeBody implements GameObject {
    pos: Position;
    updateTime: number;
    next?: SnakeBody;

    constructor(pos: Position, headUpdateTime: number, next?: SnakeBody) {
        this.pos = pos;
        this.updateTime = headUpdateTime;
        this.next = next;
    }

    needComputeNextState(gameTime: number): boolean {
        return gameTime === this.updateTime;
    }

    nextState(gameTime: number, impactTarget?: GameObject): GameObject[] {
        return [];
    }

    move(pos: Position) {
        const prevPos = {...this.pos};
        this.pos = pos;
        this.next?.move(prevPos)
    }
}