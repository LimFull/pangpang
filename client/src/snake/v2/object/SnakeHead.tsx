import {Direction, GameObject, Position} from "../../../engin";
import {SnakeBody} from "./SnakeBody";
import {MAP_SIZE} from "../../Constants";
import {Game2dState} from "../../../engin/Game2dState";

export class SnakeHead implements GameObject {
    pos: Position;
    updateTime: number = new Date().getTime();
    direction: Direction;
    body?: SnakeBody
    lastAddedBody?: SnakeBody
    dead: boolean = false;
    deadBodyCount: number = 5;

    constructor(pos: Position, direction: Direction) {
        this.pos = pos;
        this.direction = direction;
    }

    needComputeNextState(state: Game2dState): boolean {
        const time = state.time - this.updateTime
        return time >= 200
    }

    nextState(state: Game2dState, impactTarget?: GameObject): GameObject[] {
        this.updateTime = state.time;
        if (this.dead) {
            this.deadBodyCount -= 1;
            if (this.deadBodyCount === 0) {
                this.body?.die()
                return []
            }
            return [this]
        }

        if (impactTarget instanceof SnakeBody || impactTarget instanceof SnakeHead) {
            this.die();
            return [this];
        }

        const prevPos = {...this.pos}
        this.move();
        this.body?.move(prevPos)
        if (this.lastAddedBody) {
            const lastAddedBody = this.lastAddedBody;
            this.lastAddedBody = undefined;
            return [this, lastAddedBody]
        }

        if (this.pos.x >= MAP_SIZE.WIDTH || this.pos.x < 0 || this.pos.y >= MAP_SIZE.HEIGHT || this.pos.y < 0) {
            this.die();
        }

        return [this];
    }

    die() {
        this.dead = true;
    }

    move() {

        switch (this.direction) {
            case Direction.UP: {
                this.pos.y -= 1
                break;
            }
            case Direction.RIGHT: {
                this.pos.x += 1
                break;
            }
            case Direction.DOWN: {
                this.pos.y += 1
                break;
            }
            case Direction.LEFT: {
                this.pos.x -= 1
                break;
            }
        }
    }

    growUp() {
        let tail: SnakeBody | undefined = this.body
        while (tail?.next) {
            tail = tail?.next
        }
        if (tail) {
            this.lastAddedBody = new SnakeBody({...tail.pos}, this.updateTime)
            tail.next = this.lastAddedBody
        } else {
            this.lastAddedBody = new SnakeBody({...this.pos}, this.updateTime)
            this.body = this.lastAddedBody
        }
    }
}