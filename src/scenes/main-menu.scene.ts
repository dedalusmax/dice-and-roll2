import { Settings } from "../models/settings";
import { ImageService } from "../services/image.service";
import { Assets } from "../models/assets";
import { Styles } from "../models/styles";
import { ArrowsService, ArrowOrientation } from "../services/arrows.service";
import { Party } from "../models/party";
import { SceneService } from "../services/scene.service";
import { MapScene } from "./map.scene";
import { MapSceneOptions, BattleSceneOptions } from "./scene-options";
import { BattleScene } from "./battle.scene";
import { NewGameScene } from "./new-game.scene";
import { BestiaryScene } from "./bestiary.scene";
import { SaveGameService } from "../services/save-game.service";

export class MainMenuScene extends Phaser.Scene {

    private _music: Phaser.Sound.BaseSound;
    private _paper: Phaser.GameObjects.Sprite;
    private _activeMenu: Phaser.GameObjects.Group;

    constructor() {
        super({
            key: "MainMenuScene"
        });
    }

    // no init, since no scene parameters passed

    create(): void {
        this.cameras.main.fadeIn(1000);

        this.cameras.main.setBackgroundColor(0xFFFFFF);

        if (Settings.sound.musicVolume > 0) {
            this.sound.stopAll();
            this._music = this.sound.add('theme');
            this._music.play('', { loop: true });
        }

        // set screen background
        ImageService.stretchAndFitImage('menu', this);
        var logo = ImageService.stretchAndFitImage('logo', this);
        logo.setScale(0.12);
        logo.setOrigin(1, 1.4);

        this._paper = this.add.sprite(this.cameras.main.width / 2 + 200, this.cameras.main.height / 2, 'paper');
        this._paper.setOrigin(0.5);
        this._paper.setScale(0.5, 0.7);

        // build up main menu
        this.createMainMenu();
    }

    update(): void {
        if (this.sound.volume < Settings.sound.musicVolume) {
            this.sound.volume += 0.005;
        } 
    }

    private createMainMenu() {
        if (this._activeMenu) {
            this._activeMenu.toggleVisible();
        }
        var menu = this.add.group();

        var position = 1;

        menu.add(this.createMenuItem('New Game', position++, Styles.menu.menu_button, this.newGame.bind(this)));

        if (SaveGameService.isGameSaved()) {
            menu.add(this.createMenuItem('Continue', position++, Styles.menu.menu_button, this.continueGame.bind(this))); 
        }

        menu.add(this.createMenuItem('Skirmish', position++, Styles.menu.menu_button, this.createSkirmishMenu.bind(this)));
        menu.add(this.createMenuItem('World Map', position++, Styles.menu.menu_button, this.openWorldMap.bind(this)));
        menu.add(this.createMenuItem('Bestiary', position++, Styles.menu.menu_button, this.openBestiary.bind(this)));
        menu.add(this.createMenuItem('Settings', position++, Styles.menu.menu_button, this.createSettingsMenu.bind(this)));
        menu.add(this.createMenuItem('Credits', position++, Styles.menu.menu_button, this.createCreditsMenu.bind(this)));

        this._activeMenu = menu;
    };

    private createMenuItem(text, position, style, action?) {
        style = style || Styles.menu.menu_button_pressed;

        var x = this._paper.x;
        var y = this._paper.y - this._paper.displayHeight / 2 + 60 + position * 60;
        var item = this.add.text(x, y, text, style);
        item.setOrigin(0.5);

        item.setInteractive();

        item.on('pointerdown', e => {
            this.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
            if (action) {
                item.setStyle(Styles.menu.menu_button_pressed);
                action.call();
            }
        });

        return item;
    };
    
    private openWorldMap() {
        var options = new MapSceneOptions();
        options.worldMap = true;
        SceneService.run(this, new MapScene(), false, options);
    }

    private continueGame() {

        let storedParty = SaveGameService.load();

        var options = new MapSceneOptions();
        options.worldMap = false;
        options.playerParty = storedParty;
        SceneService.run(this, new MapScene(), false, options);
    }

    private createSkirmishMenu() {

        var party = new Party();
        var p1 = Assets.characters.musketeer; 
        var p2 = Assets.characters.gunslinger; 
        var p3 = Assets.characters.illusionist; 
        // beef them with all specials
        // p1.specialsUsed = 4;
        // p2.specialsUsed = 4;
        // p3.specialsUsed = 4;
        party.add(p1);
        party.add(p2);
        party.add(p3);

        var options = new BattleSceneOptions();
        options.playerParty = party;
        options.terrain = 'beach';
        options.skirmish = true;
        options.enemyParty = [ Assets.monsters.plague_doctor ], // [ Assets.monsters.seabound_sailor, Assets.monsters.seabound_captain, Assets.monsters.siren ];
        options.enemyMana = 100;
        SceneService.run(this, new BattleScene(), false, options);

        return;

        if (this._activeMenu) {
            this._activeMenu.toggleVisible();
        }
        var menu = this.add.group();

        var mockupPlayers = [
            Assets.characters.gunslinger,
            Assets.characters.automaton,
            Assets.characters.musketeer,
            Assets.characters.alchemist,
            Assets.characters.assasin,
            Assets.characters.illusionist
        ];

        mockupPlayers.forEach(character => character.specialsUsed = 4);

        // TODO: add battles

        menu.add(this.createMenuItem('Back', 5.2, Styles.text.backButton, this.createMainMenu.bind(this)));

        this._activeMenu = menu;
    }

