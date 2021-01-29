import { OL, TextButton } from './utils';
import { GamServerClient } from './GameServerClient';

export class OnlineLounge extends Phaser.Scene {
    constructor() {
        super('OnlineLounge');
        this.chatting = false;
        this.players = new Map();
        this.butterflies = new Array();
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
        this.chatButton = new TextButton(this, 450, 475, OL.CHAT_TEXT, { fill: 'black', shadowColor: 'grey', backgroundColor: 'darkgrey' }, () => this.chat());
        this.chatButton.setDepth(11);
        this.add.existing(this.chatButton).setScrollFactor(0);

        this.add.dom(OL.world.width/2, OL.world.height/2).createFromCache('chatBox').setScrollFactor(0);
        document.getElementById("chat-box").style.display = "none";

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
        console.log(this.player.x, this.player.y)
        this.physics.world.collide(this.player, this.cuteGuy);
        let random = OL.getRandomInt(0, 50);
        if (random === 25) {
            console.log("generate butterfly");
            this.generateButterfly();
        }
        this.cameraDolly.x = Math.floor(this.player.x);
        this.cameraDolly.y = Math.floor(this.player.y);
    }

    chat() {
        // chat
        if (this.chatButton.text === OL.CHAT_TEXT) {
            this.openChatBox();
        // send
        } else {
            this.sendChat();
        }
    }

    zoomIn() {
        this.camera.pan(this.player.x, this.player.y, 100, 'Power2');
        this.camera.zoomTo(2, 2000);
    }

    zoomOut() {
        this.camera.pan(this.player.x, this.player.y, 100, 'Power2');
        this.camera.zoomTo(1, 2000);    
    }

    openChatBox() {
        this.chatting = true;
        this.chatButton.setText(OL.SEND_TEXT);
        document.getElementById("chat-box").style.display = "block";
        this.player.typingIcon.setActive(true).setVisible(true);
        this.player.typing = true;
        this.input.keyboard.enabled = false;
    }

    sendChat() {
        this.chatting = false;
        this.setPlayerMsg(document.getElementById("chat-entry").value);
        document.getElementById("chat-entry").value = "";
        this.player.speakText.setText(this.player.msg);
        this.chatButton.setText(OL.CHAT_TEXT);
        this.player.typingIcon.setActive(false).setVisible(false);
        this.player.typing = false;
        document.getElementById("chat-box").style.display = "none";

        this.input.keyboard.enabled = true;
    }

    setPlayerMsg(msg) {
        this.player.msg = msg;
        this.player.msg_duration = 0;
    }

    generateCuteGuy() {
        var cuteGuy = this.physics.add.sprite(OL.world.centerX, OL.world.centerY, 'cute');
        cuteGuy.setScale(0.25);
        cuteGuy.setCollideWorldBounds(true);
        cuteGuy.setBounce(1);
        return cuteGuy;
    }

    generateSpeakText(player) {
        var speakText = this.add.text(player.x,player.y-player.size, "");
        speakText.setStroke('black', 3);
        speakText.setAlign('center');
        return speakText;
    }

    generatePlayer(username, size) {
        var player = this.physics.add.sprite(50, 50, 'playerDefault');

        player.anims.create({
            key: 'down', 
            frameRate: OL.WALKING_FRAMERATE,
            frames: this.anims.generateFrameNumbers('playerDefault', { frames: [0, 1, 0, 2] }),
            repeat: -1
        });
        player.anims.create({
            key: 'left', 
            frameRate: OL.WALKING_FRAMERATE,
            frames: this.anims.generateFrameNumbers('playerDefault', { frames: [9, 10, 9, 11] }),
            repeat: -1
        });
        player.anims.create({
            key: 'right', 
            frameRate: OL.WALKING_FRAMERATE,
            frames: this.anims.generateFrameNumbers('playerDefault', { frames: [3, 4, 3, 5] }),
            repeat: -1
        });
        player.anims.create({
            key: 'up', 
            frameRate: OL.WALKING_FRAMERATE,
            frames: this.anims.generateFrameNumbers('playerDefault', { frames: [6, 7, 6, 8] }),
            repeat: -1
        });

        player.alive = true;

        player.username = username;
        player.speed = OL.WALKING_SPEED;
        player.size = 25;
        player.msg = "";
        player.msg_duration = 0;
        player.typing = false;

        player.usernameText = this.generateUsernameText(player);
        player.speakText = this.generateSpeakText(player);
        player.typingIcon = this.generateTypingIcon(player);

        this.physics.world.enable(player);
        this.physics.add.collider(player, this.worldLayer);

        return player;
    }

