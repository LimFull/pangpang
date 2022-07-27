export interface RtcResponse<T> {
    id: string;
    data: T
}

export interface ChatRtcData {
    name: string;
    message: string;
}
