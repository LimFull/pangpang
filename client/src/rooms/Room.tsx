import styled from "styled-components";
import Chat from "./Chat";
import {Backdrop, Box, CircularProgress, Container, Stack} from "@mui/material";
import UserCard from "./UserCard";
import {useParams} from "react-router";
import {useSession} from "../session";
import {useEffect, useState} from "react";
import {DefaultRoomApi} from "../api/DefaultRoomApi";
import {RoomApi} from "../api";
import {NoOpRoomApi} from "../api/NoOpRoomApi";

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
`

export function Room() {
    const param = useParams();
    const session = useSession();
    const [roomApi, setRoomApi] = useState<RoomApi | null>(null)

    useEffect(() => {
        const roomNumber = parseInt(param.roomNumber || '')
        if (roomNumber) {
            const api = DefaultRoomApi.init(session)
            session.api.joinRoom(roomNumber).then(() => setRoomApi(api));
        }
    }, [param.roomNumber])

    return <Container>
        {!roomApi && <Backdrop sx={{color: '#fff'}} open={true}><CircularProgress color="inherit"/></Backdrop>}
        <Stack sx={{height: '90vh', overflowY: 'scroll'}}>
            <CardContainer>
                <UserCard color={'blue'} name={'default_name'}/>
                <UserCard color={'blue'} name={'default_name'}/>
                <UserCard color={'blue'} name={'default_name'}/>
                <UserCard color={'blue'} name={'default_name'}/>
            </CardContainer>
            <Box sx={{width: '100%', height: '30vh', alignSelf: 'flex-end'}}>
                <Chat roomApi={roomApi || NoOpRoomApi.instance}/>
            </Box>
        </Stack>
    </Container>
}

export default Room;
