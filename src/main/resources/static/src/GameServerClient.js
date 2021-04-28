import { OL } from './utils';
import { Stomp } from './lib/stomp';

export class GamServerClient {
    constructor(username) {
        this.CHAT = "/app/chat";
        this.JOIN = "/app/join";
        this.UPDATE_PLAYER = "/app/update/player";
        this.socket = new WebSocket(OL.SERVER_URL + "/lounge");
        this.stompClient = new Stomp.over(this.socket);
        this.username = username;
        // this.stompClient.debug = true;
        return this;
    }
  
    connect(callback) {
        this.stompClient.connect({}, (result) => {
            console.log(result);
            this.playerId = result.headers['user-name'];
            this.sendMessage("/app/join", this.username);
            callback(result);
        });
        return this;
    }
  
    updatePlayer(input) {
      this.sendMessage(this.UPDATE_PLAYER,input);
    }
  
    sendChat(message) {
      this.sendMessage(this.CHAT, message);
    }
  
    sendMessage(topic, message) {
        this.stompClient.send(topic, {}, message);
    }

    sendMessageNoWait(topic, message) {
        this.stompClient.send(topic, {}, message);
    }
  }