const fs = require('fs');
const pathLib = require('path');
const logger = require('./Logger');

const File = class {
    constructor(path) {
        this.observers = [];
        this.watcher = null;
        this.path = path.replace(/\/*$/, '');
    }

    search() {
        if (!fs.existsSync(this.path)) throw new Error(`${this.path} file is not exist`);
        const files = fs.readdirSync(this.path, {encoding: 'utf8', withFileTypes: true});
        return files.map(file => {
            if (!file.isDirectory() && !File._isAvailableExt(file.name)) return null;

            return {
                name: file.name,
                path: pathLib.join(this.path, file.name),
                isDirectory: file.isDirectory()
            };
        }).filter(Boolean);
    }

    isSame(path) {
        return this.path === path;
    }

    watch() {
        if (!fs.existsSync(this.path) || !File._isAvailableExt(this.path)) throw new Error(`${this.path} file can not watch`);

        this.preSize = fs.statSync(this.path).size;
        this.watcher = fs.watch(this.path, this._registerWatchEvents.bind(this));
        logger.info(`${this.path} file is watching`);
        return this;
    }

    _forget() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
            return true;
        }
        logger.info(`${this.path} file is not watching!!`);
        return false;
    }

    _registerWatchEvents(event) {
        if (event === 'rename' || event !== 'change') {
            this.forget();
            throw new Error('File changed status');
        }

        fs.stat(this.path, (error, stat) => {
            this._readLogs(stat.size, this.preSize);
            this.preSize = stat.size;
        })
    }

    _readLogs(curr, prev) {
        if (curr < prev) return;
        const readStream = fs.createReadStream(this.path, {encoding: 'utf8', start: prev, end: curr});
        readStream.on('data', data =>
            (data && this.observers.map(observer => observer.notify(data.replace(/\n{2,}/g, '\n').replace(/\[$/, ''))))
        );
    }

    isNotWatching() {
        return !this.watcher;
    }

    register(observer) {
        this.observers.push(observer);
    }

    removeBySocket(socket) {
        const index = this.observers.findIndex(observer => observer.isSame(socket));
        if (index < 0) return;
        this.observers.splice(index, 1);
        if (!this.observers.length) this._forget();
    }

    static set availableExt(extensions) {
        this._availableExt = extensions;
    }

    static _isAvailableExt(name) {
        if (!this._availableExt) return true;

        const index = name.lastIndexOf('.');
        if (index < 0) return false;
        const ext = name.slice(index + 1).toLowerCase();
        return this._availableExt.includes(ext);
    }
};

module.exports = File;