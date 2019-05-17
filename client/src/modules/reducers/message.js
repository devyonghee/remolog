import {types} from "../actions/message";


const addMessage = (state, {file, contents, color}) => [...state, {file, contents, color}];

const initialState = [
    {file: 'test', contents: 'asdfadsf', color: 'red'},
];
export default (state = initialState, action) => {
    switch (action.type) {
        case types.ADD_MESSAGE:
            return addMessage(state, action);
        default:
            return state;
    }
}