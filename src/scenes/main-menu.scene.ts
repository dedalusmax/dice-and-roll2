import { Settings } from "../models/settings";
import { ImageService } from "../services/image.service";
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
        this._options = data;
    }

    preload(): void {
        // this.loadGameData();
    }

    create(): void {
        this.cameras.main.setBackgroundColor(0xFFFFFF);

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
        var menu = ImageService.stretchAndFitImage('menu', this);
        var logo = ImageService.stretchAndFitImage('logo', this);
        logo.setScale(0.12);
        logo.setOrigin(1, 1.4);

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

        this.scene.start('LoadingScene', { loadScene: 'BattleScene', persistMusic: false,
            terrain: 'grass', skirmish: true, 
            playerParty: [ Assets.characters.gunslinger, Assets.characters.alchemist, Assets.characters.assasin ],
            enemyParty: [ Assets.monsters.puppeteer, Assets.monsters.harlequin, Assets.monsters.plague_doctor ]
        });

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

    createSettingsMenu() {
        if (this._activeMenu) {
            this._activeMenu.toggleVisible();
        }
        var menu = this.add.group();

        menu.add(this.createMenuItem('Game settings:', -1.2, Styles.menu.header));

        menu.add(this.createMenuItem('Music volume', -0.4, Styles.menu.submenu));

        var musicLevel = this.createMenuItem('', 0.2, Styles.menu.volume);
        musicLevel.setText(this.displayVolume(Settings.sound.musicVolume));
        menu.add(musicLevel);

        var lessMusic = this.add.sprite(musicLevel.x - musicLevel.width - 10, musicLevel.y + 5, 'arrows', 0);
        lessMusic.setScale(0.8);
        lessMusic.setInteractive();
        lessMusic.on('pointerdown', e => {
            if (Settings.sound.musicVolume > 0) {
                Settings.sound.musicVolume = Math.round((Settings.sound.musicVolume - 0.1) * 10) / 10;
                musicLevel.setText(this.displayVolume(Settings.sound.musicVolume));
                this.sound.volume = Settings.sound.musicVolume;
            }
        });
        menu.add(lessMusic);

        var moreMusic = this.add.sprite(musicLevel.x + musicLevel.width + 10, musicLevel.y + 5, 'arrows', 1);
        moreMusic.setScale(0.8);
        moreMusic.setInteractive();
        moreMusic.on('pointerdown', e => {
            if (Settings.sound.musicVolume < 1) {
                Settings.sound.musicVolume = Math.round((Settings.sound.musicVolume + 0.1) * 10) / 10;
                musicLevel.setText(this.displayVolume(Settings.sound.musicVolume));
                this.sound.volume = Settings.sound.musicVolume;
            }
        });
        menu.add(moreMusic);

        menu.add(this.createMenuItem('Sound FX volume', 1.2, Styles.menu.submenu));

        var sfxLevel = this.createMenuItem('', 1.8, Styles.menu.volume);
        sfxLevel.setText(this.displayVolume(Settings.sound.sfxVolume));
        menu.add(sfxLevel);

        var lessSfx = this.add.sprite(sfxLevel.x - sfxLevel.width - 10, sfxLevel.y + 5, 'arrows', 0);
        lessSfx.setScale(0.8);
        lessSfx.setInteractive();
        lessSfx.on('pointerdown', e => {
            if (Settings.sound.sfxVolume > 0) {
                Settings.sound.sfxVolume = Math.round((Settings.sound.sfxVolume - 0.1) * 10) / 10;
                sfxLevel.setText(this.displayVolume(Settings.sound.sfxVolume));
            }
        });
        menu.add(lessSfx);

        var moreSfx = this.add.sprite(sfxLevel.x + sfxLevel.width + 10, sfxLevel.y + 5, 'arrows', 1);
        moreSfx.setScale(0.8);
        moreSfx.setInteractive();
        moreSfx.on('pointerdown', e => {
            if (Settings.sound.sfxVolume < 1) {
                Settings.sound.sfxVolume = Math.round((Settings.sound.sfxVolume + 0.1) * 10) / 10;
                sfxLevel.setText(this.displayVolume(Settings.sound.sfxVolume));
            }
        });
        menu.add(moreSfx);

        menu.add(this.createMenuItem('Back', 4, Styles.text.backButton, this.createMainMenu.bind(this)));

        this._activeMenu = menu;
    };

    createCreditsMenu() {
        if (this._activeMenu) {
            this._activeMenu.toggleVisible();
        }
        var menu = this.add.group();

        menu.add(this.createMenuItem('Game programming:', -1.2, Styles.menu.header));
        menu.add(this.createMenuItem('Ratko & Šimun Ćosić', -0.7, Styles.menu.author));
        menu.add(this.createMenuItem('Game artwork:', -0.1, Styles.menu.header));
        menu.add(this.createMenuItem('Klara Ćosić', 0.4, Styles.menu.author));
        menu.add(this.createMenuItem('Game story:', 1, Styles.menu.header));
        menu.add(this.createMenuItem('Tvrtko Ćosić', 1.5, Styles.menu.author));
        menu.add(this.createMenuItem('Special thanks to:', 2.1, Styles.menu.header));
        menu.add(this.createMenuItem('Looperman for music tracks', 2.4, Styles.menu.author_small));
        menu.add(this.createMenuItem('Back', 4, Styles.text.backButton, this.createMainMenu.bind(this)));

        this._activeMenu = menu;
    }

    createMenuItem(text, position, style, action?) {
        style = style || Styles.menu.menu_button_pressed;

        var item = this.add.text(this.cameras.main.width / 2 + 120, this.cameras.main.height / 4 + position * 70, text, style);
        item.setOrigin(0.5, 0.5);

        item.setInteractive();

        item.on('pointerdown', e => {
            if (this._soundset) this._soundset.play();
            if (action) {
                item.setStyle(Styles.menu.menu_button_pressed);
                action.call();
            }
        });

        return item;
    };

    newGame() {
        this.scene.start('LoadingScene', { loadScene: 'NewGameScene', persistMusic: true });
    };
}
