import React, {useEffect, useRef, useState} from "react";
import {useSession} from "../session";
import {Container, List, ListItem, Stack, TextField} from "@mui/material";
import {ChatMessage} from "../api";
import _ from 'lodash'

export function Chat() {
    const session = useSession()
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const messageBox = useRef<HTMLUListElement>(null);

    const sendMessage = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && message) {
            const chat: ChatMessage = {name: session.user.name, text: message}
            setMessages(prevMessages => [...prevMessages, chat])
            setMessage('');
            session.api.sendChatMessage(chat)
        }
    };

    useEffect(() => {
        session.api.subscribeChatMessage(m => setMessages(prevMessages => [...prevMessages, m]))
    }, [])

    useEffect(() => {
        messageBox?.current?.scroll(0, messageBox?.current?.scrollHeight);
    }, [messages])

    return <Container sx={{height: 'inherit'}}>
        <Stack sx={{height: 'inherit'}}>
            <List
                dense
                ref={messageBox}
                sx={{overflowY: 'scroll', backgroundColor: 'rgba(0, 0, 0, 0.5)', height: '100%'}}>
                {messages.map((v, idx) => {
                    if (v.name === session.user.name) {
                        return <ListItem dense key={idx} sx={{display: 'block', textAlign: 'right'}}>{v.text}</ListItem>
                    }
                    return <ListItem dense key={idx}>{v.name} : {v.text}</ListItem>
                })}
            </List>
            <TextField
                sx={{width: '100%', alignSelf: 'flex-end'}}
                placeholder="send message"
                variant="filled"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={_.debounce(sendMessage, 10)}
            />
        </Stack>
    </Container>
}

export default Chat;
