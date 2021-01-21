class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }
    preload() {
        var logo = this.add.sprite(OL.world.centerX, OL.world.centerY, 'logo');
        logo.setOrigin(0.5, 0.5);

		this.load.html('nameform', 'loginform.html');
		this.load.html('chatBox', 'chatbox.html');
		this.load.spritesheet('playerDefault', 'assets/computerguy-spritesheet-extruded.png', { frameWidth: 26, frameHeight: 29, margin: 1, spacing: 2 });
		this.load.image('cute', 'assets/pleading_eyes_emoji.png');
		this.load.image('groundTiles', "assets/tiles/online-pluto-tileset-extruded.png");
		this.load.image('objectTiles', "assets/tiles/online-tileset-extruded.png");
		this.load.tilemapTiledJSON('map', 'assets/tiles/onlinepluto-tilemap-new.json');

		// var progress = this.add.graphics();
		// this.load.on('progress', function (value) {
		// 	progress.clear();
		// 	progress.fillStyle(0xffde00, 1);
		// 	progress.fillRect(loadingBg.x-(loadingBg.width*0.5)+20, loadingBg.y-(loadingBg.height*0.5)+10, 540 * value, 25);
		// });
    }
    create() {
		OL.fadeOutScene('MainMenu', this);
	}
}