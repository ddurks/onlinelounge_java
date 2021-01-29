import 'phaser';
import { Preloader } from './Preloader';
import { Boot } from './Boot';
import { MainMenu } from './MainMenu';
import { OnlineLounge } from './OnlineLounge';

var gameConfig = {
	roundPixels: true,
	pixelArt: true,
	antialias: false,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 512,
		height: 512
	},
	parent: "phaser-div",
	dom: {
		createContainer: true
	},	  
    physics: {
		default: 'arcade',
		arcade: {
			debug: false,
		}
    },
	scene: [Boot, Preloader, MainMenu, OnlineLounge]
}
var game = new Phaser.Game(gameConfig);
window.focus();