    private displayVolume(volume): string {
        if (volume === 0) {
            return 'off';
        } else if (volume === 1) {
            return 'max';
        } else {
            return (volume * 100).toString();
        }
    };

    private createSettingsMenu() {
        if (this._activeMenu) {
            this._activeMenu.toggleVisible();
        }
        var menu = this.add.group();

        var position = 1;
        menu.add(this.createMenuItem('Game settings:', position, Styles.menu.header));

        position += 0.8;
        menu.add(this.createMenuItem('Music volume', position, Styles.menu.submenu));

        position += 0.8;
        var musicLevel = this.createMenuItem('', position, Styles.menu.volume);
        musicLevel.setText(this.displayVolume(Settings.sound.musicVolume));
        menu.add(musicLevel);

        var ARROW_OFFSET = 60;

        var lessMusic = ArrowsService.createArrow(this, musicLevel.x - ARROW_OFFSET, musicLevel.y + 5, ArrowOrientation.left, () => {
            if (Settings.sound.musicVolume > 0) {
                Settings.sound.musicVolume = Math.round((Settings.sound.musicVolume - 0.1) * 10) / 10;
                musicLevel.setText(this.displayVolume(Settings.sound.musicVolume));
                this.sound.volume = Settings.sound.musicVolume;
            }
            if (Settings.sound.musicVolume == 0) {
                ArrowsService.disableArrow(lessMusic);
            } else {
                ArrowsService.enableArrow(moreMusic);
            }
        });
        menu.add(lessMusic);

        var moreMusic = ArrowsService.createArrow(this, musicLevel.x + ARROW_OFFSET, musicLevel.y + 5, ArrowOrientation.right, () => {
            if (Settings.sound.musicVolume < 1) {
                Settings.sound.musicVolume = Math.round((Settings.sound.musicVolume + 0.1) * 10) / 10;
                musicLevel.setText(this.displayVolume(Settings.sound.musicVolume));
                this.sound.volume = Settings.sound.musicVolume;
            }
            if (Settings.sound.musicVolume == 1) {
                ArrowsService.disableArrow(moreMusic);
            } else {
                ArrowsService.enableArrow(lessMusic);
            }
        }, true);
        menu.add(moreMusic);

        position += 0.8;
        menu.add(this.createMenuItem('Sound FX volume', position, Styles.menu.submenu));

        position += 0.8;
        var sfxLevel = this.createMenuItem('', position, Styles.menu.volume);
        sfxLevel.setText(this.displayVolume(Settings.sound.sfxVolume));
        menu.add(sfxLevel);

        var lessSfx = ArrowsService.createArrow(this, sfxLevel.x - ARROW_OFFSET, sfxLevel.y + 5, ArrowOrientation.left, () => {
            if (Settings.sound.sfxVolume > 0) {
                Settings.sound.sfxVolume = Math.round((Settings.sound.sfxVolume - 0.1) * 10) / 10;
                sfxLevel.setText(this.displayVolume(Settings.sound.sfxVolume));
            }
            if (Settings.sound.sfxVolume == 0) {
                ArrowsService.disableArrow(lessSfx);
            } else {
                ArrowsService.enableArrow(moreSfx);
            }
        });
        menu.add(lessSfx);

        var moreSfx = ArrowsService.createArrow(this, sfxLevel.x + ARROW_OFFSET, sfxLevel.y + 5, ArrowOrientation.right, () => {
            if (Settings.sound.sfxVolume < 1) {
                Settings.sound.sfxVolume = Math.round((Settings.sound.sfxVolume + 0.1) * 10) / 10;
                sfxLevel.setText(this.displayVolume(Settings.sound.sfxVolume));
            }
            if (Settings.sound.sfxVolume == 1) {
                ArrowsService.disableArrow(moreSfx);
            } else {
                ArrowsService.enableArrow(lessSfx);
            }
        }, true);
        menu.add(moreSfx);

        position += 1.6;
        menu.add(this.createMenuItem('Back', position, Styles.text.backButton, this.createMainMenu.bind(this)));

        this._activeMenu = menu;
    };

    private createCreditsMenu() {
        if (this._activeMenu) {
            this._activeMenu.toggleVisible();
        }
        var menu = this.add.group();

        menu.add(this.createMenuItem('Game programming:', 1, Styles.menu.header));
        menu.add(this.createMenuItem('Ratko & Šimun Ćosić', 1.4, Styles.menu.author));
        menu.add(this.createMenuItem('Game artwork:', 2, Styles.menu.header));
        menu.add(this.createMenuItem('Klara Ćosić', 2.4, Styles.menu.author));
        menu.add(this.createMenuItem('Game story:', 3, Styles.menu.header));
        menu.add(this.createMenuItem('Tvrtko Ćosić', 3.4, Styles.menu.author));
        menu.add(this.createMenuItem('Special thanks to:', 4, Styles.menu.header));
        menu.add(this.createMenuItem('Looperman for music tracks', 4.4, Styles.menu.author_small));
        menu.add(this.createMenuItem('Freesound for sound effects', 4.8, Styles.menu.author_small));
        menu.add(this.createMenuItem('Back', 6, Styles.text.backButton, this.createMainMenu.bind(this)));

        this._activeMenu = menu;
    }

    private newGame() {
        SceneService.run(this, new NewGameScene(), true);
    };

    private openBestiary() {
        SceneService.run(this, new BestiaryScene(), true);
    };
}
