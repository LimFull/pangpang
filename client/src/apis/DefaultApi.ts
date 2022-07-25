import {Api, SignInRequest, SignInResult} from "./Api";

export class DefaultApi implements Api {

    private messageConsumers: Map<string, ((message: { type: string, data: any }) => void)[]> = new Map()

    constructor(private socket: WebSocket, onOpen?: (api: Api) => void) {
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

    signIn(request: SignInRequest): Promise<SignInResult> {
        return new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('signIn timed out')), 2000)
            this.messageConsumers.set(
                'SIGN_IN',
                [message => resolve(message.data)]
            )
            this.sendSocketMessage('SIGN_IN', request)
        })
    }

    private sendSocketMessage(type: string, data: any) {
        return this.socket.send(JSON.stringify({type: type, data: data}))
    }
}