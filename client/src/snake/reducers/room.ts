import {ChatRtcData} from "../type/rtc";

interface RoomStateType {
    roomNumber: number,
    rooms: any[],
    chat: ChatRtcData[],
}

const initialState: RoomStateType = {
    roomNumber: 0,
    rooms: [],
    chat: [],
}

const SET_ROOM_NUMBER = "SET_ROOM_NUMBER";
const RESET_ROOM = 'RESET_ROOM';
const SET_ROOMS = 'SET_ROOMS';
const ADD_CHAT = 'ADD_CHAT';

const roomReducer = (state = initialState, action) => {
    switch (action.type) {
        case RESET_ROOM: {
            return initialState
        }
        case SET_ROOM_NUMBER:
        case SET_ROOMS: {
            return {
                ...state,
                ...action.payload,
            };
        }
        case ADD_CHAT: {
            const chat = state.chat;
            chat.push(action.payload);
            return {
                ...state,
                chat: [...chat]
            }
        }

        default: {
            return state;
        }
    }
};

export const resetRoom = () => (dispatch) => {
    dispatch({type: RESET_ROOM})
}

export const setRoomNumber = (roomNumber) => (dispatch) => {
    dispatch({
        type: SET_ROOM_NUMBER,
        payload: {roomNumber}
    });
};

export const setRooms = (rooms) => (dispatch) => {
    dispatch({
        type: SET_ROOM_NUMBER,
        payload: {rooms}
    });
};


export const addChat = (chat: ChatRtcData) => (dispatch) => {
    dispatch({
        type: ADD_CHAT,
        payload: chat
    })
}

export default roomReducer;
