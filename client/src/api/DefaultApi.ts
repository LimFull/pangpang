import {Api, ChatMessage, CreateRoomResult, JoinRoomResult, RoomModel, SignInRequest, SignInResult} from "./index";
import SnakeMultiplay from "../snake/multiplay/SnakeMultiplay";
import {ChatRtcData} from "../snake/type/rtc";
import {CLIENT_MESSAGE_TYPE} from "../snake/Constants";

type Message = { type: string, data: any }

export class DefaultApi implements Api {

    private messageConsumers: Map<string, ((message: Message) => void)[]> = new Map()

    constructor(private socket: WebSocket, onOpen?: (api: Api) => void) {
        this.socket.onopen = (ev: Event) => {
            onOpen && onOpen(this)
        }

        this.socket.onmessage = (ev: MessageEvent) => {
            SnakeMultiplay.socket = this.socket
            SnakeMultiplay.onSocketMessage(ev)
            const message: { type: string, data: any } = JSON.parse(ev.data)
            const subscriber = this.messageConsumers.get(message.type)
            if (subscriber) {
                subscriber.forEach(callback => callback(message))
            }
        }
    }

    subscribeChatMessage(subscriber: (chat: ChatMessage) => void) {
        SnakeMultiplay.consumeChatMessage = (message) => subscriber({name: message.name, text: message.message})
    }

    sendChatMessage(chat: ChatMessage) {
        SnakeMultiplay.broadcast<ChatRtcData>(CLIENT_MESSAGE_TYPE.CHAT, {
            name: chat.name,
            message: chat.text
        })
    }

    joinRoom(roomNumber: number): Promise<JoinRoomResult> {
        return this.awaitMessage('JOIN_ROOM', {roomNumber: roomNumber})
    }

    signIn(request: SignInRequest): Promise<SignInResult> {
        return this.awaitMessage<SignInResult>('SIGN_IN', request).then(result => {
            SnakeMultiplay.id = result.connectionId;
            return result;
        })
    }

    getRooms(): Promise<RoomModel[]> {
        return this.awaitMessage<{ rooms: RoomModel[] }>('GET_ROOMS').then(data => data.rooms)
    }

    createRoom(title: string): Promise<CreateRoomResult> {
        return this.awaitMessage('CREATE_ROOM', {title: title})
    }

    private awaitMessage<R>(type: string, data?: any): Promise<R> {
        return new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error(`${type} timed out`)), 2000)
            this.messageConsumers.set(
                type,
                [message => resolve(message.data)]
            )
            console.log('DefaultApi.sendSocketMessage', type, data)
            this.socket.send(JSON.stringify({type: type, data: data}))
        });
    }

    static init(): Promise<Api> {
        return new Promise(resolve => {
            new DefaultApi(
                new WebSocket('wss://s8sc0oaqbh.execute-api.ap-northeast-2.amazonaws.com/prod'),
                api => resolve(api))
        })
    }
}