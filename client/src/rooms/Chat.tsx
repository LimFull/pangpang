import {Input} from "antd";
import styled from "styled-components";
import {useCallback, useEffect, useRef, useState} from "react";
import Message from "./Message";
import SnakeMultiplay from "../snake/multiplay/SnakeMultiplay";
import {CLIENT_MESSAGE_TYPE} from "../snake/Constants";
import {ChatRtcData} from "../snake/type/rtc";
import * as roomActions from "../snake/reducers/room";
import {bind, RootState} from "../store";
import {useSelector} from "react-redux";
import _ from 'lodash'
import {Apple} from "../snake/v2/object/Apple";
import {Root} from "react-dom/client";

const {addChat} = bind(roomActions);

const ChatContainer = styled.div`
  display: flex;
  flex: 1;
  width: 95vw;
  background: rgba(0, 0, 0, 0.5);
  flex-direction: column;
  align-items: center;
  overflow: scroll;
  bottom: 0;
`

const MessageBox = styled.div`
  display: flex;
  width: 95vw;
  flex-direction: column;
  padding: 0 12px 8px 12px;
  position: absolute;
  overflow: scroll;

  .ant-typography {
    color: white;
  }
`

const StyledInput = styled(Input)`
  width: 340px;
  font-size: 16px;
  position: fixed;
  bottom: 10px;
`

export function Chat() {
    const [inputValue, setInputValue] = useState('');
    const container = useRef<HTMLDivElement>(null);
    const messageBox = useRef<HTMLDivElement>(null);
    const handleChatPosition = useCallback(() => {
        if (!container.current || !messageBox.current) {
            return;
        }

        const input = document.getElementsByClassName('ant-input')[0];
        const {y: containerY} = container.current.getBoundingClientRect();
        const {y: inputY} = input.getBoundingClientRect();
        messageBox.current.style.height = `${inputY - containerY}px`;
        messageBox.current.style.top = `${containerY}px`;
    }, [])
    const state = useSelector((state: RootState) => state)
    const {chat} = state.room
    const {nickname} = state.account

    const handleSendMessage = useCallback((e) => {
        const chat: ChatRtcData = {name: nickname, message: e.target.value}
        addChat(chat)
        SnakeMultiplay.broadcast<ChatRtcData>(CLIENT_MESSAGE_TYPE.CHAT, chat)
        setInputValue('');
    }, []);

    const handleInputValue = useCallback(e => {
        setInputValue(e.target.value);
    }, [])

    useEffect(() => {
        handleChatPosition();
    }, [])

    useEffect(() => {
        if (!messageBox.current) {
            return;
        }
        messageBox.current.scroll(0, messageBox.current.scrollHeight);
    }, [chat])

    return <ChatContainer ref={container}>
        <MessageBox ref={messageBox}>
            {
                chat.map((v) => {
                    return <Message name={v.name} message={v.message}/>
                })
            }
        </MessageBox>
        <StyledInput value={inputValue} onPressEnter={_.debounce(handleSendMessage, 10)} onChange={handleInputValue}/>
    </ChatContainer>
}

export default Chat;
