import styled from "styled-components";
import {Button, Modal, Pagination} from "antd";
import {RoomCard} from "./RoomCard";
import CreateRoomModal from "./CreateRoomModal";

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  background: #85a0f8;
`
const CreateButton = styled(Button)`
  width: 100px;
  height: 40px;
  margin: 40px 0 20px 0;
`

const StyledPagination = styled(Pagination)`
  margin-top: 20px
`

export function Rooms() {
    return <Container>
        <CreateButton type={'primary'}>방 만들기</CreateButton>
        <RoomCard></RoomCard>
        <RoomCard></RoomCard>
        <RoomCard></RoomCard>
        <RoomCard></RoomCard>
        <StyledPagination total={10}></StyledPagination>
        <CreateRoomModal visible={false}/>
    </Container>
}