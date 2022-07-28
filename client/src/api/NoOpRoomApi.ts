import {ChatMessage, RoomApi} from "./index";

export class NoOpRoomApi implements RoomApi {
    static instance = new NoOpRoomApi()

    sendChatMessage(chat: ChatMessage) {
    }

    subscribeChatMessage(subscriber: (chat: ChatMessage) => void) {
    }
}