interface MultiStateType {
    id: number,
}

const initialState: MultiStateType = {
    id: 0,
}

const SET_ID = 'SET_ID';

const multiReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_ID: {
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

export const setId = (id: number) => (dispatch) => {
    dispatch({type: SET_ID, payload: {id}})
}

export default multiReducer;