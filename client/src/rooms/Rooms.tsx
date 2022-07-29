import CreateRoomModal from "./CreateRoomModal";
import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {RoomModel} from "../api";
import {useSession} from "../session";
import {useStateWithInitializer} from "../util";
import {Button, Divider, Grid, List, ListItem, ListItemText, Stack} from "@mui/material";
import {useDispatch} from "react-redux";
import {RESET_USERS} from "../snake/reducers/users";

export default function Rooms() {
    const session = useSession();
    const [rooms] = useStateWithInitializer<RoomModel[]>([], () => session.api.getRooms())
    const [showModal, setShowModal] = useState<boolean>(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const navigateRoom = (roomNumber: number) => navigate(`/rooms/${roomNumber}`)

    const handleCreateRoom = useCallback(async (title: string) => {
        const data = await session.api.createRoom(title)
        navigateRoom(data.roomNumber)
    }, []);

    const handleShowModal = useCallback(async () => {
        setShowModal(true);
    }, []);

    const handleCancelModal = useCallback(() => {
        setShowModal(false);
    }, [])

    useEffect(() => {
        dispatch({type: RESET_USERS})
    }, [])

    return <Stack>
        <Button color='primary' onClick={handleShowModal}>방 만들기</Button>
        <CreateRoomModal visible={showModal} onCreate={handleCreateRoom} onCancel={handleCancelModal}/>
        <Grid container>
            <Grid item xs={1} xl={1} sm={1} md={1} lg={1}/>
            <Grid item xs={10} xl={10} sm={10} md={10} lg={10}>
                <List>
                    {rooms.map((room, idx) =>
                        <>
                            <ListItem
                                key={room.roomNumber}
                                secondaryAction={
                                    <Button
                                        size="large"
                                        color='primary'
                                        variant="outlined"
                                        onClick={() => navigateRoom(room.roomNumber)}>enter</Button>
                                }>
                                <ListItemText
                                    primary={room.title}
                                    secondary={`${room.roomNumber} ${room.member}/4`}
                                />
                            </ListItem>
                            {idx < rooms.length - 1 && <Divider variant="inset" component="li"/>}
                        </>
                    )}
                </List>
            </Grid>
            <Grid item xs={1} xl={1} sm={1} md={1} lg={1}/>
        </Grid>
    </Stack>
}