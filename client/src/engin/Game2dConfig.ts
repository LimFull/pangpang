import {GameObject, Position} from "./index";
import {Game2dState} from "./Game2dState";

export interface Game2dConfig {
    mapSize: Position
    initObjects: GameObject[]
    eachStateCallback?: (state: Game2dState) => void
}