export interface Api {

    signIn(request: SignInRequest): Promise<SignInResult>

    // getRooms(): Room[]
    //
    // createRoom()
    //
    // joinRoom()
}

export interface SignInRequest {
    name: string;
}

export interface SignInResult {
    id: number
}

export interface Room {
    title: string
    roomNumber: number
    member: number
}

export interface CreateRoomResult {
    roomNumber: number;
}