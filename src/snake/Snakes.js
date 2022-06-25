import React, {useEffect, useRef} from "react";
import styled from "styled-components";
import {DIRECTION} from "./Constants";
import {Snake} from "./Snake";

const Container = styled.div`
  display: flex;
  flex: 1;
  width: 100vw;
  height: 10vh;
  background-color: blue;
  position: fixed;
  //overscroll-behavior: contain;
  //touch-action: none;
  flex-direction: column;
  overflow: scroll;
`

const ButtonArea = styled.div`
  display: flex;
  width: 100%;
  flex: 1;
  background: black;
  align-items: center;
  justify-content: center;

  button {
    position: relative;
  }
`

const ArrowArea = styled.div`
  position: relative;
  background: red;
  width: 70%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ArrowContainer = styled.div`
  position: absolute;
`

export function Snakes() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const ctxRef = useRef();
    const snake = useRef();
    const moveTime = useRef(new Date().getTime());

    const _setPageSize = () => {
        containerRef.current.style.height = window.innerHeight + "px"
        window.addEventListener("resize",
            () => {
                console.log("resize")
                containerRef.current.style.height = window.innerHeight
            })
    }

    const init = () => {
        const map = [];
        for (let i = 0; i < 60; i++) {
            if (!map[i]) map[i] = []
            for (let j = 0; j < 50; j++) {
                map[i][j] = i % 2 === 0 ? (0) : 1;
            }
        }
        ctxRef.current = canvasRef.current.getContext('2d');
        if (ctxRef.current == null) return;
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        snake.current = new Snake(30, 30, DIRECTION.RIGHT);

        moveTime.current = new Date().getTime();
    }

    const run = () => {
        snake.current.draw(ctxRef);
        if (new Date().getTime() - moveTime.current > 1000) {
            moveTime.current = new Date().getTime();
            snake.current.move(ctxRef);
        }
        requestAnimationFrame(run);
    }

    const handleDirection = (direction) => {
        const toHandle = (snake.current.direction + direction) % 2;
        if (toHandle) {
            snake.current.direction = direction;
        }
    }

    useEffect(() => {
        _setPageSize();
        init();
        run();
    }, [])

    return <Container ref={containerRef}>
        <canvas ref={canvasRef} width={'100vw'} height={'120vw'} style={{
            background: 'rgb(255,255,255)',

        }}></canvas>
        <ButtonArea style={{position: "relative"}}>
            <ArrowArea>
                <ArrowContainer>
                    <button onClick={() => {
                        handleDirection(DIRECTION.UP)
                    }
                    } style={{bottom: '15vw', width: '15vw', height: '15vw'}}></button>
                </ArrowContainer>
                <ArrowContainer>
                    <button onClick={() => {
                        handleDirection(DIRECTION.RIGHT)
                    }
                    } style={{left: '15vw', width: '15vw', height: '15vw'}}></button>
                </ArrowContainer>
                <ArrowContainer>
                    <button onClick={() => {
                        handleDirection(DIRECTION.LEFT)
                    }
                    } style={{right: '15vw', width: '15vw', height: '15vw'}}></button>
                </ArrowContainer>
                <ArrowContainer>
                    <button onClick={() => {
                        handleDirection(DIRECTION.DOWN)
                    }
                    } style={{top: '15vw', width: '15vw', height: '15vw'}}></button>
                </ArrowContainer>
            </ArrowArea>
        </ButtonArea>
    </Container>
}

export default Snakes