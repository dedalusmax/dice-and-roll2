import { Settings } from "../models/settings";
import { ImageService } from "../services/image.service";
import { Assets } from "../models/assets";
import { FONT_FAMILY, FONT_FAMILY_BLOCK } from "../models/styles";
import { ArrowsService, ArrowOrientation } from "../services/arrows.service";
import { Party } from "../models/party";
import { SceneService } from "../services/scene.service";
import { MapScene } from "./map.scene";
import { MapSceneOptions, BattleSceneOptions } from "./scene-options";
import { BattleScene } from "./battle.scene";
import { NewGameScene } from "./new-game.scene";
import { BestiaryScene } from "./bestiary.scene";
import { SaveGameService } from "../services/save-game.service";
import { TerrainType } from "../models/location";
import { LocationService } from "../services/location.service";

const BACK_STYLE = { font: '56px ' + FONT_FAMILY, fill: '#DDDD00', align: 'center', stroke: '#000000', strokeThickness: 2 },
    HEADER_STYLE = { font: '24px ' + FONT_FAMILY, fill: '#444' },
    SUBMENU_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#FF6A00', align: 'center', stroke: '#000000', strokeThickness: 2 },
    VOLUME_STYLE = { font: '24px ' + FONT_FAMILY_BLOCK, fill: '#990000', align: 'center' },
    AUTHOR_STYLE = { font: '24px ' + FONT_FAMILY, fill: '#581B06', align: 'center' },
    AUTHOR_SMALL_STYLE =  { font: '18px ' + FONT_FAMILY, fill: '#581B06', align: 'center' },
    MENU_STYLE = { font: '42px ' + FONT_FAMILY, fill: '#581B06', align: 'center' },
    MENU_PRESSED = { font: '56px ' + FONT_FAMILY, fill: '#FF6A00', align: 'center', stroke: '#000000', strokeThickness: 2 };

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

        menu.add(this.createMenuItem('New Game', position++, MENU_STYLE, this.newGame.bind(this)));

        if (SaveGameService.isGameSaved()) {
            menu.add(this.createMenuItem('Continue', position++, MENU_STYLE, this.continueGame.bind(this))); 
        }

        menu.add(this.createMenuItem('Skirmish', position++, MENU_STYLE, this.createSkirmishMenu.bind(this)));
        menu.add(this.createMenuItem('World Map', position++, MENU_STYLE, this.openWorldMap.bind(this)));
        menu.add(this.createMenuItem('Bestiary', position++, MENU_STYLE, this.openBestiary.bind(this)));
        menu.add(this.createMenuItem('Intro', position++, MENU_STYLE, this.openBestiary.bind(this)));
        menu.add(this.createMenuItem('Settings', position++, MENU_STYLE, this.createSettingsMenu.bind(this)));
        menu.add(this.createMenuItem('Credits', position++, MENU_STYLE, this.createCreditsMenu.bind(this)));

        this._activeMenu = menu;
    };

    private createMenuItem(text, position, style, action?) {
        style = style || MENU_PRESSED;

        var x = this._paper.x;
        var y = this._paper.y - this._paper.displayHeight / 2 + 60 + position * 50;
        var item = this.add.text(x, y, text, style);
        item.setOrigin(0.5);

        item.setInteractive();

        item.on('pointerdown', e => {
            this.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
            if (action) {
                item.setStyle(MENU_PRESSED);
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
        if (this._activeMenu) {
            this._activeMenu.toggleVisible();
        }
        var menu = this.add.group();

        menu.add(this.createMenuItem('Choose from the following battles:', 1, HEADER_STYLE));

        menu.add(this.createMenuItem('Shipwreck', 1.8, AUTHOR_STYLE, this.startSkirmishGame.bind(this, 'shipwreck', 1)));
        menu.add(this.createMenuItem('Hunter\'s Lodge', 2.5, AUTHOR_STYLE, this.startSkirmishGame.bind(this, 'hunters_lodge', 1)));
        menu.add(this.createMenuItem('Old Theatre', 3.2, AUTHOR_STYLE, this.startSkirmishGame.bind(this, 'old_theatre', 2)));
        menu.add(this.createMenuItem('The Hollow', 3.9, AUTHOR_STYLE, this.startSkirmishGame.bind(this, 'the_hollow', 2)));
        menu.add(this.createMenuItem('Sunken Graveyard', 4.6, AUTHOR_STYLE, this.startSkirmishGame.bind(this, 'sunken_graveyard', 2)));
        menu.add(this.createMenuItem('The Red Keep', 5.3, AUTHOR_STYLE, this.startSkirmishGame.bind(this, 'the_red_keep', 3)));
        menu.add(this.createMenuItem('King\'s Bridge', 6.0, AUTHOR_STYLE, this.startSkirmishGame.bind(this, 'kings_bridge', 3)));
        menu.add(this.createMenuItem('Candlelight', 6.7, AUTHOR_STYLE, this.startSkirmishGame.bind(this, 'candlelight', 3)));
        menu.add(this.createMenuItem('Fort Sibros', 7.4, AUTHOR_STYLE, this.startSkirmishGame.bind(this, 'fort_sibros', 4)));

        menu.add(this.createMenuItem('Back', 8.5, BACK_STYLE, this.createMainMenu.bind(this)));

        this._activeMenu = menu;
    }

    private startSkirmishGame(locationName: string, level: number): void {

        const party = new Party();

        const characters: Array<any> = [];
        for (var character in Assets.characters) {
            characters.push(Assets.characters[character]);
        }

        while (party.members.length < 3) {

            const player = Phaser.Math.RND.pick(characters);

            if (party.members.find(p => p.name == player.name)) {
                continue;
            }

            player.specialsUsed = Phaser.Math.RND.between(0, level);
            const availableWeapons: Array<any> = player.weapons.slice(0, level);
            player.weapon = Phaser.Math.RND.pick(availableWeapons);
            const availableArmors: Array<any> = player.armors.slice(0, level);
            player.armor = Phaser.Math.RND.pick(availableArmors);

            party.add(player);
        }

        const location = LocationService.get(locationName);
        
        const enemyParty = [];
        location.enemies.forEach(enemy => {
            enemyParty.push(Assets.monsters[enemy]);
        });

        var options = new BattleSceneOptions();
        options.playerParty = party;
        options.terrain = TerrainType[location.terrain];
        options.skirmish = true;
        options.enemyParty = enemyParty; // [ Assets.monsters.fey, Assets.monsters.corpse, Assets.monsters.hoblum ],
        options.enemyMana = location.enemyMana;
        options.reward = location.reward;

        SceneService.run(this, new BattleScene(), false, options);
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
        menu.add(this.createMenuItem('Game settings:', position, HEADER_STYLE));

        position += 0.8;
        menu.add(this.createMenuItem('Music volume', position, SUBMENU_STYLE));

        position += 0.8;
        var musicLevel = this.createMenuItem('', position, VOLUME_STYLE);
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
        menu.add(this.createMenuItem('Sound FX volume', position, SUBMENU_STYLE));

        position += 0.8;
        var sfxLevel = this.createMenuItem('', position, VOLUME_STYLE);
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
        menu.add(this.createMenuItem('Back', position, BACK_STYLE, this.createMainMenu.bind(this)));

        this._activeMenu = menu;
    };

    private createCreditsMenu() {
        if (this._activeMenu) {
            this._activeMenu.toggleVisible();
        }
        var menu = this.add.group();

        menu.add(this.createMenuItem('Game programming:', 1, HEADER_STYLE));
        menu.add(this.createMenuItem('Ratko & Šimun Ćosić', 1.4, AUTHOR_STYLE));
        menu.add(this.createMenuItem('Game artwork:', 2, HEADER_STYLE));
        menu.add(this.createMenuItem('Klara Ćosić', 2.4, AUTHOR_STYLE));
        menu.add(this.createMenuItem('Game story:', 3, HEADER_STYLE));
        menu.add(this.createMenuItem('Tvrtko Ćosić', 3.4, AUTHOR_STYLE));
        menu.add(this.createMenuItem('Special thanks to:', 4, HEADER_STYLE));
        menu.add(this.createMenuItem('Looperman for music tracks', 4.4, AUTHOR_SMALL_STYLE));
        menu.add(this.createMenuItem('Freesound for sound effects', 4.8, AUTHOR_SMALL_STYLE));
        menu.add(this.createMenuItem('For full list of music\n and sound effects authors click here', 5.8, AUTHOR_STYLE, this.navigateToReadme.bind(this)));
        menu.add(this.createMenuItem('Back', 7, BACK_STYLE, this.createMainMenu.bind(this)));

        this._activeMenu = menu;
    }

    private navigateToReadme() {
        window.open('https://github.com/dedalusmax/dice-and-roll2/blob/master/README.md','_blank');
    }

    private newGame() {
        SceneService.run(this, new NewGameScene(), true);
    };

    private openBestiary() {
        SceneService.run(this, new BestiaryScene(), true);
    };
}
