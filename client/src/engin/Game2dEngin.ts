import {Game2dState} from "./Game2dState";
import {Game2dConfig} from "./Game2dConfig";
import {GameObject} from "./index";

export class Game2dEngin {
    state: Game2dState
    private readonly render: (object: GameObject) => void;

    constructor(config: Game2dConfig, render: (object: GameObject) => void) {
        this.state = new Game2dState(config.initObjects, config.eachStateCallback)
        this.render = render
    }

    start(run: () => void) {
        this.state.objects.forEach(this.render)
        run()
    }

    deriveNextState() {
        this.state = this.state.computeNextState(this.render)
    }

    stop() {

    }
}