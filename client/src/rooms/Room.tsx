import styled from "styled-components";
import Chat from "./Chat";
import {Backdrop, Box, CircularProgress, Container, Stack} from "@mui/material";
import UserCard from "./UserCard";
import {useParams} from "react-router";
import {useSession} from "../session";
import {useEffect, useState} from "react";

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
    const [joinSuccess, setJoinSuccess] = useState(false)

    useEffect(() => {
        const roomNumber = parseInt(param.roomNumber || '')
        if (roomNumber) {
            session.api.joinRoom(roomNumber).then(() => setJoinSuccess(true));
        }
    }, [param.roomNumber])

    return <Container>
        {!joinSuccess && <Backdrop sx={{color: '#fff'}} open={true}><CircularProgress color="inherit"/></Backdrop>}
        <Stack sx={{height: '90vh', overflowY: 'scroll'}}>
            <CardContainer>
                <UserCard color={'blue'} name={'default_name'}/>
                <UserCard color={'blue'} name={'default_name'}/>
                <UserCard color={'blue'} name={'default_name'}/>
                <UserCard color={'blue'} name={'default_name'}/>
            </CardContainer>
            <Box sx={{width: '100%', height: '30vh', alignSelf: 'flex-end'}}>
                <Chat/>
            </Box>
        </Stack>
    </Container>
}

export default Room;
