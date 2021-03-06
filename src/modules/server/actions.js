import axios from 'axios';
import io from 'socket.io-client';
import userActions from '../user/actions';
import fileActions from '../file/actions';
import messageActions from '../message/actions';
import { findByIndex, findByIndexWithRoute, replaceUrl, SERVER, withHttp } from '../utils';

const ipcRenderer = window.require('electron').ipcRenderer;

export const ADD_SERVER = Symbol('ADD_SERVER');
export const SET_SOCKET = Symbol('SET_SOCKET');
export const REMOVE_SOCKET = Symbol('REMOVE_SOCKET');
export const SET_SERVER_INFO = Symbol('SET_SERVER_INFO');
export const RESET_SOCKET = Symbol('RESET_SOCKET');
export const SET_FILES = Symbol('SET_FILES');
export const TOGGLE_EXTEND = Symbol('TOGGLE_EXTEND');

const addServer = (name, url) => {
    return {
        type: ADD_SERVER,
        url, name
    };
};

const setSocket = (url, socket) => {
    return {
        type: SET_SOCKET,
        url, socket
    };
};

const removeSocket = (socket) => {
    return {
        type: REMOVE_SOCKET,
        socket
    };
};

const setServerInfo = (values) => {
    return {
        type: SET_SERVER_INFO,
        values
    };
};

const resetSocket = () => {
    return {
        type: RESET_SOCKET,
    };
};

const setFiles = (files, index) => {
    return {
        type: SET_FILES,
        files,
        index
    };
};

const toggleExtend = (index, extend) => {
    return {
        type: TOGGLE_EXTEND,
        index,
        extend
    };
};

const removeSocketAndShrink = (url, socket, message) => (dispatch, getState) => {
    const { file: fileState } = getState();

    const server = fileState.list.find(server => server.type === SERVER && server.url === url);
    if (server) ipcRenderer.send('notice', message, `${server.name} error`);

    dispatch(removeSocket(socket));

    const fileIndex = fileState.list.indexOf(server);
    dispatch(fileActions.toggleExtend([fileIndex], false));
};

const registerEvent = (url, socket) => (dispatch, getState) => {
    socket.on('connect', () => dispatch(setSocket(url, socket)));
    socket.on('fileError', (path, message) => ipcRenderer.send('notice', message));
    socket.on('disconnect', reason => dispatch(removeSocketAndShrink(url, socket, reason)));
    socket.on('reconnect_failed', () => dispatch(removeSocketAndShrink(url, socket, '서버와의 연결이 끊겼습니다.')));

    let time = null;
    const messages = [];
    socket.on('log', (index, message) => {
        const { message: messageState, file: fileState } = getState();
        if (messageState.stop) return;

        const file = findByIndexWithRoute(index)(fileState.list);
        if (!file) return;
        messages.push({ name: file.route.concat(`/${file.name}`), color: file.color, message });

        if (time) return;
        time = setTimeout(() => {
            if (messages.length) dispatch(messageActions.addMessage(messages));
            messages.splice(0, message.length);
            time = null;
        }, 500);
    });
};

const search = (index = []) => (dispatch, getState) => {
    const { server: serverState } = getState();
    if (serverState.selectedServer < 0) return;
    const server = serverState.list[serverState.selectedServer];

    if (!server || !server.socket) return;
    const file = findByIndex(index)(serverState.files);
    server.socket.once('searched', files => dispatch(setFiles(files, index)));
    server.socket.emit('search', file ? file.path : '');
};

const watch = (index, watch) => (dispatch, getState) => {
    const { server: serverState, file: fileState } = getState();
    const rootFile = findByIndex(index.slice(0, 1))(fileState.list);
    if (!rootFile || rootFile.type !== SERVER) return;

    const server = serverState.list.find(server => server.url === rootFile.url);
    if (!server || !server.socket) return;

    const target = findByIndex(index)(fileState.list);
    if (!target || !target.path) return;

    server.socket.emit('forget', target.path);
    if (watch) server.socket.emit('watch', index, target.path);
    dispatch(fileActions.setWatch(index, watch));
};

const connectAndRegister = (name, url, token) => async (dispatch, getState) => {
    const socket = io.connect(`${url}?token=${token}`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
    });

    dispatch(registerEvent(url, socket));

    const { file: fileState } = getState();
    const fileIndex = fileState.list.findIndex(file => file.url === url);
    dispatch(fileActions.setExtend([fileIndex], true));
};

const connectByToken = (name, url, token) => async (dispatch, getState) => {
    const { user: { id, password } } = getState();
    await dispatch(setServerInfo({ tempUrl: url, tempName: name }));
    try {
        const response = await axios.post(url + '/login', { token });
        if (response.status !== 200) {
            return ipcRenderer.send('notice', '서버 오류');
        }

        if (!getState().server.list.some(server => server.url === url)) dispatch(addServer(name, url));
        dispatch(connectAndRegister(name, url, response.data));
        dispatch(fileActions.setToken(url, response.data));
    } catch (e) {
        if (e.message === 'Network Error') {
            return ipcRenderer.send('notice', '서버에 접근이 불가능합니다.');
        }
        if (!id || !password) {
            ipcRenderer.send('notice', '토큰이 만료되었습니다.');
            dispatch(userActions.setUserInfo({ openLogin: true }));
            return;
        }
        await dispatch(userActions.login(id, password));
    }
};

const connect = (requestUrl, name) => async (dispatch, getState) => {
    const { file: fileState, user: { id, password } } = getState();
    const url = withHttp(replaceUrl(requestUrl));
    const index = fileState.list.findIndex(file => file.type === SERVER && file.url === url);

    dispatch(setServerInfo({ loading: true, tempName: name, tempUrl: url }));

    try {
        const response = await axios({ url, method: 'HEAD' });
        if (response.status !== 200) return ipcRenderer.send('notice', '연결할 수 없습니다.');

        if (index < 0) dispatch(fileActions.addServer(name, url));

        if (!id || !password) {
            dispatch(setServerInfo({ openNewServer: false }));
            return dispatch(userActions.setUserInfo({ openLogin: true }));
        }

        await dispatch(userActions.login(id, password));
        dispatch(setServerInfo({ openNewServer: false }));
    } catch {
        ipcRenderer.send('notice', '연결할 수 없습니다.');
    } finally {
        dispatch(setServerInfo({ loading: false }));
    }
};

export default {
    addServer,
    setSocket,
    setServerInfo,
    resetSocket,
    setFiles,
    watch,
    search,
    toggleExtend,
    connect,
    connectAndRegister,
    connectByToken
};