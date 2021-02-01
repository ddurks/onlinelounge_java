import { OL } from './utils';

export class Butterfly extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.anims.create({
            key: 'left', 
            frameRate: 3,
            frames: this.anims.generateFrameNumbers('purpleButterfly', { frames: [0, 1] }),
            repeat: -1
        });

        this.anims.create({
            key: 'right', 
            frameRate: 3,
            frames: this.anims.generateFrameNumbers('purpleButterfly', { frames: [2, 3] }),
            repeat: -1
        });

        this.body.gravity.y = 100;
        this.homeY = y;
        OL.getRandomInt(0, 1) === 1 ? this.anims.play('left') : this.anims.play('right');
        return this;
    }

    update() {
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

    animForButterfly() {
        if (this.body.velocity.x > 0) {
            this.anims.play('right', true);
        } else if ( this.body.velocity.x < 0) {
            this.anims.play('left', true);
        }
    }
}