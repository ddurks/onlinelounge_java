import { TextButton, OL } from "./utils";

export class Controls extends Phaser.Scene {
    constructor(slaveScene) {
        super('Controls');

        this.CHAT_TEXT = "chat";
        this.SEND_TEXT = "send";
        this.chatText = this.CHAT_TEXT;
        this.zoomed = false;
    }

    create() {
        this.camera = this.cameras.main;

        // create chat button and chatbox
        // var chatIcon = this.add.image(460, 460, 'typingIcon', 0);
        var chatIcon = this.add.image(460, 475, 'chatIcon', 0);
        chatIcon.setScale(4);
        chatIcon.setDepth(11);
        this.add.existing(chatIcon).setScrollFactor(0);
        this.chatButton = new TextButton(this, 425, 460, OL.CHAT_TEXT, { fontFamily: 'gaming2',color:  '#000000' ,fontSize: '16px'}, () => this.chat());
        this.chatButton.setDepth(11);
        this.add.existing(this.chatButton).setScrollFactor(0);

        this.add.dom(OL.world.width/2, OL.world.height/2).createFromCache('chatBox').setScrollFactor(0);
        document.getElementById("chat-box").style.display = "none";
        const MAX_LENGTH = 100;
        document.getElementById('chat-entry').onkeyup = function () {
            console.log("chat entered");
            document.getElementById('char-count').innerHTML = (this.value.length) + "/" + MAX_LENGTH;
        };

        this.zoomButton = new TextButton(this, 425, 10, "zoom", { fontFamily: 'gaming2',color:  '#000000' ,fontSize: '16px'}, () => this.zoom());
        this.zoomButton.setDepth(11);
        this.add.existing(this.zoomButton).setScrollFactor(0);
    }

    chat() {
        if (this.chatText === this.CHAT_TEXT) {
            this.openChatBox();
        } else {
            this.sendChat();
        }
    }

    openChatBox() {
        this.chatText = this.SEND_TEXT;
        this.events.emit('openChat');
        this.chatButton.setText(this.SEND_TEXT);
        document.getElementById("chat-box").style.display = "block";
        var chatBox = document.getElementById("chat-entry");
        chatBox.focus();
    }

    sendChat() {
        this.chatText = this.CHAT_TEXT;
        this.events.emit('sendChat');
        document.getElementById("chat-entry").value = "";
        this.chatButton.setText(OL.CHAT_TEXT);
        document.getElementById("chat-box").style.display = "none";
    }

    zoom() {
        if (!this.zoomed) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    }

    zoomIn() {
        this.zoomed = true;
        this.events.emit('zoomIn');
    }

    zoomOut() {
        this.zoomed = false;
        this.events.emit('zoomOut');
    }
}