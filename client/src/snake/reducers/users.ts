export interface User {
    name: string,
    color: string,
}

interface UsersStateType {
    users: {
        [id: string]: User
    }
}

const initialState: UsersStateType = {
    users: {}
}

export const ADD_USER = 'ADD_USER'
export const DELETE_USER = 'DELETE_USER'
export const RESET_USERS = 'RESET_USERS'

const usersReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_USER: {
            const users = {...state.users};
            const newUser: User = action.payload.user;
            const id: string = action.payload.id;
            users[id] = newUser
            return {
                ...state,
                users: users
            };
        }
        case DELETE_USER: {
            const users = {...state.users};
            const id: string = action.payload;
            delete users[id];
            return {
                ...state,
                users: users,
            }
        }
        case RESET_USERS: {
            return initialState
        }
        default: {
            return state;
        }
    }
};

export const addUser = (id: string, user: User) => (dispatch) => {
    dispatch({
        type: ADD_USER,
        payload: {id, user}
    })
}

export const deleteUser = (id: string) => (dispatch) => {
    dispatch({
        type: DELETE_USER,
        payload: id
    })
}

export default usersReducer;