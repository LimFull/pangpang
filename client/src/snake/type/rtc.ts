export interface RtcResponse<T> {
    id: string;
    data: T
}

export interface ChatRtcData {
    name: string;
    message: string;
}

export interface ConnectionStateData {
    name?: string;
    connectionState: 'OPEN' | 'CANCEL';
}