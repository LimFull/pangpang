import {GameObject} from "./index";

export class Game2dState {
    version: number
    time: number = new Date().getTime();
    objects: GameObject[];
    objectIndexesByPos: { [key: string]: Set<number> } = {}
    objectIndexesByType: { [key: string]: Set<number> } = {}
    beforeComputeNextState?: (SnakeGameState) => void

    constructor(objects: GameObject[], beforeComputeNextState?: (state: Game2dState) => void, version?: number) {
        this.objects = objects;
        this.version = version || 0
        objects.forEach((object, idx) => this.indexing(object, idx))
        if (beforeComputeNextState) beforeComputeNextState(this)
        this.beforeComputeNextState = beforeComputeNextState
    }

    private static key(object: GameObject): string {
        return `${object.pos.x}::${object.pos.y}`
    }

    addObject(object: GameObject) {
        this.objects.push(object);
        this.indexing(object, this.objects.length - 1)
    }

    findObjectsByType<T extends GameObject>(type: T): T[] {
        const indexes = this.objectIndexesByType[type.constructor.name]
        if (indexes) {
            return [...this.objectIndexesByType[type.constructor.name]].map(index => this.objects[index] as T)
        }
        return []
    }

    computeNextState(eachObjectCallback?: (object: GameObject) => void): Game2dState {
        const nextObjects: GameObject[] = this.objects.flatMap((object, idx) => {
            const key = Game2dState.key(object);

            let result: GameObject[]
            let impactTarget = this.findImpactObject(key, idx);
            if (object.needComputeNextState(this, impactTarget)) {
                result = object.nextState(this, impactTarget)
                result.forEach(row => {
                    row.version = this.version
                    eachObjectCallback && eachObjectCallback(row)
                })
            } else {
                eachObjectCallback && eachObjectCallback(object)
                result = [object]
            }
            return result
        });
        return new Game2dState(nextObjects, this.beforeComputeNextState, this.version + 1);
    }

    private findImpactObject(key: string, idx: number): GameObject | undefined {
        for (let targetIdx of this.objectIndexesByPos[key]) {
            if (idx !== targetIdx) {
                return this.objects[targetIdx]
            }
        }
        return undefined
    }

    private indexing(object: GameObject, idx: number) {
        const key = Game2dState.key(object);
        this.objectIndexesByPos[key] = this.objectIndexesByPos[key] || new Set()
        this.objectIndexesByPos[key].add(idx)

        let constructorName = object.constructor.name;
        this.objectIndexesByType[constructorName] = this.objectIndexesByType[constructorName] || new Set()
        this.objectIndexesByType[constructorName].add(idx)
    }
}
