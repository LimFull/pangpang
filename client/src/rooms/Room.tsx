import styled from "styled-components";
import Chat from "./Chat";
import {Box, Container, Stack} from "@mui/material";
import UserCard from "./UserCard";

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
    return <Container>
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
