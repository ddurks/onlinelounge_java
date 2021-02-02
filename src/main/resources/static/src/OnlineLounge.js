import { OL } from './utils';
import { GamServerClient } from './GameServerClient';
import { Player } from './Player';
import { OnlineBouncer } from './Guys';
import { Coin, Heart } from './Items';

export class OnlineLounge extends Phaser.Scene {
    constructor() {
        super('DigitalPlanet');
        this.players = new Map();
        this.butterflies = new Array();
        this.coins = new Array();
        this.hearts = new Array();
        this.MAX_BUTTERFLIES = 4;
    }

}