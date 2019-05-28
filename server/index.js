const File = require('./File');

const Server = class {
    constructor(config) {
        this.config = config;
        this.defaultDirectory = config.defaultDirectory || '/';

        this.files = {};
    }

    run() {
        if (!this.config.host || !this.config.port) return console.log('client has not enough config');

        const app = require('express')();
        const server = require('http').createServer(app).listen(this.config.port, this.config.host);
        this.io = require('socket.io')(server);
        this._registerEvents();
    }

    _registerEvents() {
        this.io.sockets.on('connection', socket => {
            console.log(`${socket.id} is connected`);

            socket.on('watch', path => this._watch(path, socket));
            socket.on('forget', path => this._forget(path, socket));
            socket.on('search', path => this._search(path, socket));
            socket.on('disconnecting', () => {
                console.log(`${socket.id} is disconnected`);
                Object.keys(socket.rooms).map(path => this._forget(path, socket))
            });
        });
    }

    _search(searchPath, socket) {
        const path = require('path');
        searchPath = path.resolve(this.defaultDirectory, searchPath);

        try {
            const file = new File(searchPath);
            const files = file.search();
            console.log('searching... ', searchPath);
            this.io.sockets.to(socket.id).emit('searched',
                searchPath,
                files.map(file => ({
                    name: file.name,
                    path: path.resolve(searchPath, file.name),
                    isDirectory: file.isDirectory()
                }))
            );
        } catch (e) {
            console.log(e.message);
            this.io.sockets.to(socket.id).emit('fileError', searchPath, ' 경로가 잘못 되었습니다.');
        }
    }

    _watch(path, socket) {
        socket.join(path, () => {
            if (!!this.files[path]) return;
            try {
                this.files[path]
                    = (new File(path, message => this.io.sockets.to(path).emit('log', path, message))).watch();
            } catch (e) {
                console.log(e.message);
                this.io.sockets.to(socket.id).emit('fileError', file, e.message);
                socket.leave(path, () => null);
            }
        });
    }

    _forget(path, socket) {
        socket.leave(path, () =>
            this.files.hasOwnProperty(path) &&
            !this._isSomeoneWatching(path) &&
            this.files[path].forget() &&
            delete this.files[path] &&
            console.log(`${path} is forgotten`)
        );
    }

    _isSomeoneWatching(path) {
        return (this.io.sockets.hasOwnProperty('adapter') &&
            this.io.sockets.adapter.hasOwnProperty('rooms') &&
            this.io.sockets.adapter.rooms.hasOwnProperty(path) &&
            !!this.io.sockets.adapter.rooms[path].length);
    }
};

const config = require('../config/server');
const logServer = new Server(config);
logServer.run();