/// <reference path="phaser.d.ts"/>

import "phaser";

// scenes in the game:
import { BootScene } from "./scenes/boot.scene";
import { LoadingScene } from "./scenes/loading.scene";
import { MainMenuScene } from "./scenes/main-menu.scene";
import { NewGameScene } from "./scenes/new-game.scene";
import { MapScene } from "./scenes/map.scene";
import { BattleScene } from "./scenes/battle.scene";
import { VictoryScene } from "./scenes/victory.scene";
import { DefeatScene } from "./scenes/defeat.scene";
import { BestiaryScene } from "./scenes/bestiary.scene";
import { EndScene } from "./scenes/end.scene";
import { IntroScene } from "./scenes/intro.scene";

var A4 = { height: 297, width: 210 };

// main game configuration
const config: GameConfig = {
    // width: A4.height * 4,
    // height: A4.width * 4,
    // width: window.innerWidth,
    // height: window.innerHeight,
    physics: {
      default: 'arcade' // , arcade: { debug: true }
     },
    width: window.innerWidth * window.devicePixelRatio - 4,
    height: window.innerHeight * window.devicePixelRatio - 4,
    type: Phaser.CANVAS,
    parent: "game",
    scene: [ 
      BootScene, LoadingScene, MainMenuScene, 
      IntroScene, NewGameScene, BestiaryScene, MapScene, BattleScene, 
      VictoryScene, DefeatScene, EndScene 
    ]
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

