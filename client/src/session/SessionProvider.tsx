import * as React from "react";
import {useState} from "react";
import {Session, SessionContext} from "./index";
import {useDispatch, useSelector} from "react-redux";
import {SET_NICKNAME} from "../snake/reducers/account";
import styled from "styled-components";
import {RootState} from "../store";
import {SignIn} from "./SignIn";

const Container = styled.div`
  display: flex;
  flex: 1;
  width: 100vw;
  height: 100vh;
  background-color: blue;
  position: fixed;
  flex-direction: column;
  overflow: scroll;
`

interface Props {
    children: React.ReactNode;
}

export default function SessionProvider(props: Props) {
    const dispatch = useDispatch();
    const {nickname} = useSelector((state: RootState) => state.account);
    const [session, setSession] = useState<Session | null>(() => {
        if (nickname) return {user: {name: nickname}}
        return null
    });
    if (session) {
        return (
            <Container>
                <SessionContext.Provider value={session}>
                    {props.children}
                </SessionContext.Provider>
            </Container>
        )
    }
    return <SignIn complete={user => {
        setSession({user: user})
        dispatch({type: SET_NICKNAME, payload: {nickname: user.name}})
    }}/>
};
