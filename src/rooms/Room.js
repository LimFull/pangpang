import styled from "styled-components";
import UserCard from "./UserCard";

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

`

export function Room() {
  return <Container>
    <CardContainer>
      <UserCard/>
      <UserCard/>
      <UserCard/>
      <UserCard/>
    </CardContainer>
  </Container>

}

export default Room;
