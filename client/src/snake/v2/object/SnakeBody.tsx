import {GameObject, Position} from "./index";

export class SnakeBody implements GameObject {
    pos: Position;
    updateTime: number;
    next?: SnakeBody;
    dead: boolean = false;

    constructor(pos: Position, headUpdateTime: number, next?: SnakeBody) {
        this.pos = pos;
        this.updateTime = headUpdateTime;
        this.next = next;
    }

    needComputeNextState(gameTime: number): boolean {
        if (this.dead) {
            return true;
        }
        return gameTime === this.updateTime;
    }

    nextState(gameTime: number, impactTarget?: GameObject): GameObject[] {
        if (this.dead) {
            return [];
        }
        return [];
    }

    move(pos: Position) {
        const prevPos = {...this.pos};
        this.pos = pos;
        this.next?.move(prevPos)
    }

    die() {
        this.dead = true;
        this.next?.die();
    }

}