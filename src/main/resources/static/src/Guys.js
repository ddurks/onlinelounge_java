import { OL } from './utils';

export class Butterfly extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        var texture;
        switch (OL.getRandomInt(0,3)) {
            case 0:
                texture = 'purpleButterfly';
                break;
            case 1:
                texture = 'pinkButterfly';
                break;
            case 2:
                texture = 'orangeButterfly';
                break;
            case 3:
                texture = 'blueButterfly';
                break;
        }
        super(scene.matter.world, x, y, texture);

        scene.add.existing(this);

        this.anims.create({
            key: 'left', 
            frameRate: 3,
            frames: this.anims.generateFrameNumbers(texture, { frames: [0, 1] }),
            repeat: -1
        });

        this.anims.create({
            key: 'right', 
            frameRate: 3,
            frames: this.anims.generateFrameNumbers(texture, { frames: [2, 3] }),
            repeat: -1
        });

        this.body.gravityScale.y = 100;
        this.homeY = y;
        OL.getRandomInt(0, 1) === 1 ? this.anims.play('left') : this.anims.play('right');
        return this;
    }

    update() {
        if (this.body) {
            let rand = OL.getRandomInt(0,50);
            if (rand === 1) {
                this.setVelocity(OL.getRandomInt(-100, 100), OL.getRandomInt(-300, 300));
            } else if (rand > 43) {
                this.setVelocity(0, 0);
            }
            if (this.y >= this.homeY) {
                this.setVelocityY(OL.getRandomInt(-200, 0));
            }
            this.animForButterfly();
        }
    }

    animForButterfly() {
        if (this.body.velocity.x > 0) {
            this.anims.play('right', true);
        } else if ( this.body.velocity.x < 0) {
            this.anims.play('left', true);
        }
    }
}

export class OnlineBouncer extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y) {
        super(scene.matter.world, x, y, 'onlineBouncer');

        scene.add.existing(this);

        this.anims.create({
            key: 'idle', 
            frameRate: 5,
            frames: this.anims.generateFrameNumbers('onlineBouncer', { frames: [0, 0, 0, 0, 2, 3] }),
            repeat: -1
        });

        this.anims.play('idle');
        return this;
    }
}