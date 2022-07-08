import {GameObject, Position} from "./index";
import {SnakeHead} from "./SnakeHead";
import {SnakeGameState} from "../SnakeGameState";

export class Apple implements GameObject {
    pos: Position;
    consumed: boolean = false

    constructor(pos: Position) {
        this.pos = pos;
    }

    needComputeNextState(state: SnakeGameState, impactTarget?: GameObject): boolean {
        return !!impactTarget;
    }

    nextState(state: SnakeGameState, impactTarget?: GameObject): GameObject[] {
        if (this.consumed) return []
        if (impactTarget instanceof SnakeHead) {
            this.consumed = true
            impactTarget.growUp();
            return [];
        }
        return [this];
    }
}