import {connectionKey, messageObject, MultiPlay, MultiPlayInterface} from "../../multiplay/MultiPlay";
import {CLIENT_MESSAGE_TYPE, SERVER_MESSAGE_TYPE} from "../Constants";
import {CandidateData, CreateAnswerResponseData, CreateOfferResponseData, GetAnswerResponseData} from "../type/socket";
import {ChatRtcData} from "../type/rtc";

export class SnakeMultiplay extends MultiPlay implements MultiPlayInterface {
    constructor() {
        super();
    }

    consumeChatMessage: (message: ChatRtcData) => void = () => {
    }

    onSocketMessage = (message: MessageEvent) => {
        const msg: messageObject = this.toObjectMessage(message)
        console.log('onSocketMessage', msg.type, msg.data)
        if (msg.type === SERVER_MESSAGE_TYPE.INIT_CONNECTION) {
            const data: CreateOfferResponseData = msg.data;
            this.initConnection(this.createKey(data.id) as connectionKey)
                .then(key => {
                    this.createOffer(key)
                })
        } else if (msg.type === SERVER_MESSAGE_TYPE.CREATE_ANSWER) {
            const data: CreateAnswerResponseData = msg.data;
            this.initConnection(this.createKey(data.fromId) as connectionKey).then((key) => {
                this.createAnswer(key, data.sdp);
            })
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

    lossConnection(key: string): void {
        super.lossConnection(key);
        // TODO: 나갔습니다.
    }

    onOpen(data: RTCDataChannel): () => void {
        return () => {
            console.log("hello send");
            this.broadcast(CLIENT_MESSAGE_TYPE.OPEN, "HELLO!!!!!!")
        };
    }

    onMessage = (message: MessageEvent) => {
        const msg: messageObject = this.toObjectMessage(message);
        if (msg.type === CLIENT_MESSAGE_TYPE.CHAT) {
            this.consumeChatMessage(msg.data)
        }

        // SnakeObserverObject 들에게 보냄
        this.subject.next(msg);
    }
}

export default new SnakeMultiplay();
