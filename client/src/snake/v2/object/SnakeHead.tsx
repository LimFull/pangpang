import {Direction, GameObject, Position} from "./index";
import {SnakeBody} from "./SnakeBody";

export class SnakeHead implements GameObject {
    pos: Position;
    updateTime: number = new Date().getTime();
    direction: Direction;
    body?: SnakeBody
    lastAddedBody?: SnakeBody

    constructor(pos: Position, direction: Direction) {
        this.pos = pos;
        this.direction = direction;
    }

    needComputeNextState(gameTime: number): boolean {
        const time = gameTime - this.updateTime
        return time >= 500
    }

    nextState(gameTime: number, impactTarget?: GameObject): GameObject[] {
        const prevPos = {...this.pos}
        this.move();
        this.body?.move(prevPos)
        if (this.lastAddedBody) {
            const lastAddedBody = this.lastAddedBody;
            this.lastAddedBody = undefined;
            return [this, lastAddedBody]
        }
        return [this];
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