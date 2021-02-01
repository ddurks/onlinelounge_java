export class Controls extends Phaser.Scene {
    constructor(slaveScene) {
        super('Controls');

        this.slave = slaveScene;
    }

    create() {
        this.camera = this.cameras.main;

        // create chat button and chatbox
        // var chatIcon = this.add.image(460, 460, 'typingIcon', 0);
        var chatIcon = this.add.image(460, 475, 'chatIcon', 0);
        chatIcon.setScale(4);
        chatIcon.setDepth(11);
        chatIcon.setInteractive();
        chatIcon.on('pointerdown', this.chat, this);
        this.add.existing(chatIcon).setScrollFactor(0);
        this.chatButton = new TextButton(this, 425, 460, OL.CHAT_TEXT, { fontFamily: 'gaming2',color:  '#000000' ,fontSize: '16px'}, () => this.slave.chat());
        this.chatButton.setDepth(11);
        this.add.existing(this.chatButton).setScrollFactor(0);

        this.add.dom(OL.world.width/2, OL.world.height/2).createFromCache('chatBox').setScrollFactor(0);
        document.getElementById("chat-box").style.display = "none";
        const MAX_LENGTH = 100;
        document.getElementById('chat-entry').onkeyup = function () {
            console.log("chat entered");
            document.getElementById('char-count').innerHTML = (this.value.length) + "/" + MAX_LENGTH;
        };

        this.zoomButton = new TextButton(this, 425, 10, "zoom", { fontFamily: 'gaming2',color:  '#000000' ,fontSize: '16px'}, () => this.slave.zoomIn());
        this.zoomButton.setDepth(11);
        this.add.existing(this.zoomButton).setScrollFactor(0);
    }
}