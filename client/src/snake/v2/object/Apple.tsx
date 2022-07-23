import {GameObject, Position} from "../../../engin";
import {SnakeHead} from "./SnakeHead";
import {Game2dState} from "../../../engin/Game2dState";

export class Apple implements GameObject {
    pos: Position;
    consumed: boolean = false

    constructor(pos: Position) {
        this.pos = pos;
    }

    needComputeNextState(state: Game2dState, impactTarget?: GameObject): boolean {
        return !!impactTarget;
    }

    nextState(state: Game2dState, impactTarget?: GameObject): GameObject[] {
        if (this.consumed) return []
        if (impactTarget instanceof SnakeHead) {
            this.consumed = true
            impactTarget.growUp();
            return [];
        }
        return [this];
    }
}
