import {Game2dConfig} from "../../engin/Game2dConfig";
import {Game2dState} from "../../engin/Game2dState";
import {GameObject, Position, randomPosition} from "../../engin";
import {Apple} from "./object/Apple";

export function snakeGameConfig(initObjects: GameObject[], mapSize: Position): Game2dConfig {
    return {
        eachStateCallback(state: Game2dState): void {
            const apples = state.findObjectsByType(Apple.prototype)
            if (apples.length === 0) {
                state.addObject(new Apple(randomPosition(mapSize)))
            }
        },
        initObjects: initObjects,
        mapSize: mapSize
    }
}