import Pos from "./Pos";

export class Apple {

    get x() {
        return this.pos.x;
    }

    get y() {
        return this.pos.y;
    }

    constructor(x, y) {
        this.pos = new Pos(x, y)

    }

    draw(ctxRef) {
        ctxRef.current.fillStyle = 'rgb(255,0,0)'
        this.pos.draw(ctxRef)
    }

    reset(x, y) {
        this.pos.x = x;
        this.pos.y = y;
    }


}

export default Apple;