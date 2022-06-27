import styled from "styled-components";
import {Button, Typography} from "antd";

const {Title} = Typography;


const CardContainer = styled.div`
  display: flex;
  width: 360px;
  height: 100px;
  background: #d2dad2;
  border-radius: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin: 16px;

`

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  align-items: flex-start;

  .ant-typography {
    margin: 0;
    line-height: 6px;
  }
`


const JoinButton = styled(Button)`
  width: 80px;
  height: 40px;
`


export function RoomCard({roomId = 0, roomTitle = 'Default'}) {
    return <CardContainer>
        <InfoContainer>
            <Title style={{color: '#5e5e5e'}} level={5}>{roomId}</Title>
            <Title level={3}>{roomTitle}</Title>
        </InfoContainer>
        <JoinButton>입장</JoinButton>
    </CardContainer>
}
