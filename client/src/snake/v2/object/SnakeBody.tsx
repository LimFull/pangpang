import {GameObject, Position} from "../../../engin";
import {Game2dState} from "../../../engin/Game2dState";

export class SnakeBody implements GameObject {
    pos: Position;
    version: number;
    next?: SnakeBody;
    dead: boolean = false;

    constructor(pos: Position, headVersion: number, next?: SnakeBody) {
        this.pos = pos;
        this.version = headVersion;
        this.next = next;
    }

    needComputeNextState(state: Game2dState): boolean {
        if (this.dead) {
            return true;
        }
        return this.version === state.version;
    }

    nextState(state: Game2dState, impactTarget?: GameObject): GameObject[] {
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