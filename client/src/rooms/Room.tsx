import styled from "styled-components";
import UserCard from "./UserCard";
import {Button, Input} from "antd";
import Chat from "./Chat";
import {useCallback, useState} from "react";

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  background: #85a0f8;
`

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 350px;
  padding-top: 12px;
  border: solid 1px #d9d9d9;
  background: rgba(189, 187, 187, 0.3);
  margin-top: 10px;
'
`

const ButtonContainer = styled.div`
  width: 95vw;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-around;

  .ant-btn {
    width: 80px;
  }
`

export function Room() {
    const [isReady, setIsReady] = useState<boolean>(false);
    const handleReady = useCallback(() => {
        setIsReady((prev) => !prev)
    },[])

    return <Container>
        <CardContainer>
            <UserCard/>
            <UserCard/>
            <UserCard/>
            <UserCard/>
        </CardContainer>
        <ButtonContainer>
            <Button>Exit</Button>
            <Button type={isReady ? 'default' : 'primary'} onClick={handleReady}>{isReady ? "Cancel" : "Ready"}</Button>
        </ButtonContainer>
        <Chat/>
    </Container>

}

export default Room;
