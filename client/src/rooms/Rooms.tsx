import styled from "styled-components";
import {Button, Pagination} from "antd";
import {RoomCard} from "./RoomCard";
import CreateRoomModal from "./CreateRoomModal";
import {useCallback, useMemo, useState} from "react";
import {api} from "../apis";

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


const MOCK_DATA: RoomType[] = [{id: 1, title: 'ABCD', member: 1}, {
    id: 2,
    title: '가나다라마바사',
    member: 1
}, {
    id: 3,
    title: 'ABCD',
    member: 1
}, {id: 4, title: 'ABCD', member: 1}, {id: 5, title: 'ABCD', member: 1}, {id: 6, title: 'ABCD', member: 1}]


interface RoomType {
    id: number;
    title: string;
    member: number;
}

export function Rooms() {
    const [rooms, setRooms] = useState<RoomType[]>(MOCK_DATA);
    const [page, setPage] = useState<number>(1);
    const [showModal, setShowModal] = useState<boolean>(false);
    const pageIndex = useMemo<number>(() => (page - 1) * 4, [page]);

    const handleShowModal = useCallback(async () => {
        await api.base.get('/').then((r) => console.log("response", r)).catch(e => console.log("error", e));
        // setShowModal(true);
    }, []);

    const handleCancelModal = useCallback(() => {
        setShowModal(false);
    }, [])


    return <Container>
        <CreateButton type={'primary'} onClick={handleShowModal}>방 만들기</CreateButton>
        {
            rooms.slice(pageIndex, pageIndex + 4).map((v) => <RoomCard member={v.member} roomId={v.id}
                                                                       roomTitle={v.title}/>)
        }
        <StyledPagination pageSize={4} total={(rooms.length)} onChange={(page, pageSize) => {
            setPage(page)
        }}></StyledPagination>
        <CreateRoomModal visible={showModal} onCancel={handleCancelModal}/>
    </Container>
}

export default Rooms
