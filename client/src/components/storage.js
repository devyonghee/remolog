import {colorsIndex} from './colors';

const serializeFiles = ({...file}) => {
    file.parent = null;
    if (!!file.child && file.child.length) {
        file.child = file.child.map(serializeFiles);
    }
    return file;
};

const connectParent = (file, parent = null) => {
    file.parent = parent;
    if (!file.isDirectory) file.color = colorsIndex.next().value;
    if (!!file.child && file.child.length) file.child.map(childFile => connectParent(childFile, file));
    return file;
};

export const saveFiles = files => {
    const server = getServer();
    if (!server.url) return;
    window.localStorage.setItem('files', JSON.stringify({url: server.url, files: files.map(serializeFiles)}));
};

export const loadFiles = () => {
    const files = JSON.parse(window.localStorage.getItem('files'));
    if (typeof files !== 'object' || !files.hasOwnProperty('url') || !files.hasOwnProperty('files') || !Array.isArray(files.files)) {
        window.localStorage.removeItem('files');
        return [];
    }
    return files.files.map(file => connectParent(file))
};

export const saveServer = (name, url) => {
    if (!name || !url) return;
    window.localStorage.setItem('server', JSON.stringify({url, name}));
};

export const getServer = () => {
    const server = JSON.parse(window.localStorage.getItem('server'));

    if (!server || !server.hasOwnProperty('url') || !server.hasOwnProperty('name')) {
        window.localStorage.removeItem('server');
        return {name: '', url: ''}
    }

    return server;
};