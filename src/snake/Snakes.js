import React, {useEffect, useRef} from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex: 1;
  width: 100vw;
  height: 10vh;
  background-color: blue;
  position: fixed;
  overscroll-behavior: contain;
  touch-action: none;
  flex-direction: column;
`

export function Snakes() {
    const containerRef = useRef(null);


    useEffect(() => {
        containerRef.current.style.height = window.innerHeight + "px"
        console.log(containerRef.current.style.height, window.innerHeight);
        window.addEventListener("resize",
            () => {
                console.log("resize")
                containerRef.current.style.height = window.innerHeight

            })

    }, [])

    return <Container ref={containerRef}>


        <canvas style={{background: 'purple', height: '120vw'}}></canvas>

        <div style={{background: 'green', display: 'flex', flex: 1}}></div>

    </Container>
}

export default Snakes