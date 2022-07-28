import styled from "styled-components";
import Chat from "./Chat";
import {Backdrop, Box, CircularProgress, Container, Stack} from "@mui/material";
import UserCard from "./UserCard";
import {useParams} from "react-router";
import {useSession} from "../session";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store";
import {ADD_USER, User} from "../snake/reducers/users";
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
`
const RoomInfo = styled.div`
  margin: 10px 0 4px 0;
`

interface RoomInfoType {
    roomNumber: number,
    title: string,
}

export function Room() {
    const param = useParams();
    const session = useSession();
    const [roomApi, setRoomApi] = useState<RoomApi | null>(null)
    const {users} = useSelector((state: RootState) => state.users)
    const [roomInfo, setRoomInfo] = useState<RoomInfoType | null>();
    const dispatch = useDispatch();

    useEffect(() => {
        const roomNumber = parseInt(param.roomNumber || '')
        if (roomNumber) {
            const api = DefaultRoomApi.init(session)
            session.api.joinRoom(roomNumber).then((result) => {
                setRoomInfo({roomNumber: result.roomNumber, title: result.title})
                setRoomApi(api)
            });
        }
    }, [param.roomNumber])

    useEffect(() => {
        if (!roomApi) return;
        dispatch({
            type: ADD_USER, payload: {
                id: session.user.id, user: {
                    name: session.user.name, color: ''
                }
            }
        })
    }, [roomApi]);

    return <Container>
        {!roomApi && <Backdrop sx={{color: '#fff'}} open={true}><CircularProgress color="inherit"/></Backdrop>}
        <Stack sx={{height: '90vh', overflowY: 'scroll'}}>
            <RoomInfo>
                {roomInfo ? `${roomInfo.roomNumber} ${roomInfo.title}` : ''}
            </RoomInfo>
            <CardContainer>
                {
                    Object.values(users).map((user, i) => {
                        console.log("user", user)
                        const cardUser = user as User;
                        console.log("cardUser", cardUser)
                        return <UserCard key={i} color={cardUser.color} name={cardUser.name}/>
                    })
                }
            </CardContainer>
            <Box sx={{width: '100%', height: '30vh', alignSelf: 'flex-end'}}>
                <Chat roomApi={roomApi || NoOpRoomApi.instance}/>
            </Box>
        </Stack>
    </Container>
}

export default Room;
