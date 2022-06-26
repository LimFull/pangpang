import {DIRECTION} from "./Constants";
import Pos from "./Pos";

export class Snake {
    get direction() {
        return this._direction;
    }

    set direction(value) {
        this.nextDirection = value;
    }

    body = []


    constructor(x, y, direction) {
        this.body[0] = new Pos(x, y);
        this.head = this.body[0];
        this._direction = direction;
        this.nextDirection = direction;
        this.speed = 1;
    }

    turn(direction) {
        this.direction = direction;
    }

    getHead() {
        return this.body[0];
    }

    inRect() {
        return (this.head.x % 2 || this.head.y % 2)
    }

    move() {
        this._direction = this.nextDirection;
        if (this._direction === DIRECTION.UP) {
            this.head.move(this.head.x, this.head.y - 1);
        } else if (this._direction === DIRECTION.RIGHT) {
            this.head.move(this.head.x + 1, this.head.y);
        } else if (this._direction === DIRECTION.DOWN) {
            this.head.move(this.head.x, this.head.y + 1);
        } else if (this._direction === DIRECTION.LEFT) {
            this.head.move(this.head.x - 1, this.head.y);
        }
    }

    draw(ctxRef) {
        if (!ctxRef) {
            return;
        }
        ctxRef.current.fillStyle = 'rgb(0,0,255)'
        this.head.draw(ctxRef);
    }
}

