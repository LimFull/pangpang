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
        ctxRef.current.beginPath();
        ctxRef.current.fillStyle = 'rgb(255,0,0)';
        ctxRef.current.strokeStyle = 'rgb(255,0,0)';
        ctxRef.current.arc(this.pos.x * 8 + 4, this.pos.y * 8 + 4, 3, 0, Math.PI * 2);
        ctxRef.current.stroke();
        ctxRef.current.fill();
    }

    reset(x, y) {
        this.pos.x = x;
        this.pos.y = y;
    }


}

export default Apple;