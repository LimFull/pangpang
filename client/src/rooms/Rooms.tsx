import styled from "styled-components";
import {Button, Pagination} from "antd";
import CreateRoomModal from "./CreateRoomModal";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {bind, RootState} from "../store";
import * as roomActions from "../snake/reducers/room";
import {useNavigate} from "react-router";
import SnakeMultiplay from "../snake/multiplay/SnakeMultiplay";
import {RoomCard} from "./RoomCard";

const {resetRoom} = bind(roomActions)

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


const MOCK_DATA: RoomType[] = [{roomNumber: 1, title: 'ABCD', member: 1}, {
  roomNumber: 2,
  title: '가나다라마바사',
  member: 1
}, {
  roomNumber: 3,
  title: 'ABCD',
  member: 1
}, {roomNumber: 4, title: 'ABCD', member: 1}, {roomNumber: 5, title: 'ABCD', member: 1}, {
  roomNumber: 6,
  title: 'ABCD',
  member: 1
}]


interface RoomType {
  roomNumber: number;
  title: string;
  member: number;
}

export function Rooms() {
  const [currentRooms, setCurrentRooms] = useState<RoomType[]>(MOCK_DATA);
  const [page, setPage] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const pageIndex = useMemo<number>(() => (page - 1) * 4, [page]);
  const {roomNumber, rooms} = useSelector((state: RootState) => state.room);
  const {id} = useSelector((state: RootState) => state.multi)
  const navigate = useNavigate();

  const handleShowModal = useCallback(async () => {
    setShowModal(true);
  }, []);

  const handleCancelModal = useCallback(() => {
    setShowModal(false);

  }, [])


  useEffect(() => {
    if (roomNumber) {
      navigate('/room')
    }
  }, [roomNumber])

  useEffect(() => {
    if (id) {
      SnakeMultiplay.getRooms();
    }
  }, [id])

  useEffect(() => {
      resetRoom();
      SnakeMultiplay.connectSocket();
    }, []
  )

  useEffect(() => {
    if (rooms) {
      setCurrentRooms(rooms)
    }
  }, [rooms])

  return <Container>
    <CreateButton type={'primary'} onClick={handleShowModal}>방 만들기</CreateButton>
    {
      currentRooms.slice(pageIndex, pageIndex + 4).map((v) => <RoomCard key={v.roomNumber} member={v.member}
                                                                        roomNumber={v.roomNumber}
                                                                        roomTitle={v.title}/>)
    }
    <StyledPagination pageSize={4} total={(rooms.length)} onChange={(page, pageSize) => {
      setPage(page)
    }}></StyledPagination>
    <CreateRoomModal visible={showModal} onCancel={handleCancelModal}/>
  </Container>
}

export default Rooms;
