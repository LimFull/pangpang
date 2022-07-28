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

class Connection {
    constructor(
        public pc: RTCPeerConnection,
        public channel?: RTCDataChannel,
        public name: string = 'waiting'
    ) {
    }
}

export default class WebRTCConnectionManager {
    connections: Map<any, Connection> = new Map();

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

    prepareConnection(data: MessageEvent) {
        const msg = this.toObjectMessage(data)
        console.log('prepareConnection', msg.type, msg.data)
        if (msg.type === SERVER_MESSAGE_TYPE.INIT_CONNECTION) {
            const data: CreateOfferResponseData = msg.data;
            this.createOffer(data.id, this.initConnection(data.id)).then()
        } else if (msg.type === SERVER_MESSAGE_TYPE.CREATE_ANSWER) {
            const data: CreateAnswerResponseData = msg.data;
            this.createAnswer(data.fromId, data.sdp, this.initConnection(data.fromId)).then()
        } else if (msg.type === SERVER_MESSAGE_TYPE.GET_ANSWER) {
            const data: GetAnswerResponseData = msg.data;
            this.getAnswer(data.fromId, data.sdp).then()
        } else if (msg.type === SERVER_MESSAGE_TYPE.CANDIDATE) {
            const data: CandidateData = msg.data;
            this.candidate(data.fromId, data.sdp)
        }
    }

    sendSocketMessage(type: string, data?: object) {
        this.socket!.send(this.toStringMessage(type, {id: this.connectionId, ...data}))
    }

    broadcast<T>(type: string, data: T) {
        const message = this.toStringMessage(type, data);
        this.connections.forEach((conn, key) => {
            try {
                conn.channel?.send(message)
            } catch (e) {
                console.log(e, conn);
            }
        })
    }

    onOpen() {
        console.log('open...')
        return () => {
            const stateData: ConnectionStateData = {
                name: this.user.name,
                connectionState: "OPEN",
            }

            this.broadcast(CLIENT_MESSAGE_TYPE.OPEN, stateData)
        };
    }

    onMessage(message: MessageEvent): void {
        console.log('onMessage', message)
        const msg = this.toObjectMessage(message);
        this.rtcMessageListener(msg)
    }

    lossConnection(remoteId: string): void {
        console.log('lossConnection', remoteId)
        const data: ConnectionStateData = {
            name: this.connections.get(remoteId)?.name || '',
            connectionState: 'CANCEL',
        }
        // this.rtcMessageListener(data)
        this.connections.delete(remoteId);
    }

    initConnection(remoteId): Connection {
        const pc = new RTCPeerConnection(PC_CONFIG)
        const conn = new Connection(pc)
        this.connections.set(remoteId, conn);

        pc.onicecandidate = e => e.candidate && this.sendSocketMessage(SERVER_MESSAGE_TYPE.CANDIDATE, {
            toId: remoteId,
            candidate: e.candidate.toJSON()
        })

        pc.oniceconnectionstatechange = e => {
            const state = conn.pc.iceConnectionState
            console.log("state change", state, e);
            if (state === 'disconnected') {
                this.lossConnection(remoteId);
            }
        };

        return conn
    }

    async createOffer(remoteId, conn: Connection) {
        console.log(`[${this.connectionId}] create offer`, remoteId)
        let local: RTCPeerConnection = conn.pc

        let channel = local.createDataChannel('pangpang');
        channel.onopen = this.onOpen();
        channel.onmessage = ev => this.onMessage(ev);
        channel.onclose = () => console.log("Data Channel closed, key =", remoteId)
        channel.onerror = e => console.error("err", remoteId, e)
        conn.channel = channel

        const offer = await local.createOffer();
        await local.setLocalDescription(offer)

        this.sendSocketMessage(SERVER_MESSAGE_TYPE.CREATE_OFFER, {
            sdp: local.localDescription!.toJSON(),
            toId: remoteId
        });
    };

    async createAnswer(remoteId, sdp: object, conn: Connection) {
        console.log(`[${this.connectionId}] create answer`, remoteId)
        let remote: RTCPeerConnection = conn.pc
        remote.ondatachannel = e => {
            const channel = e.channel;
            channel.onopen = this.onOpen();
            channel.onclose = () => console.log("Data Channel closed, key =")
            channel.onmessage = ev => this.onMessage(ev);
            conn.channel = channel
        }

        try {
            const offer = sdp as RTCSessionDescription;
            await remote.setRemoteDescription(offer)
            const answer = await remote.createAnswer()
            await remote.setLocalDescription(answer)
            this.sendSocketMessage(SERVER_MESSAGE_TYPE.CREATE_ANSWER, {
                sdp: remote.localDescription!.toJSON(),
                toId: remoteId
            });
        } catch (e) {
            console.log("creatAnswer error", e)
            return;
        }
    };

    async getAnswer(remoteId, sdp: object) {
        const local = this.connections.get(remoteId)?.pc
        await local?.setRemoteDescription(new RTCSessionDescription(sdp as RTCSessionDescriptionInit)).then(() => {
            console.log('remote set success')
        })
    }

    candidate(remoteId, candidate: RTCIceCandidateInit) {
        this.connections.get(remoteId)?.pc?.addIceCandidate(candidate)
            .then(() => console.log('addIceCandidate success', candidate))
            .catch(e => console.error('addIceCandidate error', e))
    }

    protected toStringMessage(type, data?) {
        const msg: WebRTCMessage<any> = {type, id: this.connectionId, data}
        return JSON.stringify(msg)
    }

    protected toObjectMessage(message: MessageEvent): WebRTCMessage<any> {
        return JSON.parse(message.data)
    }
}
