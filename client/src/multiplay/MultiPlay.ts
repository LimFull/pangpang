import {SERVER_MESSAGE_TYPE} from "../snake/Constants";
import {Subject} from "@reactivex/rxjs/dist/package";

const PC_CONFIG = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]};

export interface messageObject {
    type: string,
    data: any
}

interface rtcObject {
    pc?: RTCPeerConnection,
    channel?: RTCDataChannel,
}

// `${userId}::${userId}`
export type connectionKey = `${string}::${string}`

interface connections {
    // 각각의 커넥션마다 고유의 키를 가짐
    [key: connectionKey]: rtcObject
}

export interface MultiPlayInterface {
    onOpen: (data: RTCDataChannel) => () => void;
    onMessage: (message: MessageEvent) => void;
    onSocketMessage: (message: MessageEvent) => void;
}

export class MultiPlay implements MultiPlayInterface {
    connections: connections = {}
    socket: WebSocket | null = null;
    id: string = '';
    subject: Subject<any> = new Subject<any>();

    constructor() {
    }

    subscribe(observer) {
        return this.subject.subscribe(observer)
    }

    createKey(id: number) {
        return `${this.id}::${id}`
    }

    getToIdFromKey(key: connectionKey) {
        const ids = key.split('::').map(v => v);
        return ids[Math.abs(ids.findIndex(v => v === this.id) - 1)];
    }

    getKeyfromId(fromId: number): connectionKey | null {
        for (let connectionsKey in this.connections) {
            if (connectionsKey.includes(fromId.toString())) {
                return connectionsKey as connectionKey;
            }
        }
        return null;
    }

    onSocketMessage(data: MessageEvent) {
        console.log("소켓 메시지", data)
    }

    sendSocketMessage(type: string, data?: object) {
        this.socket!.send(this.toStringMessage(type, {id: this.id, ...data}))
    }

    async connectSocket() {
        return new Promise<void>((resolve, reject) => {
            this.socket = new WebSocket('ws://localhosg:8001');
            // this.socket = new WebSocket('ws://localhost:8001');
            this.socket.onclose = () => {
                console.log("close", this.id);
            }
            this.socket.onopen = () => {
                if (!this.socket) {
                    return
                }
                this.sendSocketMessage(SERVER_MESSAGE_TYPE.GET_ROOMS);
                this.socket.onmessage = this.onSocketMessage;
                resolve();
                this.socket.onerror = (err) => {
                    reject(err)
                }
            };

        })
    }


    broadcast<T>(type: string, data: T) {
        const message = this.toStringMessage(type, data);
        for (let connectionsKey in this.connections) {
            this.connections[connectionsKey].channel.send(message)
        }
    }

    onOpen(channel: RTCDataChannel) {
        return function () {

        }
    }

    onMessage(message: Event): void {
    }

    async initConnection(key: connectionKey) {
        if (!this.connections[key]) this.connections[key] = {}

        const pc = new RTCPeerConnection(PC_CONFIG);

        pc.ondatachannel = (event: RTCDataChannelEvent) => {
            this.connections[key].channel = event.channel;
            this.connections[key].channel!.onopen = this.onOpen(this.connections[key].channel!);
            this.connections[key].channel!.onmessage = this.onMessage;
        };


        pc.onicecandidate = (e) => {
            if (e.candidate) {
                return;
            }
            const sdp = this.connections[key].pc!.localDescription!.sdp;
            // socket..emit('offer', sdp);
            // const textarea = document.getElementById('sdparea')! as HTMLTextAreaElement;
            // textarea.value = btoa(sdp);
        }

        this.connections[key].pc = pc;

        return key;
    }

    async createOffer(key: connectionKey) {
        if (!this.connections[key]) this.connections[key] = {};
        this.connections[key].pc!.ondatachannel!({
            channel: this.connections[key].pc!.createDataChannel('pangpang'),
            bubbles: false,
            cancelBubble: false,
            cancelable: false,
            composed: false,
            currentTarget: null,
            defaultPrevented: false,
            eventPhase: 0,
            isTrusted: false,
            returnValue: false,
            srcElement: null,
            target: null,
            timeStamp: 0,
            type: '',
            composedPath: function (): EventTarget[] {
                throw new Error('Function not implemented.');
            },
            initEvent: function (type: string, bubbles?: boolean | undefined, cancelable?: boolean | undefined): void {
                throw new Error('Function not implemented.');
            },
            preventDefault: function (): void {
                throw new Error('Function not implemented.');
            },
            stopImmediatePropagation: function (): void {
                throw new Error('Function not implemented.');
            },
            stopPropagation: function (): void {
                throw new Error('Function not implemented.');
            },
            AT_TARGET: 0,
            BUBBLING_PHASE: 0,
            CAPTURING_PHASE: 0,
            NONE: 0,
        });

        const sdp = await this.connections[key].pc!.createOffer();

        try {
            await this.connections[key].pc!.setLocalDescription(sdp);
        } catch (e: any) {
            console.log('error', e)
        }
        console.log('to id', this.getToIdFromKey(key), key)
        this.sendSocketMessage(SERVER_MESSAGE_TYPE.CREATE_OFFER, {
            sdp,
            toId: this.getToIdFromKey(key)
        });

    };

    async createAnswer(key: connectionKey, sdp: object) {
        if (!this.connections[key]) this.connections[key] = {};

        const obj: RTCSessionDescription = sdp as RTCSessionDescription;
        try {
            await this.connections[key].pc!.setRemoteDescription(new RTCSessionDescription(obj));
            const sdp1 = await this.connections[key].pc!.createAnswer();
            await this.connections[key].pc!.setLocalDescription(sdp1)
        } catch (e) {
            console.log("creatAnswer error", e)
            return;
        }

        this.connections[key].pc!.onicecandidate = (e) => {
            if (e.candidate) return;

            this.sendSocketMessage(SERVER_MESSAGE_TYPE.CREATE_ANSWER, {
                toId: this.getToIdFromKey(key),
                sdp: this.connections[key].pc!.localDescription!.sdp
            })
        };

        this.connections[key].pc!.oniceconnectionstatechange = (e) => {
            console.log("state change", this.connections[key].pc!.iceConnectionState);
        };
    };

    getAnswer(key: connectionKey, sdp: string) {
        const obj: RTCSessionDescription = {type: 'answer', sdp}! as RTCSessionDescription;

        this.connections[key].pc!.setRemoteDescription(new RTCSessionDescription(obj)).then(() => {
            console.log('remote set success');
        });
    }


    protected toStringMessage(type, data?) {
        const msg: messageObject = {
            type, data
        }
        return JSON.stringify(msg)
    }

    protected toObjectMessage(message: MessageEvent) {
        return JSON.parse(message.data)
    }

}

export default new MultiPlay();
