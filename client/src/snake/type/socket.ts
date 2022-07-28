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
    id: string
}

export interface CreateAnswerResponseData {
    fromId: string,
    sdp: object
}

export interface GetAnswerResponseData {
    fromId: string,
    sdp: string
}

export interface CandidateData {
    fromId: string,
    candidate: object;
}
