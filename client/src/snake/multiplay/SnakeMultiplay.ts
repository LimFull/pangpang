import {connectionKey, messageObject, MultiPlay, MultiPlayInterface} from "../../multiplay/MultiPlay";
import {CLIENT_MESSAGE_TYPE, SERVER_MESSAGE_TYPE} from "../Constants";
import * as roomActions from "../reducers/room";
import * as multiActions from '../reducers/multi';
import {bind} from "../../store";
import {
    CandidateData,
    CreateAnswerResponseData,
    CreateIdResponseData,
    CreateOfferResponseData,
    CreateRoomResponseData,
    GetAnswerResponseData,
    GetRoomsResponseData,
    JoinRoomResponseData
} from "../type/socket";
import {ChatRtcData} from "../type/rtc";

const {setRoomNumber, setRooms, addChat} = bind(roomActions)
const {setId} = bind(multiActions);

export class SnakeMultiplay extends MultiPlay implements MultiPlayInterface {
    constructor() {
        super();
    }

    async connectSocket(): Promise<void> {
        await super.connectSocket();

    }

    createRoom(title: string) {
        this.sendSocketMessage(SERVER_MESSAGE_TYPE.CREATE_ROOM, {title})
    }

    getRooms() {
        this.sendSocketMessage(SERVER_MESSAGE_TYPE.GET_ROOMS);
    }

    joinRoom(roomNumber: number) {
        console.log("joinRoom", roomNumber)
        this.sendSocketMessage(SERVER_MESSAGE_TYPE.JOIN_ROOM, {roomNumber})
    }

    onSocketMessage = (message: MessageEvent) => {
        const msg: messageObject = this.toObjectMessage(message)
        console.log('onSocketMessage', msg.type, msg.data)
        if (msg.type === SERVER_MESSAGE_TYPE.CREATE_ID) {
            const data: CreateIdResponseData = msg.data;
            this.id = data.id;
            setId(this.id);
        } else if (msg.type === SERVER_MESSAGE_TYPE.CREATE_ROOM) {
            const data: CreateRoomResponseData = msg.data;
            setRoomNumber(data.roomNumber);
        } else if (msg.type === SERVER_MESSAGE_TYPE.GET_ROOMS) {
            const data: GetRoomsResponseData = msg.data;
            setRooms(data.rooms);
        } else if (msg.type === SERVER_MESSAGE_TYPE.JOIN_ROOM) {
            const data: JoinRoomResponseData = msg.data;
            setRoomNumber(data.roomNumber);
        } else if (msg.type === SERVER_MESSAGE_TYPE.INIT_CONNECTION) {
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

    onOpen(data: RTCDataChannel): () => void {
        return () => {
            console.log("hello send");
            this.broadcast(CLIENT_MESSAGE_TYPE.OPEN, "HELLO!!!!!!")
        };
    }

    onMessage = (message: MessageEvent) => {
        const msg: messageObject = this.toObjectMessage(message);
        console.log("message", msg);
        if (msg.type === CLIENT_MESSAGE_TYPE.CHAT) {
            const data: ChatRtcData = msg.data
            addChat(data)
        }

        // SnakeObserverObject 들에게 보냄
        this.subject.next(msg);
    }
}

export default new SnakeMultiplay();
