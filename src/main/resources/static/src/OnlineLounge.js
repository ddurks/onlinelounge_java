import { OL, TextButton } from './utils';
import { GamServerClient } from './GameServerClient';
import { Player } from './Player';
import { Butterfly, OnlineBouncer } from './Guys';
import { Coin, Heart } from './Items';

export class OnlineLounge extends Phaser.Scene {
    constructor() {
        super('OnlineLounge');
        this.players = new Map();
        this.butterflies = new Array();
        this.coins = new Array();
        this.hearts = new Array();
        this.MAX_BUTTERFLIES = 4;
    }

    create() { 
        //map
        this.map = this.make.tilemap({ key: "map" });
        var groundTileset = this.map.addTilesetImage("online-pluto-tileset-extruded", "groundTiles");
        var objectTileset = this.map.addTilesetImage("online-tileset-extruded", "objectTiles");
        var belowLayer = this.map.createLayer("below", groundTileset, 0, 0);
        this.worldLayer = this.map.createLayer("world", objectTileset, 0, 0);
        var aboveLayer = this.map.createLayer("above", objectTileset, 0, 0);
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
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.scene.get('Controls').events.on('openChat', () => this.openChatBox());
        this.scene.get('Controls').events.on('sendChat', () => this.sendChat());
        this.scene.get('Controls').events.on('zoomIn', () => this.zoomIn());
        this.scene.get('Controls').events.on('zoomOut', () => this.zoomOut());

        this.onlineBouncer = new OnlineBouncer(this, 624, 396);

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
        OL.getRandomInt(0,30) === 25 ? this.updateCoins() : this.updateHearts();
        this.cameraDolly.x = Math.floor(this.player.x);
        this.cameraDolly.y = Math.floor(this.player.y);
    }

    zoomIn() {
        console.log("zoom in");
        this.camera.pan(this.player.x, this.player.y, 100, 'Power2');
        this.camera.zoomTo(2, 1000);
    }

    zoomOut() {
        console.log("zoom out");
        this.camera.pan(this.player.x, this.player.y, 100, 'Power2');
        this.camera.zoomTo(1, 1000);    
    }

    openChatBox() {
        this.player.startTyping();
        this.input.keyboard.enabled = false;
    }

    sendChat() {
        this.player.setMsg(document.getElementById("chat-entry").value);
        this.input.keyboard.enabled = true;
    }

    generateCuteGuy() {
        var cuteGuy = this.physics.add.sprite(OL.world.centerX, OL.world.centerY, 'cute');
        cuteGuy.setScale(0.25);
        cuteGuy.setCollideWorldBounds(true);
        cuteGuy.setBounce(1);
        return cuteGuy;
    }

    updateCoins() {
        if(this.coins.length < 25) {
            let coin = new Coin(this, OL.getRandomInt(0, this.map.widthInPixels), OL.getRandomInt(0, this.map.heightInPixels));
            console.log("new coin");
            console.log(coin.x, coin.y);
            this.coins.push(coin);
        }
    }

    updateHearts() {
        if(this.hearts.length < 50) {
            let heart = new Heart(this, OL.getRandomInt(0, this.map.widthInPixels), OL.getRandomInt(0, this.map.heightInPixels));
            console.log("new heart");
            console.log(heart.x, heart.y);
            this.hearts.push(heart);
        }
    }

    generatePlayer(username) {
        let player = new Player(this, 50, 50, 'playerDefault', username);
        this.physics.add.collider(player, this.worldLayer);
        return player;
    }
    
    generateButterfly() {
        if(this.butterflies.length < this.MAX_BUTTERFLIES) {
            let butterfly = new Butterfly(this, this.player.x + OL.getRandomInt(-250, 250), this.player.y + OL.getRandomInt(-250, 250));
            this.butterflies.push(butterfly);
            return butterfly;
        }
        return null;
    }

    updateAllButterflies() {
        let random = OL.getRandomInt(0, 1000);
        if (random === 25) {
            console.log("generate butterfly");
            this.generateButterfly();
        }
        this.butterflies.forEach( (butterfly, index, butterflies) => {
            butterfly.update();
            if (!this.camera.worldView.contains(butterfly.x,butterfly.y)) {
                butterflies.splice(index, 1);
                butterfly.destroy();
            }
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
        this.physics.world.collide(this.player, this.onlineBouncer, () => {console.log("BOUNCER")})
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