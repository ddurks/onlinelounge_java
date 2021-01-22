class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.input.keyboard.on('keydown', this.handleKey, this);

        var particles = this.add.particles('logo');

        var emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD'
        });

        var logo = this.physics.add.image(100, 100, 'logo');
        logo.setScale(0.5);

        logo.setVelocity(75, 125);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);

        emitter.startFollow(logo);

        var text = this.add.text(10, 10, 'Please login to play', { color: 'white', fontFamily: 'Arial', fontSize: '32px '});

        var element = this.add.dom(OL.world.width/2, OL.world.height/2).createFromCache('nameform');

        console.log(element);
        element.setPerspective(800)
        element.addListener('click');

        var thisScene = this;
    
        element.on('click', function (event) {
    
            if (event.target.name === 'loginButton')
            {
                var inputUsername = this.getChildByName('username');
                var inputPassword = this.getChildByName('password');
    
                //  Have they entered anything?
                if (inputUsername.value !== '')
                {
                    OL.username = inputUsername.value;
                    OL.password = inputPassword.value;
                    //  Turn off the click events
                    this.removeListener('click');
    
                    //  Tween the login form out
                    this.scene.tweens.add({ targets: element.rotate3d, x: 1, w: 90, duration: 3000, ease: 'Power3' });
    
                    this.scene.tweens.add({ targets: element, scaleX: 2, scaleY: 2, y: 700, duration: 3000, ease: 'Power3', onComplete: thisScene.clickStart(thisScene)});
    
                    //  Populate the text with whatever they typed in as the username!
                    text.setText('Welcome ' + inputUsername.value);
                }
                else
                {
                    //  Flash the prompt
                    this.scene.tweens.add({ targets: text, alpha: 0.1, duration: 200, ease: 'Power3', yoyo: true });
                }
            }
    
        });
        console.log("main menu");
    }

    handleKey(e) {
        switch(e.code) {
            case 'KeyS': {
                break;
            }
            case 'Enter': {
                this.clickStart(this);
                break;
            }
            default: {}
        }
    }

    clickStart(scene) {
        OL.fadeOutScene('OnlineLounge', scene)
    }
}