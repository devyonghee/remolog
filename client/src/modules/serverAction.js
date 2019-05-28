import io from 'socket.io-client';

const SET_SOCKET = Symbol('SET_SOCKET');
const RESET_SOCKET = Symbol('RESET_SOCKET');
const SET_DIRECTORY = Symbol('SET_DIRECTORY');
const REQUEST_WATCH = Symbol('REQUEST_WATCH');
const SEARCH = Symbol('SEARCH');
const SET_FILES = Symbol('SET_FILES');
const ADD_MESSAGE = Symbol('ADD_MESSAGE');

export const types = {
    SET_SOCKET,
    RESET_SOCKET,
    SET_DIRECTORY,
    REQUEST_WATCH,
    SEARCH,
    SET_FILES,
    ADD_MESSAGE
};

const setSocket = socket => {
    return {
        type: SET_SOCKET,
        socket
    };
};

const resetSocket = () => {
    return {
        type: RESET_SOCKET,
    };
};

const requestWatch = (file, watch) => {
    return {
        type: REQUEST_WATCH,
        file,
        watch,
    };
};

const search = (directory = null) => {
    return {
        type: SEARCH,
        directory
    };
};

const setFiles = (path, files) => {
    return {
        type: SET_FILES,
        path,
        files,
    };
};

const addMessage = (file, message) => {
    return {
        type: ADD_MESSAGE,
        file,
        message
    };
};


const connectServer = url => {
    return dispatch => {
        const socket = io.connect(url);
        socket.on('connect', () => dispatch(setSocket(socket)));
        socket.on('searched', (path, files) => dispatch(setFiles(path, files)));
        socket.on('log', (file, message) => {
            if(window.remote.getCurrentWindow().isMinimized()){
                const notification = {
                    title: 'Basic Notification',
                    body: message,
                    icon: ''
                };
                new window.Notification(file.path, notification);
            }

            dispatch(addMessage(file, message))
        });

        socket.on('fileError', (file, message) => {
            window.remote.dialog.showErrorBox('파일이 존재하지 않습니다.', message);
        });

        socket.on('error', (path, message) => {
            window.remote.dialog.showErrorBox('서버와의 연결이 끊겼습니다.', message);
        });
    }
};

const disconnectServer = () => {
    return (dispatch, getState) => {
        const {server: {socket}} = getState();
        if (!!socket) socket.disconnect();
        dispatch(resetSocket);
    }
};

export default {
    connectServer,
    disconnectServer,
    requestWatch,
    search
}