import styled from "styled-components";
import {ReactNode} from "react";

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
    return <Container>
        {children}
    </Container>
}

export default PageWrapper
