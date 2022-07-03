import {Typography} from "antd";

const {Text} = Typography;

interface MessageProps {
    message: string,
    name: string,
}

export function Message({
                            message = '', name = 'default_name'
                        }: MessageProps) {

    return <Text>{name} : {message}</Text>
}

export default Message;