import {GameObject, Position} from "./index";
import {SnakeHead} from "./SnakeHead";

export class Apple implements GameObject {
    pos: Position;
    consumed: boolean = false

    constructor(pos: Position) {
        this.pos = pos;
    }

    needComputeNextState(gameTime: number, impactTarget?: GameObject): boolean {
        return !!impactTarget;
    }

    nextState(gameTime: number, impactTarget?: GameObject): GameObject[] {
        if (this.consumed) return []
        if (impactTarget instanceof SnakeHead) {
            this.consumed = true
            impactTarget.growUp();
            return [];
        }
        return [this];
    }
}