    generateTypingIcon(player) {
        var typingIcon = this.add.sprite(player.x + player.size / 2, player.y - player.size, 'typingIcon');

        typingIcon.anims.create({
            key: 'typing', 
            frameRate: 3,
            frames: typingIcon.anims.generateFrameNumbers('typingIcon', { frames: [0, 1, 2, 3] }),
            repeat: -1
        });

        typingIcon.anims.play('typing');
        typingIcon.setActive(false).setVisible(false);

        return typingIcon;
    }

    generateButterfly() {
        let butterfly = this.add.sprite(this.player.x + OL.getRandomInt(-250, 250), this.player.y + OL.getRandomInt(-250, 250), 'purpleButterfly');

        butterfly.anims.create({
            key: 'left', 
            frameRate: 3,
            frames: butterfly.anims.generateFrameNumbers('purpleButterfly', { frames: [0, 1] }),
            repeat: -1
        });

        butterfly.anims.create({
            key: 'right', 
            frameRate: 3,
            frames: butterfly.anims.generateFrameNumbers('purpleButterfly', { frames: [2, 3] }),
            repeat: -1
        });

        butterfly.anims.play('left');
        this.butterflies.push(butterfly);
        return butterfly;
    }

    generateUsernameText(player) {
        var usernameText = this.add.text(player.x,player.y + player.size + 10, player.username);
        console.log(player.username);
        usernameText.setStroke('grey', 3);
        usernameText.setAlign('center');
        return usernameText;
    }

    updateAllPlayers(playerDataList) {
        playerDataList.forEach((playerData) => {
            var playerToUpdate = this.players.get(playerData.id);
            if (!playerToUpdate && playerData.id !== this.player.playerId) {
                this.players.set(playerData.id, this.generatePlayer(playerData.username));
                console.log(this.players.get(playerData.id));
            } else if (playerToUpdate) {
                playerToUpdate.setVelocityX(playerData.velocity.x);
                playerToUpdate.setVelocityY(playerData.velocity.y);
                playerToUpdate.x = playerData.position.x;
                playerToUpdate.y = playerData.position.y;
                this.animForPlayerFromVelocity(playerToUpdate);
                if (playerData.typing) {
                    playerToUpdate.typingIcon.setActive(true).setVisible(true);
                } else {
                    if (playerToUpdate.typingIcon.active) {
                        playerToUpdate.typingIcon.setActive(false).setVisible(false);
                    }
                    playerToUpdate.speakText.setText(playerData.msg);
                }

                this.updatePlayerStuff(playerToUpdate);
            }
        });
    }

    animForPlayerFromVelocity(player) {
        if (player.body.velocity.x > 0) {
            player.anims.play('right', true);
        } else if ( player.body.velocity.x < 0) {
            player.anims.play('left', true);
        } else if ( player.body.velocity.y > 0) {
            player.anims.play('down', true);
        } else if ( player.body.velocity.y < 0) {
            player.anims.play('up', true);
        } else {
            player.anims.pause();
        }
    }

    playerHandler(delta) {
        if (this.player.alive) {
            if (OL.IS_MOBILE) {
                this.playerMobileMovementHandler();
            } else {
                this.playerMovementHandler();
            }
            this.playerMsgDecayHandler(delta);
            this.updatePlayerStuff(this.player);
        }
    }

    updatePlayerStuff(player) {
        player.speakText.x = player.x;
        player.speakText.y = player.y - 50;

        player.typingIcon.x = player.x + player.size /2;
        player.typingIcon.y = player.y - player.size;

        player.usernameText.x = player.x;
        player.usernameText.y = player.y + 20;
    }

    playerMsgDecayHandler(delta) {
        if (this.player.msg !== "") {
            if (this.player.msg_duration > OL.MSG_MAXTIME) {
                this.player.msg = "";
                this.player.speakText.setText(this.player.msg);
                this.player.msg_duration = 0;
            } else {
                this.player.msg_duration += delta;
            }
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

    getAngle(cx, cy, ex, ey) {
        var dy = ey - cy;
        var dx = ex - cx;
        var theta = Math.atan2(dy, dx); // range (-PI, PI]
        theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        //if (theta < 0) theta = 360 + theta; // range [0, 360)
        return theta;
    }

    getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1-x2, 2), Math.pow(y1-y2, 2));
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
        if (!this.chatting && pointer.isDown) {
            var touchX = pointer.x;
            var touchY = pointer.y;
            var touchWorldPoint = this.camera.getWorldPoint(touchX, touchY);
            if (this.getDistance(this.player.body.position.x, this.player.body.position.y, touchWorldPoint.x, touchWorldPoint.y) > 29) {
                this.setPlayerSpeedFromTouchAngle(this.getAngle(this.player.body.position.x, this.player.body.position.y, touchWorldPoint.x, touchWorldPoint.y));
            }
        } else {
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            this.player.anims.pause();
        }
    }
}