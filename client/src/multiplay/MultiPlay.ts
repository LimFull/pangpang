import {SERVER_MESSAGE_TYPE} from "../snake/Constants";
import {Subject} from "@reactivex/rxjs/dist/package";

// TODO: 턴서버 바꿔야 함
const PC_CONFIG = {
    iceServers: [
        {
            urls: "turn:3.38.153.182:3478",
            username: "user",
            credential: "pang",
        },
        {
            urls: "stun:openrelay.metered.ca:80",
        },
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
        {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
        {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
    ]
};

export interface messageObject {
    id: string,
    type: string,
    data: any,
}

interface rtcObject {
    pc?: RTCPeerConnection,
    channel?: RTCDataChannel,
    candidate?: RTCIceCandidate
}

// `${userId}::${userId}`
export type connectionKey = `${string}::${string}`

interface connections {
    // 각각의 커넥션마다 고유의 키를 가짐
    [key: connectionKey]: rtcObject
}

export interface MultiPlayInterface {
    onOpen: (key: connectionKey) => () => void;
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

    createKey(id: string) {
        return `${this.id}::${id}`
    }

    getToIdFromKey(key: connectionKey) {
        const ids = key.split('::').map(v => v);
        return ids[Math.abs(ids.findIndex(v => v === this.id) - 1)];
    }

    getKeyfromId(fromId: string): connectionKey | null {
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
            this.socket = new WebSocket('wss://s8sc0oaqbh.execute-api.ap-northeast-2.amazonaws.com/prod');
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
            try {
                this.connections[connectionsKey].channel.send(message)
            } catch (e) {
                console.log(e);
            }
        }
    }

    sendTo<T>(key: connectionKey, type: string, data: T) {
        const message = this.toStringMessage(type, data);
        try {
            this.connections[key].channel!.send(message);
        } catch (e) {
            console.log(e);
        }
    }

    onOpen(key: connectionKey) {
        return function () {

        }
    }

    onMessage(message: Event): void {
    }

    lossConnection(key: string): void {
        console.log("loss Connection", key)
        delete this.connections[key];
    }

    async initConnection(key: connectionKey) {
        if (!this.connections[key]) this.connections[key] = {}

        const pc = new RTCPeerConnection(PC_CONFIG);

        pc.onicecandidate = (e) => {

            console.log("onIceCandidate", e.candidate)
            if (e.candidate) {
                this.connections[key].candidate = e.candidate
            }
            if (e.candidate) {
                return;
            }
            this.sendSocketMessage(SERVER_MESSAGE_TYPE.CANDIDATE, {
                toId: this.getToIdFromKey(key),
                candidate: this.connections[key].candidate
            })
        }

        this.connections[key].pc = pc;

        this.connections[key].pc!.oniceconnectionstatechange = (e) => {
            const state = this.connections[key].pc!.iceConnectionState
            console.log("state change", state);
            if (state === 'disconnected') {
                this.lossConnection(key);
            }
        };
        return key;

    }

    async createOffer(key: connectionKey) {
        console.log("createOffer")
        if (!this.connections[key]) this.connections[key] = {};

        this.connections[key].channel = this.connections[key].pc!.createDataChannel('pangpang');
        this.connections[key].channel!.onopen = this.onOpen(key);
        this.connections[key].channel!.onmessage = this.onMessage;
        this.connections[key].channel!.onclose = () => {
            console.log("Data Channel closed, key =", key)
        }

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
        this.connections[key].pc!.ondatachannel = (event) => {
            this.connections[key].channel = event.channel;
            this.connections[key].channel!.onopen = this.onOpen(key);
            this.connections[key].channel!.onmessage = this.onMessage;
            this.connections[key].channel!.onclose = () => {
                console.log("Data Channel closed, key =", key)
            }
        }

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
            if (e.candidate) {
                this.connections[key].candidate = e.candidate
            }
            if (e.candidate) return;

            this.sendSocketMessage(SERVER_MESSAGE_TYPE.CREATE_ANSWER, {
                toId: this.getToIdFromKey(key),
                sdp: this.connections[key].pc!.localDescription!.sdp
            })
            this.sendSocketMessage(SERVER_MESSAGE_TYPE.CANDIDATE, {
                toId: this.getToIdFromKey(key),
                candidate: this.connections[key].candidate
            })
        };

        // this.connections[key].pc!.oniceconnectionstatechange = (e) => {
        //     const state = this.connections[key].pc!.iceConnectionState
        //     console.log("state change", state);
        //     if (state === 'disconnected') {
        //         console.log("연결 끊김", key)
        //     }
        // };
    };

    getAnswer(key: connectionKey, sdp: string) {
        const obj: RTCSessionDescription = {type: 'answer', sdp}! as RTCSessionDescription;

        this.connections[key].pc!.setRemoteDescription(new RTCSessionDescription(obj)).then(() => {
            console.log('remote set success');
        });
    }

    candidate(key: connectionKey, candidate: object) {
        this.connections[key].pc!.addIceCandidate(candidate as RTCIceCandidateInit)
    }


    protected toStringMessage(type, data?) {
        const msg: messageObject = {
            type, id: this.id, data
        }
        return JSON.stringify(msg)
    }

    protected toObjectMessage(message: MessageEvent) {
        return JSON.parse(message.data)
    }

}

export default new MultiPlay();
