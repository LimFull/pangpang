export interface Api {

    signIn(request: SignInRequest): Promise<SignInResult>

    getRooms(): Promise<RoomModel[]>

    createRoom(title: string): Promise<CreateRoomResult>

    joinRoom(roomNumber: number): Promise<JoinRoomResult>
}

export interface SignInRequest {
    name: string;
}

export interface SignInResult {
    id: number
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
}