var gameConfig = {
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
			debug: true
		}
    },
	scene: [Boot, Preloader, MainMenu, OnlineLounge]
}
game = new Phaser.Game(gameConfig);
window.focus();