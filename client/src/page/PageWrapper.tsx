import styled from "styled-components";
import {ReactNode} from "react";
import {useSelector} from "react-redux";
import {RootState} from "../store";
import Nickname from "./Nickname";

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

interface PageWrapper {
    children: ReactNode;
}

export function PageWrapper({children}: PageWrapper) {
    const {nickname} = useSelector((state: RootState) => state.account);
    
    if (!nickname) {
        return <Nickname/>
    }

    return <Container>
        {children}
    </Container>
}

export default PageWrapper
