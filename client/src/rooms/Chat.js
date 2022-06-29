import {Input} from "antd";
import styled from "styled-components";
import {useCallback, useEffect, useRef, useState} from "react";
import Message from "./Message";

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
    const container = useRef(null);
    const messageBox = useRef(null);
    const [messages, setMessages] = useState([{
        name: '이름',
        message: 'message',
    }])
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

    const handleSendMessage = useCallback((e) => {
        setMessages((prev) => {
            prev.push({name: "이름", message: e.target.value});
            return [...prev];
        })
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
    }, [messages])

    return <ChatContainer ref={container}>
        <MessageBox ref={messageBox}>
            {
                messages.map((v) => {
                    return <Message name={v.name} message={v.message}/>
                })
            }
        </MessageBox>
        <StyledInput value={inputValue} onPressEnter={handleSendMessage} onChange={handleInputValue}/>
    </ChatContainer>
}

export default Chat;