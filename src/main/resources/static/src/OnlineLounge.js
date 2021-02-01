import { OL, TextButton } from './utils';
import { GamServerClient } from './GameServerClient';
import { Player } from './Player';
import { Butterfly } from './Butterfly';
import { Controls } from './Controls';

export class OnlineLounge extends Phaser.Scene {
    constructor() {
        super('OnlineLounge');
        this.players = new Map();
        this.butterflies = new Array();
        this.uiControls = new Controls(this);
    }

    create() { 
        //map
        var map = this.make.tilemap({ key: "map" });
        var groundTileset = map.addTilesetImage("online-pluto-tileset-extruded", "groundTiles");
        var objectTileset = map.addTilesetImage("online-tileset-extruded", "objectTiles");
        var belowLayer = map.createLayer("below", groundTileset, 0, 0);
        this.worldLayer = map.createLayer("world", objectTileset, 0, 0);
        var aboveLayer = map.createLayer("above", objectTileset, 0, 0);
        this.worldLayer.setCollisionByProperty({ collides: true });
        aboveLayer.setDepth(10);

        // player
        this.player = this.generatePlayer(OL.username);
        this.cuteGuy = this.generateCuteGuy();

        // controls
        this.controls = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, false)
        };

        this.physics.world.enable([this.cuteGuy, this.player]);

        this.physics.add.collider(this.player, this.worldLayer);

        this.camera = this.cameras.main;

        this.cameraDolly = new Phaser.Geom.Point(this.player.x, this.player.y);
        this.camera.startFollow(this.player, true);
        this.camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // create chat button and chatbox
        // var chatIcon = this.add.image(460, 460, 'typingIcon', 0);
        // var chatIcon = this.add.image(460, 475, 'chatIcon', 0);
        // chatIcon.setScale(4);
        // chatIcon.setDepth(11);
        // chatIcon.setInteractive();
        // chatIcon.on('pointerdown', this.chat, this);
        // this.add.existing(chatIcon).setScrollFactor(0);
        // this.chatButton = new TextButton(this, 425, 460, OL.CHAT_TEXT, { fontFamily: 'gaming2',color:  '#000000' ,fontSize: '16px'}, () => this.chat());
        // this.chatButton.setDepth(11);
        // this.add.existing(this.chatButton).setScrollFactor(0);

        // this.add.dom(OL.world.width/2, OL.world.height/2).createFromCache('chatBox').setScrollFactor(0);
        // document.getElementById("chat-box").style.display = "none";
        // const MAX_LENGTH = 100;
        // document.getElementById('chat-entry').onkeyup = function () {
        //     console.log("chat entered");
        //     document.getElementById('char-count').innerHTML = (this.value.length) + "/" + MAX_LENGTH;
        // };

        // this.zoomButton = new TextButton(this, 425, 10, "zoom", { fontFamily: 'gaming2',color:  '#000000' ,fontSize: '16px'}, () => this.zoomIn());
        // this.zoomButton.setDepth(11);
        // this.add.existing(this.zoomButton).setScrollFactor(0);

        console.log("welcome to the online lounge");
        console.log(OL.username, " (password: " + OL.password + ")");
        this.gameServer = this.generateGameServerConnectionClient();
    }

    generateGameServerConnectionClient() {
        var serverClient = new GamServerClient();
        serverClient.connect(this.player.username, (result) => {
          this.player.playerId = result.headers['user-name'];
          serverClient.stompClient.subscribe('/user/topic/access', (messageOutput) => {
            // TODO
          });
          serverClient.stompClient.subscribe('/topic/chat', (messageOutput) => {
            // TODO
          });
          serverClient.stompClient.subscribe('/topic/state', (messageOutput) => {
              var playerListJson = JSON.parse(messageOutput.body);
              this.updateAllPlayers(playerListJson);
          });
          console.log(this.player.username);
          serverClient.sendMessage("/app/join", this.player.username);
          this.time.addEvent({ delay: 1000/30, callback: () => {
            serverClient.updatePlayer(JSON.stringify({
                msg: this.player.msg,
                typing: this.player.typing,
                position: {
                    x: this.player.x,
                    y: this.player.y
                },
                velocity: this.player.body.velocity
                }));
          }, callbackScope: this, loop: true });
        });
        return serverClient;
    }

    update(time, delta) {
        this.playerHandler(delta);
        this.updateAllButterflies();
        this.cameraDolly.x = Math.floor(this.player.x);
        this.cameraDolly.y = Math.floor(this.player.y);
    }

    chat() {
        if (this.chatButton.text === OL.CHAT_TEXT) {
            this.openChatBox();
        } else {
            this.sendChat();
        }
    }

    zoomIn() {
        this.camera.pan(this.player.x, this.player.y, 100, 'Power2');
        this.camera.zoomTo(2, 2000);
        this.zoomButton.x = this.zoomButton.x/4;
    }

    zoomOut() {
        this.camera.pan(this.player.x, this.player.y, 100, 'Power2');
        this.camera.zoomTo(1, 2000);    
    }

    openChatBox() {
        this.chatButton.setText(OL.SEND_TEXT);
        document.getElementById("chat-box").style.display = "block";
        this.player.startTyping();
        var chatBox = document.getElementById("chat-entry");
        chatBox.focus();
        this.input.keyboard.enabled = false;
    }

    sendChat() {
        this.player.setMsg(document.getElementById("chat-entry").value);
        document.getElementById("chat-entry").value = "";
        this.chatButton.setText(OL.CHAT_TEXT);
        document.getElementById("chat-box").style.display = "none";
        this.input.keyboard.enabled = true;
    }

    generateCuteGuy() {
        var cuteGuy = this.physics.add.sprite(OL.world.centerX, OL.world.centerY, 'cute');
        cuteGuy.setScale(0.25);
        cuteGuy.setCollideWorldBounds(true);
        cuteGuy.setBounce(1);
        return cuteGuy;
    }

    generatePlayer(username) {
        let player = new Player(this, 50, 50, 'playerDefault', username);
        this.physics.add.collider(player, this.worldLayer);
        return player;
    }
    
    generateButterfly() {
        if(this.butterflies.length < 25) {
            let butterfly = new Butterfly(this, this.player.x + OL.getRandomInt(-250, 250), this.player.y + OL.getRandomInt(-250, 250), 'purpleButterfly');
            this.butterflies.push(butterfly);
            return butterfly;
        }
        return null;
    }

    updateAllButterflies() {
        let random = OL.getRandomInt(0, 50);
        if (random === 25) {
            console.log("generate butterfly");
            this.generateButterfly();
        }
        this.butterflies.forEach( (butterfly) => {
            butterfly.update();
        })
    }

    updateAllPlayers(playerDataList) {
        playerDataList.forEach((playerData) => {
            var playerToUpdate = this.players.get(playerData.id);
            if (!playerToUpdate && playerData.id !== this.player.playerId) {
                this.players.set(playerData.id, this.generatePlayer(playerData.username));
                console.log(this.players.get(playerData.id));
            } else if (playerToUpdate) {
                playerToUpdate.updateFromData(playerData);
            }
        });
    }

    playerHandler(delta) {
        this.physics.world.collide(this.player, this.cuteGuy);
        if (this.player.alive) {
            if (OL.IS_MOBILE) {
                this.playerMobileMovementHandler();
            } else {
                this.playerMovementHandler();
            }
            this.player.msgDecayHandler(delta);
            this.player.updatePlayerStuff();
        }
    }

    playerMovementHandler() {
        // Up-Left
        if (this.controls.up.isDown && this.controls.left.isDown) {
            this.player.setVelocityX(-this.player.speed);
            this.player.setVelocityY(-this.player.speed);
            this.player.anims.play('left', true);
        // Up-Right
        } else if (this.controls.up.isDown && this.controls.right.isDown) {
            this.player.setVelocityX(this.player.speed);
            this.player.setVelocityY(-this.player.speed);
            this.player.anims.play('right', true);
        // Down-Left
        } else if (this.controls.down.isDown && this.controls.left.isDown) {
            this.player.setVelocityX(-this.player.speed);
            this.player.setVelocityY(this.player.speed);
            this.player.anims.play('left', true);
        // Down-Right
        } else if (this.controls.down.isDown && this.controls.right.isDown) {
            this.player.setVelocityX(this.player.speed);
            this.player.setVelocityY(this.player.speed);
            this.player.anims.play('right', true);
        // Up
        } else if (this.controls.up.isDown) {
            this.player.setVelocityX(0);
            this.player.setVelocityY(-this.player.speed);
            this.player.anims.play('up', true);
        // Down
        } else if (this.controls.down.isDown) {
            this.player.setVelocityX(0);
            this.player.setVelocityY(this.player.speed);
            this.player.anims.play('down', true);
        // Left
        } else if (this.controls.left.isDown) {
            this.player.setVelocityX(-this.player.speed);
            this.player.setVelocityY(0);
            this.player.anims.play('left', true);
        // Right
        } else if (this.controls.right.isDown) {
            this.player.setVelocityX(this.player.speed);
            this.player.setVelocityY(0);
            this.player.anims.play('right', true);
        // Still
        } else {
            this.player.anims.pause();
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
        }
    }

    setPlayerSpeedFromTouchAngle(angle) {
        if (angle >= -22.5 && angle <= 22.5) { //right
            this.player.setVelocityX(this.player.speed);
            this.player.anims.play('right', true);
        } else if (angle > 22.5 && angle <= 67.5) { //right-down
            this.player.setVelocityX(this.player.speed);
            this.player.setVelocityY(this.player.speed);
            this.player.anims.play('right', true);
        } else if (angle > 67.5 && angle <= 112.5) { //down
            this.player.setVelocityY(this.player.speed);
            this.player.anims.play('down', true);
        } else if (angle > 112.5 && angle <= 157.5) { //left-down
            this.player.setVelocityX(-this.player.speed);
            this.player.setVelocityY(this.player.speed);
            this.player.anims.play('left', true);
        } else if ((angle > 157.5 && angle <= 180) || (angle >= -180 && angle < -157.5) ) { //left
            this.player.setVelocityX(-this.player.speed);
            this.player.anims.play('left', true);
        } else if (angle >= -157.5 && angle < -112.5) { //left-up
            this.player.setVelocityX(-this.player.speed);
            this.player.setVelocityY(-this.player.speed);
            this.player.anims.play('left', true);
        } else if (angle >= -112.5 && angle < -67.5) { //up
            this.player.setVelocityY(-this.player.speed);
            this.player.anims.play('up', true);
        } else if (angle >= -67.5 && angle < -22.5) { //right-up
            this.player.setVelocityX(this.player.speed);
            this.player.setVelocityY(-this.player.speed);
            this.player.anims.play('right', true);
        }
    }

    playerMobileMovementHandler() {
        var pointer = this.input.activePointer;
        if ((!this.player.typing && pointer.isDown)) {
            var touchX = pointer.x;
            var touchY = pointer.y;
            console.log(touchX, touchY);
            if (touchX <= 410 || touchY <= 440) {
                var touchWorldPoint = this.camera.getWorldPoint(touchX, touchY);
                if (OL.getDistance(this.player.body.position.x, this.player.body.position.y, touchWorldPoint.x, touchWorldPoint.y) > 29) {
                    this.setPlayerSpeedFromTouchAngle(OL.getAngle(this.player.body.position.x, this.player.body.position.y, touchWorldPoint.x, touchWorldPoint.y));
                }
            }
        } else {
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            this.player.anims.pause();
        }
    }
}