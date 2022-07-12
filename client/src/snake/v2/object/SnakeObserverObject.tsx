import SnakeMultiplay from "../../multiplay/SnakeMultiplay";
import {Subscription} from "@reactivex/rxjs/dist/package";

export class SnakeObserverObject {
    subscription: Subscription

    constructor() {
        this.subscription = SnakeMultiplay.subscribe(this);
    }

    unSubscribe() {
        this.subscription.unsubscribe();
    }
}
