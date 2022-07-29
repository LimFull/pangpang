import React, {useEffect, useRef, useState} from "react";
import {useSession} from "../session";
import {List, ListItem, Stack, TextField} from "@mui/material";
import _ from 'lodash'
import {ChatRtcData, ConnectionStateData} from "../snake/type/rtc";

export function Chat() {
    const session = useSession()
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Array<ChatRtcData | ConnectionStateData>>([]);
    const messageBox = useRef<HTMLUListElement>(null);

    const sendMessage = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && message) {
            const chat: ChatRtcData = {name: session.user.name, message: message}
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

    return <Stack sx={{height: 'inherit'}}>
        <List
            dense
            ref={messageBox}
            sx={{overflowY: 'scroll', backgroundColor: 'rgba(0,0,0,0.75)', height: '100%'}}>
            {messages.map((v, idx) => {
                let msg = '';
                if ('message' in v) {
                    msg = `${v.name} : ${v.message}`
                } else if ('connectionState' in v && v.connectionState === 'OPEN') {
                    msg = `${v.name} 님이 입장하셨습니다.`
                } else if ('connectionState' in v && v.connectionState === 'CANCEL') {
                    msg = `${v.name} 님이 퇴장하셨습니다.`
                }
                return <ListItem
                    sx={{paddingTop: '1px', paddingBottom: '1px', color: 'rgb(255,255,255)'}}
                    key={idx}>
                    {msg}
                </ListItem>
            })}
        </List>
        <TextField
            sx={{width: '100%', alignSelf: 'flex-end'}}
            hiddenLabel
            placeholder="send message"
            variant="filled"
            size='small'
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={_.debounce(sendMessage, 10)}
        />
    </Stack>
}

export default Chat;
