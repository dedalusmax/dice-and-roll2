import { Settings } from "../models/settings";
import { ImageService } from "../services/image.service";
import { Input, Scene, Game } from "phaser";
import { Assets } from "../models/assets";
import { Styles } from "../models/styles";
import { Soundsets } from "../models/soundsets";

export class MainMenuScene extends Phaser.Scene {

    private _options: any;
    private _music: Phaser.Sound.BaseSound;
    private _activeMenu: Phaser.GameObjects.Group;
    private _soundset: any;

    constructor() {
        super({
            key: "MainMenuScene"
        });
    }

    init(data): void {
        this._options = data.options || {};
    }

    preload(): void {
        // this.loadGameData();
    }

    create(): void {

        var music;
        // check if music is enabled
        if (Settings.sound.musicVolume > 0) {
            if (this._music) {
                // music is already been there, and start playing if stopped
                if (!this._music.isPlaying) {   
                    music = this._music.play('', { loop: true });    
                } else {
                    music = this._music;
                } 
            } else {
                // introductory fade in of theme music
                this.sound.stopAll();
                this._music = this.sound.add('theme');
                music = this._music.play('', { loop: true });    
            }
        }

        // set screen background
        ImageService.stretchAndFitImage('menu', this);
        
        // set soundset for menus
        this._soundset = Soundsets.sounds['sword'];

        // build up main menu
        this.createMainMenu();
    }

    update(): void {
        if (this.sound.volume < Settings.sound.musicVolume) {
            this.sound.volume += 0.005;
        } 
    }

    setImage(area, image) {
        var asset = this.add.sprite(area.x, area.y, image);
        var ratio = Math.min(area.width / asset.width, area.height / asset.height);
        asset.setScale(ratio, ratio);
        return asset;
    };

    createMainMenu() {
        if (this._activeMenu) {
            this._activeMenu.toggleVisible();
        }
        var menu = this.add.group();

        var position = 1;

        menu.add(this.createMenuItem('New Game', position++, Styles.menu.menu_button, this.newGame.bind(this)));
        // if (this.game.saveData) this.mainMenu.add(this.createMenuItem('Continue', position++, MENU_BUTTON_STYLE, soundset, this.continueGame.bind(this)));
        menu.add(this.createMenuItem('Skirmish', position++, Styles.menu.menu_button, this.createSkirmishMenu.bind(this)));
        menu.add(this.createMenuItem('Settings', position++, Styles.menu.menu_button, this.createSettingsMenu.bind(this)));
        menu.add(this.createMenuItem('Credits', position++, Styles.menu.menu_button, this.createCreditsMenu.bind(this)));

        this._activeMenu = menu;
    };

    createSkirmishMenu() {
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

    createSettingsMenu() {
        if (this._activeMenu) {
            this._activeMenu.toggleVisible();
        }
        var menu = this.add.group();

        menu.add(this.createMenuItem('Game settings', 1, Styles.text.header));

        menu.add(this.createMenuItem('Music volume', 1.8, Styles.menu.submenu));

        var lessMusic = this.add.sprite(460, 360, 'arrows', 0);

        lessMusic.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, lessMusic.width, lessMusic.height), Phaser.Geom.Rectangle.Contains);

        lessMusic.on('pointerdown', e => {
            if (Settings.sound.musicVolume > 0) {
                Settings.sound.musicVolume = Math.round((Settings.sound.musicVolume - 0.1) * 10) / 10;
                musicLevel.text = this.displayVolume(Settings.sound.musicVolume);
                this.sound.volume = Settings.sound.musicVolume;
            }
        });

        menu.add(lessMusic);

        var moreMusic = this.add.sprite(700, 360, 'arrows', 1);

