import { Settings } from "../models/settings";
import { ImageService } from "../services/image.service";
import { Assets } from "../models/assets";
import { Styles } from "../models/styles";
import { ArrowsService, ArrowOrientation } from "../services/arrows.service";

export class MainMenuScene extends Phaser.Scene {

    private _options: any;
    private _music: Phaser.Sound.BaseSound;
    private _paper: Phaser.GameObjects.Sprite;
    private _activeMenu: Phaser.GameObjects.Group;

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
        this.cameras.main.fadeIn(1000);

        this.cameras.main.setBackgroundColor(0xFFFFFF);

        var music;
        if (Settings.sound.musicVolume > 0) {
            this.sound.stopAll();
            this._music = this.sound.add('theme');
            music = this._music.play('', { loop: true });
        }

        // set screen background
        var menu = ImageService.stretchAndFitImage('menu', this);
        var logo = ImageService.stretchAndFitImage('logo', this);
        logo.setScale(0.12);
        logo.setOrigin(1, 1.4);

        this._paper = this.add.sprite(this.cameras.main.width * 0.7, this.cameras.main.height * 0.5, 'paper');
        this._paper.setScale(0.5, 0.7);

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
            playerParty: [ Assets.characters.illusionist ],
            enemyParty: [ Assets.monsters.puppeteer], //, Assets.monsters.harlequin, Assets.monsters.plague_doctor ],
            playerMana: 100, enemyMana: 80
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

        menu.add(this.createMenuItem('Game settings:', 0.2, Styles.menu.header));

        menu.add(this.createMenuItem('Music volume', 1, Styles.menu.submenu));

        var musicLevel = this.createMenuItem('', 1.8, Styles.menu.volume);
        musicLevel.setText(this.displayVolume(Settings.sound.musicVolume));
        menu.add(musicLevel);

        var lessMusic = ArrowsService.createArrow(this, musicLevel.x - musicLevel.width - 10, musicLevel.y + 5, ArrowOrientation.left, () => {
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

        var moreMusic = ArrowsService.createArrow(this, musicLevel.x + musicLevel.width + 10, musicLevel.y + 5, ArrowOrientation.right, () => {
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

        menu.add(this.createMenuItem('Sound FX volume', 3, Styles.menu.submenu));

        var sfxLevel = this.createMenuItem('', 3.8, Styles.menu.volume);
        sfxLevel.setText(this.displayVolume(Settings.sound.sfxVolume));
        menu.add(sfxLevel);

        var lessSfx = ArrowsService.createArrow(this, sfxLevel.x - sfxLevel.width - 10, sfxLevel.y + 5, ArrowOrientation.left, () => {
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

        var moreSfx = ArrowsService.createArrow(this, sfxLevel.x + sfxLevel.width + 10, sfxLevel.y + 5, ArrowOrientation.right, () => {
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

        menu.add(this.createMenuItem('Back', 5.4, Styles.text.backButton, this.createMainMenu.bind(this)));

        this._activeMenu = menu;
    };

    createCreditsMenu() {
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

    createMenuItem(text, position, style, action?) {
        style = style || Styles.menu.menu_button_pressed;

        var x = this._paper.x;
        var y = 50 + position * 70;
        var item = this.add.text(x, y, text, style);
        item.setOrigin(0.5, 0.5);

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

    newGame() {
        this.scene.start('LoadingScene', { loadScene: 'NewGameScene', persistMusic: true });
    };
}
