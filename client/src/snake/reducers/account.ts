interface AccountStateType {
    nickname: string,
}

const initialState: AccountStateType = {
    nickname: ''
}

export const SET_NICKNAME = 'SET_NICKNAME'

const accountReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_NICKNAME: {
            return {
                ...state,
                ...action.payload,
            };
        }

        default: {
            return state;
        }
    }
};

export default accountReducer;