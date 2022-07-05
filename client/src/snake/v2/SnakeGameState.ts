import {GameObject} from "./object";

export class SnakeGameState {
    objects: GameObject[];
    objectIndexesByPos: { [key: string]: Set<number> } = {}
    time: number = new Date().getTime();
    beforeComputeNextState?: (SnakeGameState) => void

    constructor(objects: GameObject[], beforeComputeNextState?: (state: SnakeGameState) => void) {
        this.objects = objects;
        objects.forEach((state, idx) => {
            const key = SnakeGameState.key(state);
            this.objectIndexesByPos[key] = this.objectIndexesByPos[key] || new Set()
            this.objectIndexesByPos[key].add(idx)
        })

        if (beforeComputeNextState) beforeComputeNextState(this)
        this.beforeComputeNextState = beforeComputeNextState
    }

    private static key(object: GameObject): string {
        return `${object.pos.x}::${object.pos.y}`
    }

    addObject(object: GameObject) {
        const key = SnakeGameState.key(object);
        this.objects.push(object);
        this.objectIndexesByPos[key] = this.objectIndexesByPos[key] || new Set()
        this.objectIndexesByPos[key].add(this.objects.length - 1)
    }

    computeNextState({computeBefore, computeAfter}: {
        computeBefore?: (value: GameObject, index: number, key: string) => void,
        computeAfter?: (value: GameObject, index: number, key: string) => void,
    } = {}): SnakeGameState {
        const nextObjects: GameObject[] = this.objects.flatMap((object, idx) => {
            const key = SnakeGameState.key(object);
            if (computeBefore) {
                computeBefore(object, idx, key)
            }
            let result: GameObject[]
            let impactTarget = this.findImpactObject(key, idx);
            if (object.needComputeNextState(this.time, impactTarget)) {
                result = object.nextState(this.time, impactTarget)
                result.forEach(row => row.updateTime = this.time)
            } else {
                result = [object]
            }
            if (computeAfter) {
                computeAfter(object, idx, key)
            }
            return result
        });
        return new SnakeGameState(nextObjects, this.beforeComputeNextState);
    }

    private findImpactObject(key: string, idx: number): GameObject | undefined {
        for (let targetIdx of this.objectIndexesByPos[key]) {
            if (idx !== targetIdx) {
                return this.objects[targetIdx]
            }
        }
        return undefined
    }
}
