export class Pos {
    constructor(x, y, parent) {
        this.x = x;
        this.y = y;
        this.pastX = -1;
        this.pastY = -1;
        if (parent) {
            this.parent = parent;
            this.parent.setChild(this);
        }
    }

    isEqual(pos) {
        return (this.x === pos.x && this.y === pos.y);
    }

    getClone() {
        return new Pos(this.x, this.y);
    }

    setChild(child) {
        this.child = child;
    }

    move(x, y) {
        // TODO: 개선 필요
        this.pastX = this.x;
        this.pastY = this.y;
        this.x = x;
        this.y = y;

        if (this.child) {
            this.child.move(this.pastX, this.pastY);
        }
    }

    draw(ctxRef, color) {
        if (!ctxRef) {
            return;
        }
        
        ctxRef.current.fillStyle = color;
        ctxRef.current.clearRect(this.pastX * 2, this.pastY * 2, 2, 2);
        ctxRef.current.fillRect(this.x * 2, this.y * 2, 2, 2);

        if (this.child) {
            this.child.draw(ctxRef);
        }
    }
}

export default Pos