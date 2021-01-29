export const OL = {
    SERVER_URL: "ws://" + window.location.host.replace(/\d+$/, "8081"),
    username: "anonymous",
    password: "",
    CHAT_TEXT: "chat",
    SEND_TEXT: "send",
    MSG_MAXTIME: 10000,
    WALKING_FRAMERATE: 10,
    WALKING_SPEED: 250,
    IS_MOBILE: false
};

export var touchSense = window.addEventListener('touchstart', function() {			
    OL.IS_MOBILE = true;
    console.log("IS_MOBILE");
    removeEventListener('touchstart', touchSense, false);
});

OL.fadeOutIn = function(passedCallback, context) {
    context.cameras.main.fadeOut(250);
    context.time.addEvent({
        delay: 250,
        callback: function() {
        context.cameras.main.fadeIn(250);
        passedCallback(context);
        },
        callbackScope: context
    });  
}
OL.fadeOutScene = function(sceneName, context) {
    context.cameras.main.fadeOut(0);
    context.time.addEvent({
        delay: 0,
        callback: function() {
            context.scene.start(sceneName);
        },
        callbackScope: context
    });
};

export class TextButton extends Phaser.GameObjects.Text {
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

OL.getRandomInt= function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}