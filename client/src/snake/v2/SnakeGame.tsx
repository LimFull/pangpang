import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {Direction, randomPosition} from "./object";
import {Apple} from "./object/Apple";
import {SnakeHead} from "./object/SnakeHead";
import {SnakeGameState} from "./SnakeGameState";
import {MAP_SIZE} from "../Constants";

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

interface Props {
    size: {
        x: number
        y: number
    }
}

export function SnakeGame() {
    return <SnakeGameWithProps size={{x: MAP_SIZE.WIDTH, y: MAP_SIZE.HEIGHT}}/>
}

function SnakeGameWithProps(props: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const snakeHead = useRef<SnakeHead>(new SnakeHead({x: 2, y: 4}, Direction.RIGHT));
    const [state, setState] = useState(false);

    useEffect(() => {
        const context = canvasRef.current?.getContext('2d')
        if (context && state) draw(canvasRef.current!!, context, props, snakeHead);
        else setState(true)
    }, [state])

    const handleDirection = (direction: Direction) => () => {
        if (!snakeHead.current) return
        const toHandle = (snakeHead.current.direction + direction) % 2;
        if (toHandle) {
            snakeHead.current.direction = direction;
        }
    }

    return <Container ref={containerRef}>
        <canvas ref={canvasRef} width={'400'} height={'480'} style={{background: 'rgb(255,255,255)'}}/>
        <ButtonArea style={{position: "relative"}}>
            <ArrowArea>
                <UpArrowContainer>
                    <button onClick={handleDirection(Direction.UP)} style={{width: '15vw', height: '15vw'}}></button>
                </UpArrowContainer>
                <HorizonArrowContainer>
                    <button onClick={handleDirection(Direction.LEFT)} style={{width: '15vw', height: '15vw'}}></button>
                    <button onClick={handleDirection(Direction.RIGHT)} style={{width: '15vw', height: '15vw'}}></button>
                </HorizonArrowContainer>
                <DownArrowContainer>
                    <button onClick={handleDirection(Direction.DOWN)} style={{width: '15vw', height: '15vw'}}></button>
                </DownArrowContainer>
            </ArrowArea>
        </ButtonArea>
    </Container>
}

function draw(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    props: Props,
    snakeHead: MutableRefObject<SnakeHead>
) {

    const blockWidth = canvas.width / props.size.x;
    const blockHeight = canvas.height / props.size.y;

    let states = new SnakeGameState(
        [new Apple(randomPosition(props.size)), snakeHead.current],
        (state) => {
            if (state.objects.filter(row => row instanceof Apple).length === 0) {
                state.addObject(new Apple(randomPosition(props.size)))
            }
        }
    )

    requestAnimationFrame(frame);

    function frame() {
        context.clearRect(0, 0, 10000, 10000)
        states = states.computeNextState({
            draw:(states)=> {
                states.forEach(state => context.fillText(`${state.pos.x}, ${state.pos.y}`, state.pos.x * blockWidth, state.pos.y * blockHeight))
                states.forEach((state) => context.strokeRect(state.pos.x * blockWidth, state.pos.y * blockHeight, blockWidth, blockHeight))
            }
        })
        requestAnimationFrame(frame);
    }
}