        moreMusic.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, moreMusic.width, moreMusic.height), Phaser.Geom.Rectangle.Contains);

        moreMusic.on('pointerdown', e => {
            if (Settings.sound.musicVolume < 1) {
                Settings.sound.musicVolume = Math.round((Settings.sound.musicVolume + 0.1) * 10) / 10;
                musicLevel.text = this.displayVolume(Settings.sound.musicVolume);
                this.sound.volume = Settings.sound.musicVolume;
            }
        });

        menu.add(moreMusic);

        var musicLevel = this.createMenuItem('', 2.4, Styles.menu.volume);
        musicLevel.text = this.displayVolume(Settings.sound.musicVolume);
        menu.add(musicLevel);

        menu.add(this.createMenuItem('Sound FX volume', 3.2, Styles.menu.submenu));
        var lessSfx = this.add.sprite(460, 470, 'arrows', 0);

        lessSfx.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, lessSfx.width, lessSfx.height), Phaser.Geom.Rectangle.Contains);

        lessSfx.on('pointerdown', e => {
            if (Settings.sound.sfxVolume > 0) {
                Settings.sound.sfxVolume = Math.round((Settings.sound.sfxVolume - 0.1) * 10) / 10;
                sfxLevel.text = this.displayVolume(Settings.sound.sfxVolume);
            }
        });

        menu.add(lessSfx);

        var moreSfx = this.add.sprite(700, 470, 'arrows', 1);

        moreSfx.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, moreSfx.width, moreSfx.height), Phaser.Geom.Rectangle.Contains);

        moreSfx.on('pointerdown', e => {
            if (Settings.sound.sfxVolume < 1) {
                Settings.sound.sfxVolume = Math.round((Settings.sound.sfxVolume + 0.1) * 10) / 10;
                sfxLevel.text = this.displayVolume(Settings.sound.sfxVolume);
            }
        });

        menu.add(moreSfx);

        var sfxLevel = this.createMenuItem('', 3.9, Styles.menu.volume);
        sfxLevel.text = this.displayVolume(Settings.sound.sfxVolume);
        menu.add(sfxLevel);

        menu.add(this.createMenuItem('Back', 5, Styles.text.backButton, this.createMainMenu.bind(this)));

        this._activeMenu = menu;
    };

    createCreditsMenu() {
        if (this._activeMenu) {
            this._activeMenu.toggleVisible();
        }
        var menu = this.add.group();

        menu.add(this.createMenuItem('Game programming:', 1, Styles.text.header));
        menu.add(this.createMenuItem('Ratko & Simun Cosic', 1.5, Styles.menu.author));
        menu.add(this.createMenuItem('Game artwork:', 2, Styles.text.header));
        menu.add(this.createMenuItem('Klara Cosic', 2.5, Styles.menu.author));
        menu.add(this.createMenuItem('Game story:', 3, Styles.text.header));
        menu.add(this.createMenuItem('Tvrtko Cosic', 3.5, Styles.menu.author));
        menu.add(this.createMenuItem('Special thanks to:', 4, Styles.text.header));
        menu.add(this.createMenuItem('Looperman for music tracks', 4.5, Styles.menu.author_small));
        menu.add(this.createMenuItem('Back', 5, Styles.text.backButton, this.createMainMenu.bind(this)));

        this._activeMenu = menu;
    }

    createMenuItem(text, position, style, action?) {
        style = style || Styles.menu.menu_button_pressed;

        var item = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 4 + position * 70, text, style);
        item.setOrigin(0.5, 0.5);

        item.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, item.width, item.height), Phaser.Geom.Rectangle.Contains);

        item.on('pointerdown', e => {
            if (this._soundset) this._soundset.play();
            if (action) {
                item.setStyle(Styles.menu.menu_button_pressed);
                action.call();
            }
        });

        // item.inputEnabled = true;
        // item.events.onInputDown.add(function (source, cursor) {
        //     if (soundset) soundset.play();
        //     if (action) source.setStyle(MENU_BUTTON_PRESSED_STYLE);
        // }, this);
        // item.events.onInputUp.add(function (source, cursor) {
        //     if (action) source.setStyle(style);
        //     if (action) action.call();
        // }, this);

        return item;
    };

    newGame() {
        this.scene.start('LoadingScene', { loadScene: 'NewGameScene', persistMusic: true });
    };
}
