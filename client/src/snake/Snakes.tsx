import React, {useEffect, useRef} from "react";
import styled from "styled-components";
import {DIRECTION} from "./Constants";
import {Snake} from "./Snake";
import Apple from "./Apple";

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

const Container = styled.div`
  display: flex;
  flex-direction: column;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D>();
  const snake = useRef<Snake>();
  const moveTime = useRef(new Date().getTime());
  const appleRef = useRef(new Apple(35, 30))

  const _setPageSize = () => {
    if (!containerRef.current) return

    containerRef.current.style.height = window.innerHeight + "px"
    window.addEventListener("resize",
      () => {
        console.log("resize")
        if (!containerRef.current) return
        containerRef.current.style.height = `${window.innerHeight}px`
      })
  }

  const clearCanvas = () => {
    if (!ctxRef.current || !canvasRef.current) return
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }

  const init = () => {
    if (!canvasRef.current) return
    let context: CanvasRenderingContext2D | null = canvasRef.current.getContext('2d');
    if (!context) return
    ctxRef.current = context;
    if (ctxRef.current == null) return;
    clearCanvas();
    snake.current = new Snake(30, 30, DIRECTION.RIGHT, 'rgb(0,0,255)');

    moveTime.current = new Date().getTime();
  }

  const run = () => {
    clearCanvas();

    if (new Date().getTime() - moveTime.current > 300) {
      moveTime.current = new Date().getTime();
      snake.current?.move();

      if (snake.current?.head?.isEqual(appleRef.current)) {
        console.log("뱀 자람");
        snake.current.growUp();
        appleRef.current.reset(Math.floor(Math.random() * 50), Math.floor(Math.random() * 60));
      }
    }
    snake.current?.draw(ctxRef);
    appleRef.current.draw(ctxRef);

    requestAnimationFrame(run);
  }

  const handleDirection = (direction) => {
    if (!snake.current) return
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
    <canvas ref={canvasRef} width={'400'} height={'480'} style={{
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
          움
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
