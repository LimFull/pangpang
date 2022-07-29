import {ChatRtcData, ConnectionStateData} from "../snake/type/rtc";

export interface Api {

    signIn(request: SignInRequest): Promise<SignInResult>

    getRooms(): Promise<RoomModel[]>

    createRoom(title: string): Promise<CreateRoomResult>

    joinRoom(roomNumber: number): Promise<JoinRoomResult>

    subscribeChatMessage(subscriber: (chat: ChatRtcData | ConnectionStateData) => void)

    sendChatMessage(chat: ChatRtcData)
}

export interface SignInRequest {
    name: string;
}

export interface SignInResult {
    id: number;
    connectionId: string;
}

export interface RoomModel {
    title: string
    roomNumber: number
    member: number
}

export interface CreateRoomResult {
    roomNumber: number;
}

export interface JoinRoomResult {
    roomNumber: number;
    title: string;
    color: string;
    userCount: number;
}

export interface ChatMessage {
    name: string;
    text: string;
}