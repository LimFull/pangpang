import React, {useEffect, useRef} from "react";
import styled from "styled-components";
import {DIRECTION} from "./Constants";
import {Snake} from "./Snake";
import Apple from "./Apple";

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
  flex-direction: column;
`

const UpArrowContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: flex-end;

  button {
    margin: 0.5vw;
  }
`

const HorizonArrowContainer = styled.div`
  display: flex;

  align-items: center;

  button {
    margin: 0 8vw 0 8vw;
  }
`
const DownArrowContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: flex-start;

  button {
    margin: 0.5vw;
  }
`

export function Snakes() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const ctxRef = useRef();
    const snake = useRef();
    const moveTime = useRef(new Date().getTime());
    const appleRef = useRef(new Apple(35, 30))

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
        snake.current = new Snake(30, 30, DIRECTION.RIGHT, 'rgb(0,0,255)');

        moveTime.current = new Date().getTime();
    }

    const run = () => {

        if (new Date().getTime() - moveTime.current > 300) {
            moveTime.current = new Date().getTime();
            snake.current.move(ctxRef);

            if (snake.current.head.isEqual(appleRef.current)) {
                console.log("뱀 자람");
                snake.current.growUp();
                appleRef.current.reset(Math.floor(Math.random() * 50), Math.floor(Math.random() * 60));
            }
        }
        snake.current.draw(ctxRef);
        appleRef.current.draw(ctxRef);

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
        <canvas ref={canvasRef} width={'200'} height={'240'} style={{
            background: 'rgb(255,255,255)',

        }}></canvas>
        <ButtonArea style={{position: "relative"}}>
            <ArrowArea>
                <UpArrowContainer>
                    <button onClick={() => {
                        handleDirection(DIRECTION.UP)
                    }
                    } style={{width: '15vw', height: '15vw'}}></button>
                </UpArrowContainer>
                <HorizonArrowContainer>
                    <button onClick={() => {
                        handleDirection(DIRECTION.LEFT)
                    }
                    } style={{width: '15vw', height: '15vw'}}></button>

                    <button onClick={() => {
                        handleDirection(DIRECTION.RIGHT)
                    }
                    } style={{width: '15vw', height: '15vw'}}></button>
                </HorizonArrowContainer>
                <DownArrowContainer>
                    <button onClick={() => {
                        handleDirection(DIRECTION.DOWN)
                    }
                    } style={{width: '15vw', height: '15vw'}}></button>
                </DownArrowContainer>
            </ArrowArea>
        </ButtonArea>
    </Container>
}

export default Snakes