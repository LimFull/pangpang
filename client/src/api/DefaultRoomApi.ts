import {ChatMessage, RoomApi} from "./index";
import WebRTCConnectionManager from "./webrtc/WebRTCConnectionManager";
import {WebRTCMessage} from "./webrtc";
import {Session} from "../session";
import {DefaultApi} from "./DefaultApi";

export class DefaultRoomApi implements RoomApi {

    private messageConsumers: Map<string, (message: WebRTCMessage<any>) => void> = new Map()

    constructor(private rtcConnection: WebRTCConnectionManager) {
        this.rtcConnection.rtcMessageListener = (message: WebRTCMessage<any>) => {
            const consumer = this.messageConsumers.get(message.type)
            consumer && consumer(message)
        }
    }

    static init(session: Session): DefaultRoomApi {
        return new DefaultRoomApi(new WebRTCConnectionManager(session.user, session.user.connectionId, (session.api as DefaultApi).socket))
    }

    sendChatMessage(chat: ChatMessage) {
        this.rtcConnection.broadcast('CHAT', {
            name: chat.name,
            message: chat.text
        })
    }

    subscribeChatMessage(subscriber: (chat: ChatMessage) => void) {
        this.messageConsumers.set('CHAT', ev => subscriber({
            category: 'MESSAGE',
            name: ev.data.name,
            text: ev.data.message
        }))
        this.messageConsumers.set('OPEN', ev => subscriber({
            category: 'SYSTEM',
            name: ev.data.name,
            text: `${ev.data.name} 님이 입장하셨습니다.`
        }))
        this.messageConsumers.set('CANCEL', ev => subscriber({
            category: 'SYSTEM',
            name: ev.data.name,
            text: `${ev.data.name} 님이 퇴장하셨습니다.`
        }))
    }
}
