import {Api, CreateRoomResult, JoinRoomResult, RoomModel, SignInRequest, SignInResult} from "./index";

type Message = { type: string, data: any }

export class DefaultApi implements Api {

    private messageConsumers: Map<string, ((message: Message) => void)[]> = new Map()

    private user: { id: number, connectionId: string } = {id: 0, connectionId: ''}

    constructor(public socket: WebSocket, onOpen?: (api: Api) => void) {
        this.socket.onopen = (ev: Event) => {
            onOpen && onOpen(this)
        }

        this.socket.onmessage = (ev: MessageEvent) => {
            const message: { type: string, data: any } = JSON.parse(ev.data)
            const subscriber = this.messageConsumers.get(message.type)
            if (subscriber) {
                subscriber.forEach(callback => callback(message))
            }
        }
    }

    static init(): Promise<Api> {
        return new Promise(resolve => {
            new DefaultApi(
                new WebSocket('wss://s8sc0oaqbh.execute-api.ap-northeast-2.amazonaws.com/prod'),
                api => resolve(api))
        })
    }

    joinRoom(roomNumber: number): Promise<JoinRoomResult> {
        return this.awaitMessage('JOIN_ROOM', {roomNumber: roomNumber})
    }

    signIn(request: SignInRequest): Promise<SignInResult> {
        return this.awaitMessage<SignInResult>('SIGN_IN', request).then(result => {
            this.user.id = result.id
            this.user.connectionId = result.connectionId
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
            console.log('awaitMessage', type, data)
            this.socket.send(JSON.stringify({type: type, data: data, uid: this.user.id}))
        });
    }
}