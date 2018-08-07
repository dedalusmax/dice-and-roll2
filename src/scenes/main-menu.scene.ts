import { Settings } from "../settings";
import { ImageService } from "../services/image.service";
import { Input, Scene, Game } from "phaser";

const AUTHOR_STYLE = { font: '32px Berkshire Swash', fill: '#FF6A00', align: 'center' };
const MENU_BUTTON_STYLE = { font: '72px Berkshire Swash', fill: '#990000', align: 'center', stroke: '#000000', strokeThickness: 2 };
const SUBMENU_BUTTON_STYLE = { font: '48px Berkshire Swash', fill: '#990000', align: 'center', stroke: '#000000', strokeThickness: 2 };
const MENU_BUTTON_PRESSED_STYLE = { font: '56px Berkshire Swash', fill: '#FF6A00', align: 'center', stroke: '#000000', strokeThickness: 2 };

export class Sound {

    constructor(private key: string, private sounds: Array<any>, scene: Phaser.Scene) {

        this.sounds = [];
        sounds.forEach(sound => {
            this.sounds.push(scene.sound.add(sound));
        });
    };

    play() {
        var randomSound = Phaser.Math.RND.pick(this.sounds);
        randomSound.play('', 0, Settings.sound.sfxVolume);
    };
}

export class MainMenuScene extends Phaser.Scene {

    private _options: any;
    private _music: Phaser.Sound.BaseSound;

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

        // create all soundsets for the game
        var soundsets = {};
        this.createSoundset(soundsets, 'sword', ['sword', 'sword2', 'sword3', 'sword4', 'sword5']);
        this.createSoundset(soundsets, 'page', ['page', 'page2', 'page3', 'page4']);
        this.createSoundset(soundsets, 'select', ['swords']);
        this.createSoundset(soundsets, 'swing', ['swing', 'swing2', 'swing3', 'swoosh']);
        
        var mainMenu = this.createMainMenu(soundsets['sword']);

        mainMenu.toggleVisible();
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

    createTextButton(game, text, x, y, style, soundset, action) {
        var item = this.add.text(x, y, text, style);
        item.setOrigin(0.5, 0.5);

        item.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, item.width, item.height), Phaser.Geom.Rectangle.Contains);

        item.on('pointerdown', function (source,pointer) {
            if (soundset) soundset.play();
            source.setStyle({ font: style.font, fill: '#DDDD00', align: style.align });
        });

        // this.input.setHitArea(item, null, function (source, cursor) {
        //     if (soundset) soundset.play();
        //     source.setStyle({ font: style.font, fill: '#DDDD00', align: style.align });
        // });
        // item.onInputUp.add(function (source, cursor) {
        //     source.setStyle({ font: style.font, fill: '#FF6A00', align: style.align });
        //     if (action) action.call();
        // });
        return item;
    };

    createMainMenu(soundset): Phaser.GameObjects.Group {
        var menu = this.add.group();

        var position = 1;

        menu.add(this.createMenuItem('New Game', position++, MENU_BUTTON_STYLE, soundset, this.newGame.bind(this)));
        // if (this.game.saveData) this.mainMenu.add(this.createMenuItem('Continue', position++, MENU_BUTTON_STYLE, soundset, this.continueGame.bind(this)));
        // menu.add(this.createMenuItem('Skirmish', position++, MENU_BUTTON_STYLE, soundset, this.showSkirmish.bind(this)));
        // menu.add(this.createMenuItem('Settings', position++, MENU_BUTTON_STYLE, soundset, this.showSettings.bind(this)));
        // menu.add(this.createMenuItem('Credits', position++, MENU_BUTTON_STYLE, soundset, this.showCredits.bind(this)));

        menu.toggleVisible();

        return menu;
    };

    createMenuItem(text, position, style, soundset, action) {
        style = style || MENU_BUTTON_PRESSED_STYLE;

        var item = this.add.text(this.cameras.main.width / 2 + 40, 225 + position * 70, text, style);
        item.setOrigin(0.5, 0.5);

        item.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, item.width, item.height), Phaser.Geom.Rectangle.Contains);

        item.on('pointerdown', function (source, pointer) {
            if (soundset) soundset.play();
            if (action) source.setStyle(MENU_BUTTON_PRESSED_STYLE);
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

    createSoundset(collection, key, sounds) {
       collection[key] = new Sound(key, sounds, this);
    };

    newGame() {
        this.scene.start('LoadingScene', { loadScene: 'NewGameScene', persistMusic: true });
    };
}
