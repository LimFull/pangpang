import {CLIENT_MESSAGE_TYPE, SERVER_MESSAGE_TYPE} from "../../snake/Constants";
import {User} from "../../session";
import {
    CandidateData,
    ConnectionStateData,
    CreateAnswerResponseData,
    CreateOfferResponseData,
    GetAnswerResponseData,
    WebRTCMessage
} from "./index";

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

interface rtcObject {
    pc?: RTCPeerConnection;
    channel?: RTCDataChannel;
    candidate?: RTCIceCandidate;
    name?: string;
}

// `${userId}::${userId}`
export type connectionKey = `${string}::${string}`

export default class WebRTCConnectionManager {
    connections: Map<connectionKey, rtcObject> = new Map();

    constructor(
        private user: User,
        private connectionId: string,
        private socket: WebSocket
    ) {
        if (socket.onmessage) {
            const originOnMessage = socket.onmessage!!
            socket.onmessage = (ev: MessageEvent) => {
                this.prepareConnection(ev);
                originOnMessage.call(socket, ev);
            }
        } else {
            socket.onmessage = this.prepareConnection
        }

        window.addEventListener('beforeunload', () => {
            Object.values(this.connections).forEach(c => {
                c.channel.close();
                c.pc.close();
            });
        })
    }

    rtcMessageListener: (ev: WebRTCMessage<any>) => void = () => {
    }

    createKey(connectionId: string) {
        return `${this.connectionId}::${connectionId}`
    }

    getToIdFromKey(key: connectionKey) {
        const ids = key.split('::').map(v => v);
        return ids[Math.abs(ids.findIndex(v => v === this.connectionId) - 1)];
    }

    getKeyfromId(fromId: string): connectionKey | null {
        for (let connectionsKey in this.connections) {
            if (connectionsKey.includes(fromId.toString())) {
                return connectionsKey as connectionKey;
            }
        }
        return null;
    }

    prepareConnection(data: MessageEvent) {
        const msg = this.toObjectMessage(data)
        console.log('prepareConnection', msg.type, msg.data)
        if (msg.type === SERVER_MESSAGE_TYPE.INIT_CONNECTION) {
            const data: CreateOfferResponseData = msg.data;
            this.initConnection(this.createKey(data.id) as connectionKey).then(key => this.createOffer(key))
        } else if (msg.type === SERVER_MESSAGE_TYPE.CREATE_ANSWER) {
            const data: CreateAnswerResponseData = msg.data;
            this.initConnection(this.createKey(data.fromId) as connectionKey).then(key => this.createAnswer(key, data.sdp))
        } else if (msg.type === SERVER_MESSAGE_TYPE.GET_ANSWER) {
            const data: GetAnswerResponseData = msg.data;
            const answerKey = this.getKeyfromId(data.fromId);
            if (!answerKey) return;
            this.getAnswer(answerKey, data.sdp)
        } else if (msg.type === SERVER_MESSAGE_TYPE.CANDIDATE) {
            const data: CandidateData = msg.data;
            const candidateKey = this.getKeyfromId(data.fromId);
            if (!candidateKey) return;
            this.candidate(candidateKey, data.candidate)
        }
    }

    sendSocketMessage(type: string, data?: object) {
        this.socket!.send(this.toStringMessage(type, {id: this.connectionId, ...data}))
    }

    broadcast<T>(type: string, data: T) {
        const message = this.toStringMessage(type, data);
        for (let connectionsKey in this.connections) {
            try {
                this.connections[connectionsKey].channel.send(message)
            } catch (e) {
                console.log(e, this.connections[connectionsKey]);
            }
        }
    }

    onOpen(channel: RTCDataChannel) {
        return () => {
            const stateData: ConnectionStateData = {
                name: this.user.name,
                connectionState: "OPEN",
            }

            this.broadcast(CLIENT_MESSAGE_TYPE.OPEN, stateData)
        };
    }

    onMessage(message: MessageEvent): void {
        const msg = this.toObjectMessage(message);
        this.rtcMessageListener(msg)
    }

    lossConnection(key: string): void {
        const data: ConnectionStateData = {
            name: this.connections[key].name,
            connectionState: 'CANCEL',
        }
        // this.rtcMessageListener(data)
        delete this.connections[key];
    }

    async initConnection(key: connectionKey) {
        if (!this.connections[key]) this.connections[key] = {}

        const pc = new RTCPeerConnection(PC_CONFIG);

        pc.onicecandidate = (e) => {
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
            console.log("state change", state, e);
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
        this.connections[key].channel!.onopen = this.onOpen(this.connections[key].channel!);
        this.connections[key].channel!.onmessage = ev => this.onMessage(ev);
        this.connections[key].channel!.onclose = () => console.log("Data Channel closed, key =", key)

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
            this.connections[key].channel!.onopen = this.onOpen(this.connections[key].channel!);
            this.connections[key].channel!.onmessage = ev => this.onMessage(ev);
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
        const msg: WebRTCMessage<any> = {type, id: this.connectionId, data}
        return JSON.stringify(msg)
    }

    protected toObjectMessage(message: MessageEvent): WebRTCMessage<any> {
        return JSON.parse(message.data)
    }
}

