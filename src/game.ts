/// <reference path="phaser.d.ts"/>

import "phaser";
import { BootScene } from "./scenes/boot.scene";
import { LoadingScene } from "./scenes/loading.scene";
import { MainMenuScene } from "./scenes/main-menu.scene";
import { NewGameScene } from "./scenes/new-game.scene";
import { GameScene } from "./scenes/game.scene";
import { BattleScene } from "./scenes/battle.scene";

var A4 = { height: 297, width: 210 };

// main game configuration
const config: GameConfig = {
    // width: A4.height * 4,
    // height: A4.width * 4,
    width: window.innerWidth,
    height: window.innerHeight,
    type: Phaser.AUTO,
    parent: "game",
    scene: [ BootScene, LoadingScene, MainMenuScene, NewGameScene, GameScene, BattleScene ]
  };
  
// game class
export class Game extends Phaser.Game {
    constructor(config: GameConfig) {
      super(config);
    }
  }

// when the page is loaded, create our game instance
window.onload = () => {
    var game = new Game(config);
};

