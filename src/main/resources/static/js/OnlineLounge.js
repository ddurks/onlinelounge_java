class TextButton extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, style, callback) {
      super(scene, x, y, text, style);

      this.setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.enterButtonHoverState() )
        .on('pointerout', () => this.enterButtonRestState() )
        .on('pointerdown', () => this.enterButtonActiveState() )
        .on('pointerup', () => {
          this.enterButtonHoverState();
          callback();
        });
    }

    enterButtonHoverState() {
      this.setStyle({ fill: 'white'});
    }

    enterButtonRestState() {
      this.setStyle({ fill: 'black'});
    }

    enterButtonActiveState() {
      this.setStyle({ fill: 'white' });
    }
}

class OnlineLounge extends Phaser.Scene {
    constructor() {
        super('OnlineLounge');
        this.chatting = false;
    }

    create() { //map
        var map = this.make.tilemap({ key: "map" });
        var groundTileset = map.addTilesetImage("online-pluto-tileset-extruded", "groundTiles");
        var objectTileset = map.addTilesetImage("online-tileset-extruded", "objectTiles");
        var belowLayer = map.createLayer("below", groundTileset, 0, 0);
        var worldLayer = map.createLayer("world", objectTileset, 0, 0);
        var aboveLayer = map.createLayer("above", objectTileset, 0, 0);
        worldLayer.setCollisionByProperty({ collides: true });
        aboveLayer.setDepth(10);

        // player
        this.player = this.generatePlayer();
        this.usernameText = this.generateUsernameText(OL.username);
        this.speakText = this.generateSpeakText();
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

        this.physics.add.collider(this.player, worldLayer);

        this.camera = this.cameras.main;
        this.camera.startFollow(this.player);
        this.camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // create chat button and chatbox
        this.chatButton = new TextButton(this, 450, 475, OL.CHAT_TEXT, { fill: 'black', shadowColor: 'grey', backgroundColor: 'darkgrey' }, () => this.chat());
        this.chatButton.setDepth(11);
        this.add.existing(this.chatButton).setScrollFactor(0);

        this.add.dom(OL.world.width/2, OL.world.height/2).createFromCache('chatBox').setScrollFactor(0);
        document.getElementById("chat-box").style.display = "none";

        console.log("welcome to the online lounge");
        console.log(OL.username, " (password: " + OL.password + ")");   
    }

    update(time, delta) {
        this.playerHandler(delta);
        this.physics.world.collide(this.player, this.cuteGuy)
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

    openChatBox() {
        this.chatting = true;
        this.chatButton.setText(OL.SEND_TEXT);
        document.getElementById("chat-box").style.display = "block";
        this.input.keyboard.enabled = false;
    }

    sendChat() {
        this.chatting = false;
        this.setPlayerMsg(document.getElementById("chat-entry").value);
        this.speakText.setText(this.player.msg);
        this.chatButton.setText(OL.CHAT_TEXT);
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

    generateSpeakText() {
        var speakText = this.add.text(0,-29, "");
        speakText.setStroke('black', 3);
        speakText.setAlign('center');
        return speakText;
    }

    generatePlayer() {
        var player = this.physics.add.sprite(26/2, 29/2, 'playerDefault');

        this.anims.create({
            key: 'down', 
            frameRate: OL.WALKING_FRAMERATE,
            frames: this.anims.generateFrameNumbers('playerDefault', { frames: [0, 1, 0, 2] }),
            repeat: -1
        });
        this.anims.create({
            key: 'left', 
            frameRate: OL.WALKING_FRAMERATE,
            frames: this.anims.generateFrameNumbers('playerDefault', { frames: [9, 10, 9, 11] }),
            repeat: -1
        });
        this.anims.create({
            key: 'right', 
            frameRate: OL.WALKING_FRAMERATE,
            frames: this.anims.generateFrameNumbers('playerDefault', { frames: [3, 4, 3, 5] }),
            repeat: -1
        });
        this.anims.create({
            key: 'up', 
            frameRate: OL.WALKING_FRAMERATE,
            frames: this.anims.generateFrameNumbers('playerDefault', { frames: [6, 7, 6, 8] }),
            repeat: -1
        });

        player.alive = true;

        player.name = 'anonymous';
        player.speed = OL.WALKING_SPEED;
        player.msg = "";
        player.msg_duration = 0;

        return player;
    }

    generateUsernameText(username) {
        var usernameText = this.add.text(0,29+5, username);
        usernameText.setStroke('grey', 3);
        usernameText.setAlign('center');
        return usernameText;
    }

    playerHandler(delta) {
        if (this.player.alive) {
            if (OL.IS_MOBILE) {
                this.playerMobileMovementHandler();
            } else {
                this.playerMovementHandler();
            }
            this.playerMsgDecayHandler(delta);

            this.speakText.x = this.player.x;
            this.speakText.y = this.player.y - 50;

            this.usernameText.x = this.player.x;
            this.usernameText.y = this.player.y + 20;
        }
    }

    playerMsgDecayHandler(delta) {
        if (this.player.msg !== "") {
            if (this.player.msg_duration > OL.MSG_MAXTIME) {
                this.player.msg = "";
                this.speakText.setText(this.player.msg);
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

    setPlayerSpeedFromTouchAngle(angle) {
        if (angle > -45 && angle <= 45) { // right
            this.player.setVelocityX(this.player.speed);
            this.player.anims.play('right', true);
        } else if (angle > 45 && angle <= 135) { //down
            this.player.setVelocityY(this.player.speed);
            this.player.anims.play('down', true);
        } else if ( (angle > 135 && angle <= 180) || (angle >= -180 && angle < -135) ) { //left
            this.player.setVelocityX(-this.player.speed);
            this.player.anims.play('left', true);
        } else if (angle <= -45 && angle >= -135) { //up
            this.player.setVelocityY(-this.player.speed);
            this.player.anims.play('up', true);
        }
    }

    playerMobileMovementHandler() {
        var pointer = this.input.activePointer;
        if (!this.chatting && pointer.isDown) {
            var touchX = pointer.x;
            var touchY = pointer.y;
            var touchWorldPoint = this.camera.getWorldPoint(touchX, touchY);
            this.setPlayerSpeedFromTouchAngle(this.getAngle(this.player.body.position.x, this.player.body.position.y, touchWorldPoint.x, touchWorldPoint.y));
        } else {
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            this.player.anims.pause();
        }
    }
}