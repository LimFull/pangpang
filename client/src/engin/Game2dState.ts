import {GameObject} from "./index";

export class Game2dState {
  version: number
  time: number = new Date().getTime();
  objects: GameObject[];
  objectIndexesByPos: { [key: string]: Set<number> } = {}
  beforeComputeNextState?: (SnakeGameState) => void

  constructor(objects: GameObject[], beforeComputeNextState?: (state: Game2dState) => void, version?: number) {
    this.objects = objects;
    objects.forEach((state, idx) => {
      const key = Game2dState.key(state);
      this.objectIndexesByPos[key] = this.objectIndexesByPos[key] || new Set()
      this.objectIndexesByPos[key].add(idx)
    })

    if (beforeComputeNextState) beforeComputeNextState(this)
    this.beforeComputeNextState = beforeComputeNextState
    this.version = version || 0
  }

  private static key(object: GameObject): string {
    return `${object.pos.x}::${object.pos.y}`
  }

  addObject(object: GameObject) {
    const key = Game2dState.key(object);
    this.objects.push(object);
    this.objectIndexesByPos[key] = this.objectIndexesByPos[key] || new Set()
    this.objectIndexesByPos[key].add(this.objects.length - 1)
  }

  computeNextState({computeBefore, computeAfter, draw}: {
    computeBefore?: (value: GameObject, index: number, key: string) => void,
    computeAfter?: (value: GameObject, index: number, key: string) => void,
    draw?: (value: GameObject[]) => void,
  } = {}): Game2dState {
    const nextObjects: GameObject[] = this.objects.flatMap((object, idx) => {
      const key = Game2dState.key(object);
      if (computeBefore) {
        computeBefore(object, idx, key)
      }
      let result: GameObject[]
      let impactTarget = this.findImpactObject(key, idx);
      if (object.needComputeNextState(this, impactTarget)) {
        result = object.nextState(this, impactTarget)
        result.forEach(row => row.version = this.version)
      } else {
        result = [object]
      }
      if (draw) {
        draw(result);
      }
      if (computeAfter) {
        computeAfter(object, idx, key)
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
}
