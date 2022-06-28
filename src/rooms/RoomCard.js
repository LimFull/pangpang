import styled from "styled-components";
import {Button, Typography} from "antd";

const {Title, Text} = Typography;


const CardContainer = styled.div`
  display: flex;
  width: 360px;
  height: 100px;
  background: #d2dad2;
  border-radius: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin: 6px;
  flex-direction: column;
  border: solid 2px rgba(0, 0, 0, 0.14);
  box-shadow: 3px 2px 3px 1px rgba(0, 0, 0, 0.33);

`

const InfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-between;


  .ant-typography {
    margin: 0;
    line-height: 6px;
  }
`


const JoinButton = styled(Button)`
  width: 80px;
  height: 40px;
`


export function RoomCard({roomId = 0, roomTitle = 'Default', member = 0}) {
    return <CardContainer>
        <InfoContainer>
            <Text style={{color: '#5e5e5e'}} level={5}>{roomId}</Text>
            <Text style={{color: '#5e5e5e'}}
                  level={5}>{member}/4</Text>
        </InfoContainer>
        <InfoContainer style={{paddingBottom: 8, paddingTop: 10}}>
            <Title level={3}>{roomTitle}</Title>
            <JoinButton>입장</JoinButton>
        </InfoContainer>
    </CardContainer>
}
