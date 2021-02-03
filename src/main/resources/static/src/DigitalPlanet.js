import { OL } from './utils';
import { GamServerClient } from './GameServerClient';
import { Player } from './Player';
import { Butterfly, OnlineBouncer } from './Guys';
import { Coin, Heart } from './Items';

export class DigitalPlanet extends Phaser.Scene {
    constructor() {
        super('DigitalPlanet');
        this.players = new Map();
        this.butterflies = new Array();
        this.coins = new Array();
        this.hearts = new Array();
        this.looks = new Array();
        this.lookIndex = 0;
        this.MAX_BUTTERFLIES = 4;
    }

    init(data) {
        if (data.exitTo) {
            this.exitTo = data.exitTo;
        }
        this.startData = data;
    }

    create() { 
        this.looks = ['computer_guy', 'phone_guy', 'cute_guy'];
        //map
        this.map = this.make.tilemap({ key: this.startData.mapKey });
        this.groundTileset = this.map.addTilesetImage(this.startData.groundTileset.name, this.startData.groundTileset.ref);
        this.objectTileset = this.map.addTilesetImage(this.startData.objectTileset.name, this.startData.objectTileset.ref);
        this.belowLayer = this.map.createLayer("below", this.groundTileset, 0, 0);
        this.worldLayer = this.map.createLayer("world", this.objectTileset, 0, 0);
        this.aboveLayer = this.map.createLayer("above", this.objectTileset, 0, 0);
        this.worldLayer.setCollisionByProperty({ collides: true });
        this.aboveLayer.setDepth(10);

        this.player, this.onlineBouncer;

        if (this.startData.spawn) {
            this.player = this.generatePlayer(this.startData.spawn.x, this.startData.spawn.y, OL.username);
            this.physics.add.collider(this.player, this.worldLayer);
            this.physics.world.enable(this.player);  
        }
        this.map.findObject('player', (object) => {
            if (object.name === 'spawn' && !this.startData.spawn) {
                this.player = this.generatePlayer(object.x, object.y, OL.username);
                this.physics.add.collider(this.player, this.worldLayer);
                this.physics.world.enable(this.player);
            }

            if (object.name === 'bouncerSpawn') {
                this.onlineBouncer = new OnlineBouncer(this, object.x + 16, object.y - 24);
                if (this.startData.mapKey === "map") {
                    this.worldLayer.setTileLocationCallback(object.x / object.width, object.y / object.width - 1, 1, 1, this.enterLounge, this);
                }
            }

            if (object.name === 'exit') {
                this.worldLayer.setTileLocationCallback(object.x / object.width, object.y / object.width - 1, 1, 1, this.exit, this);
            }

            if (object.type === 'info') {
                this.worldLayer.setTileLocationCallback(object.x / object.width, object.y / object.width - 1, 1, 1, () => this.events.emit('displayPopup', {text: object.name}), this);
            }
        });

        // controls
        this.controls = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, false)
        };

        this.camera = this.cameras.main;

        this.cameraDolly = new Phaser.Geom.Point(this.player.x, this.player.y);
        this.camera.startFollow(this.player, true);
        this.camera.setBounds(0, -48, this.map.widthInPixels, this.map.heightInPixels);

        this.scene.get('Controls').events.on('openChat', () => this.openChatBox());
        this.scene.get('Controls').events.on('sendChat', () => this.sendChat());
        this.scene.get('Controls').events.on('zoomIn', () => this.zoomIn());
        this.scene.get('Controls').events.on('zoomOut', () => this.zoomOut());
        this.scene.get('Controls').events.on('lookChange', () => this.changeLook());

        console.log("logged in - " + OL.username, " (password: " + OL.password + ")");
        this.gameServer = this.generateGameServerConnectionClient();
    }

    changeLook() {
        console.log("changeLook");
        if (this.lookIndex < this.looks.length - 1) {
            this.lookIndex++;
        } else {
            this.lookIndex = 0;
        }
        let pos = {
            x: this.player.x,
            y: this.player.y
        }
        this.player.destroyStuff();
        this.player.destroy();
        this.player = this.generatePlayer(pos.x, pos.y, OL.username);
        this.camera.startFollow(this.player, true);
        this.camera.setBounds(0, -48, this.map.widthInPixels, this.map.heightInPixels);
    }

    exit() {
        if (this.exitTo) {
            this.exitTo.spawn = {
                x: 525,
                y: 325
            }
            this.scene.restart(this.exitTo);
        }
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
        // this.updateAllButterflies();
        // OL.getRandomInt(0,30) === 25 ? this.updateCoins() : this.updateHearts();
        this.cameraDolly.x = Math.floor(this.player.x);
        this.cameraDolly.y = Math.floor(this.player.y);
    }

    zoomIn() {
        this.camera.pan(this.player.x, this.player.y, 100, 'Power2');
        this.camera.zoomTo(2, 1000);
    }

    zoomOut() {
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

    generatePlayer(x, y, username) {
        let player = new Player(this, x, y, this.looks[this.lookIndex], username);
        this.physics.add.collider(player, this.worldLayer);
        this.events.emit('playerLoaded', {texture: player.texture.key});
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
                this.players.set(playerData.id, this.generatePlayer(playerData.x, playerData.y, playerData.username));
                console.log(this.players.get(playerData.id));
            } else if (playerToUpdate) {
                playerToUpdate.updateFromData(playerData);
            }
        });
    }

    playerHandler(delta) {
        // this.physics.world.collide(this.player, this.onlineBouncer, () => this.enterLounge());
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

    enterLounge() {
        this.scene.restart({
            mapKey: "loungeMap",
            groundTileset: {
                name: "online-lounge-objects-extruded",
                ref: "loungeTiles"
            },
            objectTileset: {
                name: "online-lounge-objects-extruded",
                ref: "loungeTiles"
            },
            exitTo: this.startData
        });
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
            if (touchX <= 410 || (touchY <= 440 && touchY >= 48)) {
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