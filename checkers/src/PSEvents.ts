import { decorate, injectable } from 'inversify';
import { action, observable } from 'mobx';
import { inject, Symbols } from '#/ioc';
import { EventEmitter2 } from 'eventemitter2';

const log  = require('debug')('PSEvents')
const Echo = require('laravel-echo');

decorate(injectable(), EventEmitter2);

@injectable()
export class PSEvents extends EventEmitter2 {
    @inject(Symbols.Echo) echo: typeof Echo

    @observable listening: boolean = false;
    @observable channel: string    = 'game';

    constructor(opts = {}) {
        super({
            wildcard    : true,
            delimiter   : ':',
            maxListeners: Infinity
        })
    }

    @action listen() {
        this.echo
            .channel(this.channel)
            .listen('GameCreated', (e) => {
                log('GameCreated', e);
                this.emit('game:created', e);
            })
            .listen('GameEnded', (e) => {
                log('GameEnded', e);
                this.emit('game:ended', e);
            })
            .listen('GamePieceMoved', (e) => {
                log('GamePieceMoved', e);
                this.emit('game:piece:moved', e);
            })
            .listen('GameStarted', (e) => {
                log('GameStarted', e);
                this.emit('game:started', e);
            })
            .listen('GameTurnSwitched', (e) => {
                log('GameTurnSwitched', e);
                this.emit('game:turn:switched', e);
            })
            .listen('MessageSent', (e) => {
                log('MessageSent', e);
                this.emit('message:sent', e);
            })
            .listen('PlayerAcceptedGameStart', (e) => {
                log('PlayerAcceptedGameStart', e);
                this.emit('player:accepted:start', e);
            })
            .listen('PlayerJoined', (e) => {
                log('PlayerJoined', e);
                this.emit('player:joined', e);
            })
            .listen('PlayerLeft', (e) => {
                log('PlayerLeft', e);
                this.emit('player:left', e);
            })
            .listen('PlayerRequestedGameStart', (e) => {
                log('PlayerRequestedGameStart', e);
                this.emit('player:requested:start', e);
            })
            .listen('RoomCreated', (e) => {
                log('RoomCreated', e);
                this.emit('room:created', e);
            })

        this.onAny((event, ...args) => {
            log('PSEvent', { event, args });
        })

        this.listening = true;

    }

    @action forget() {
        this.echo.leave(this.channel)
        this.listening = false;
    }

    @action setChannel(name:string){
        if(this.listening){
            this.forget();
        }
        this.channel = name;
    }

}
