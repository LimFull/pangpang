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

export interface WebRTCMessage<T> {
    id: string;
    type: string;
    data: T;
}

export interface ChatRtcData {
    name: string;
    message: string;
}

export interface ConnectionStateData {
    name?: string;
    connectionState: 'OPEN' | 'CANCEL';
}