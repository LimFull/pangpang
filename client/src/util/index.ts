import {Dispatch, SetStateAction, useEffect, useState} from "react";

export function useStateWithInitializer<R>(init: R, initializer: () => Promise<R>): [R, Dispatch<SetStateAction<R>>] {
    const states = useState<R>(init);

    useEffect(() => {
        initializer().then(states[1])
    }, [])

    return states;
}