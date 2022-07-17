export interface CreateRoomResponseData {
    roomNumber: number,
}

export interface GetRoomsResponseData {
    rooms: [
        {
            title: string,
            roomNumber: number,
            member: number,
        }
    ]
}

export interface CreateIdResponseData {
    id: string
}

export interface JoinRoomResponseData {
    roomNumber: number
}

export interface CreateOfferResponseData {
    id: number
}

export interface CreateAnswerResponseData {
    fromId: number,
    sdp: object
}

export interface GetAnswerResponseData {
    fromId: number,
    sdp: string
}

export interface CandidateData {
    fromId: number,
    candidate: object;
}