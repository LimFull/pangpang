export interface Api {

    signIn(request: SignInRequest): Promise<SignInResult>

    getRooms(): Promise<RoomModel[]>

    createRoom(title: string): Promise<CreateRoomResult>

    joinRoom(roomNumber: number): Promise<JoinRoomResult>
}

export interface RoomApi {
    subscribeChatMessage(subscriber: (chat: ChatMessage) => void)

    sendChatMessage(chat: ChatMessage)
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
    category: 'SYSTEM' | 'MESSAGE';
    name: string;
    text: string;
}