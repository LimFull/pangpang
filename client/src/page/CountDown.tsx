import React, {ReactNode, useEffect, useState} from "react";

interface Props {
    values: string[];
    pause: React.MutableRefObject<boolean>;
    children: ReactNode;
}

export function CountDown({values, children, pause}: Props) {
    const [state, setState] = useState<{ valueIndex: number }>({valueIndex: 0})

    useEffect(() => {
        if (state.valueIndex >= values.length) {
            if (pause.current) pause.current = false
            return
        }
        if (!pause.current) pause.current = true
        setTimeout(() => {
            setState({...state, valueIndex: state.valueIndex + 1})
        }, 1000)
    }, [state.valueIndex])

    if (state.valueIndex >= values.length) {
        return <>{children}</>
    }
    return <>
        <div>{values[state.valueIndex]}</div>
        {children}
    </>
}