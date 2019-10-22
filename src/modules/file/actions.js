const ADD_SERVER = Symbol('ADD_SERVER');
const ADD_DIRECTORY = Symbol('ADD_DIRECTORY');
const TOGGLE_EXTEND = Symbol('TOGGLE_EXTEND');
const SET_NEW_FORM = Symbol('SET_NEW_FORM');
const REMOVE_DIRECTORY = Symbol('REMOVE_DIRECTORY');
const SET_SELECTED = Symbol('SET_SELECTED');
const ADD_FILE = Symbol('ADD_FILE');
const REMOVE_FILE = Symbol('REMOVE_FILE');

export {
    ADD_SERVER,
    ADD_DIRECTORY,
    TOGGLE_EXTEND,
    SET_SELECTED,
    SET_NEW_FORM,
    REMOVE_DIRECTORY,
    ADD_FILE,
    REMOVE_FILE,
};

const addServer = (name, url) => {
    return {
        type: ADD_SERVER,
        name, url
    };
};

const addDirectory = (name) => {
    return {
        type: ADD_DIRECTORY,
        name
    };
};

const addFile = (file) => {
    return {
        type: ADD_FILE,
        file
    };
};

const setSelected = (target) => {
    return {
        type: SET_SELECTED,
        target
    };
};

const remove = file => {
    return {
        type: REMOVE_FILE,
        file,
    };
};

const toggleExtend = target => {
    return {
        type: TOGGLE_EXTEND,
        target
    }
};

const setNewForm = (open, newType = '') => {
    return {
        type: SET_NEW_FORM,
        open, newType
    };
};

export default {
    addServer,
    addDirectory,
    addFile,
    toggleExtend,
    setNewForm,
    setSelected,
    remove
};