import { Settings } from '../models/settings';
import { Assets } from '../models/assets';
import { ImageService } from '../services/image.service';
import { FONT_FAMILY, FONT_FAMILY_BLOCK } from '../models/styles';
import { ArrowsService } from '../services/arrows.service';
import { LoadingSceneOptions, BattleSceneOptions } from './scene-options';
import { SceneService } from '../services/scene.service';

const LOADING_TEXT_STYLE = { font: '20px ' + FONT_FAMILY, fill: '#D4915C' },
    PERCENT_TEXT_STYLE = { font: '18px ' + FONT_FAMILY_BLOCK, fill: '#EDEAD9' },
    ASSET_TEXT_STYLE = { font: '18px ' + FONT_FAMILY, fill: '#884825' };

export class LoadingScene extends Phaser.Scene {

    private _options: LoadingSceneOptions;

    private _loadingInitiated: boolean; // this indicates that the loading has been started (some assets are not loaded before)
    private _loadingFinished: boolean; // this is _loadingInitiated, together with the notion that the loading has finished completely

    private _music: Phaser.Sound.BaseSound;
    private _loadingText: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: "LoadingScene"
        });
    }

    init(data): void {
        this._options = data;
    }

    preload(): void {
        this._loadingInitiated = false;
        this._loadingFinished = false;

        this.cameras.main.fadeIn(500);
        this.cameras.main.setBackgroundColor(0x360602);

        var logo = ImageService.stretchAndFitImage('logo', this);
        logo.setScale(0.2);
        logo.setOrigin(0.5, 0.8);   
        
        if (!this._options.persistMusic) {
            this.sound.stopAll();
            if (Settings.sound.musicVolume > 0) {
                this._music = this.sound.add('interlude');
                this._music.play('', { loop: true });       
            }
        }

        this.setProgress();

        switch (this._options.loadScene) {
            case 'MainMenuScene':
                // background screen
                this.load.image('menu', 'assets/screens/menu.png');
                this.load.image('paper', 'assets/common/paper-soften.png');
                // ambient music
                this.load.audio('theme', Assets.sounds.theme);
                // common assets
                this.load.audio('click', Assets.sounds.effects.click);
                this.load.audio('closed', Assets.sounds.effects.closed);
                ArrowsService.init(this);
                break;

            case 'BattleScene':
                var options = this._options.sceneOptions as BattleSceneOptions;

                // GRAPHICS:

                // background screen
                this.load.image('battle_' + options.terrain, 'assets/screens/terrain-' + options.terrain + '.png');
                
                // mana bottles
                this.load.image('mana-bottle', 'assets/common/mana-bottle.png');

                // load characters in party
                options.playerParty.members.forEach(character => {
                    this.load.image('characters/' + character.name, 'assets/characters/' + character.name + '.png');
                    this.load.image('characters/' + character.name + '-head', 'assets/characters/' + character.name + '-head-s.png');
                });
                // load monsters in battle
                options.enemyParty.forEach(monster => {
                    this.load.image('monsters/' + monster.name, 'assets/monsters/' + monster.name + '.png');
                    this.load.image('monsters/' + monster.name + '-head', 'assets/monsters/' + monster.name + '-head.png');
                });

                // load card and effects
                this.load.image('card', 'assets/common/card.png');
                this.load.spritesheet('shards', 'assets/common/shards.png', { frameWidth: 30, frameHeight: 53 });

                // load weapons
                for (var weapon in Assets.weapons) {
                    this.load.image('weapons/' + weapon, 'assets/weapons/' + weapon + '.png');
                }

                // load specials
                this.load.image('special-card', 'assets/common/special-card-s.png');
                for (var special in Assets.specials) {
                    this.load.image('specials/' + special, 'assets/specials/' + special + '.png');
                }

                // SOUND EFFECTS:

                // ambient music
                this.load.audio('battle_' + options.terrain, Assets.sounds.terrain[options.terrain]);

                // round
                this.load.audio('gong', Assets.sounds.effects.gong);
                
                // weapons and specials for characters
                options.playerParty.members.forEach(character => {                   
                    this.load.audio(character.name, Assets.sounds.weapons[character.name]);
                    character.specials.forEach(special => {
                        this.load.audio(special.name, Assets.sounds.specials[special.name]);
                    });
                });

                // weapons and specials for monsters
                options.enemyParty.forEach(monster => {
                    this.load.audio(monster.weapon, Assets.sounds.weapons[monster.weapon]);
                    monster.specials.forEach(special => {
                        this.load.audio(special, Assets.sounds.specials[special]);
                    });
                });

                break;
            case 'MapScene':
                // the big map and small locations assets
                this.load.image('map', 'assets/screens/world-map-locations.png');
                this.load.spritesheet('locations', 'assets/common/locations-colors-soft.png', { frameWidth: 36, frameHeight: 36 });
                this.load.spritesheet('location-buttons', 'assets/common/location-buttons.png', { frameWidth: 68, frameHeight: 46 });
                this.load.image('party', 'assets/common/party-small.png');

                this.load.image('terrain-beach', 'assets/screens/terrain-beach-small.png');
                this.load.image('terrain-hills', 'assets/screens/terrain-beach-small.png');

                this.load.audio('ambient-arrival', Assets.sounds.ambient.arrival);
                this.load.audio('ambient-beach', Assets.sounds.ambient.beach);
                this.load.audio('ambient-swamp', Assets.sounds.ambient.swamp);
                this.load.audio('ambient-hills', Assets.sounds.ambient.hills);
                this.load.audio('ambient-forest', Assets.sounds.ambient.forest);
                this.load.audio('ambient-mine', Assets.sounds.ambient.mine);
                this.load.audio('ambient-city', Assets.sounds.ambient.city);

                this.load.audio('page', Assets.sounds.effects.page);
                this.load.audio('card', Assets.sounds.effects.card);
                this.load.audio('battle', Assets.sounds.effects.battle);
                break;

            case 'NewGameScene':
                // generally usable background ;)
                this.load.image('paper', 'assets/common/paper-soften.png');

                // load characters in party
                for (var character in Assets.characters) {
                    var player = Assets.characters[character];
                    this.load.image('characters/' + player.name, 'assets/characters/' + player.name + '.png');
                }

                // load weapons
                for (var weapon in Assets.weapons) {
                    this.load.image('weapons/' + weapon, 'assets/weapons/' + weapon + '.png');
                }

                // load specials
                this.load.image('special-card', 'assets/common/special-card-s.png');
                for (var special in Assets.specials) {
                    this.load.image('specials/' + special, 'assets/specials/' + special + '.png');
                }

                this.load.audio('click', Assets.sounds.effects.click);
                this.load.audio('closed', Assets.sounds.effects.closed);
                this.load.audio('card', Assets.sounds.effects.card);
                break;

            case 'BestiaryScene':
                break;

            case 'VictoryScene':
                this.load.image('victory', 'assets/screens/menu.png');
                this.load.image('defense', 'assets/common/defense.png');

                this.load.audio('victory', Assets.sounds.victory);
                this.load.audio('click', Assets.sounds.effects.click);
                break;
            case 'DefeatScene':
                this.load.image('defeat', 'assets/screens/menu.png');
                this.load.audio('defeat', Assets.sounds.defeat);
                break;
        }
    }

    create(): void {
    }

    update(): void {
        // fade in the music
        if (this.sound.volume < Settings.sound.musicVolume) {
            this.sound.volume += 0.005;
        }

        this.time.delayedCall(200, () => { // this must be a little bit postponed because of the check whether there are any not cached assets to load!
            // check if the loading is over or not started at all, and then prepare transition (with some sound loading sync)
            if (this._loadingFinished || !this._loadingInitiated) {
                SceneService.runLoadedScene(this, this._options);
            }
        }, null, this);
    }

    private setProgress() {
       
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;

        var progressBar = this.add.graphics();

        var boxWidth = 320, boxHeight = 50;
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x6D2401, 0.8);
        progressBox.fillRect(width / 2 - boxWidth / 2, height - 200 - boxHeight / 2 - 5, boxWidth, boxHeight);

        this._loadingText = this.make.text({x: width / 2, y: height - 250, text: '', style: LOADING_TEXT_STYLE});
        this._loadingText.setOrigin(0.5);

        var percentText = this.make.text({x: width / 2, y: height - 205, text: '', style: PERCENT_TEXT_STYLE});
        percentText.setOrigin(0.5);

        var assetText = this.make.text({ x: width / 2, y: height - 160, text: '', style: ASSET_TEXT_STYLE});
        assetText.setOrigin(0.5);

        var barWidth = 300;
        var barHeight = 30;

        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);

        // pass value to change the loading bar fill
        this.load.on("progress", (value: number) => {
            if (!this._loadingInitiated) {
                // initialize progress indicator
                this._loadingText.setText('Loading...');
                percentText.setText('0%');
                progressBox.fillRect(width / 2 - boxWidth / 2, height - 200 - boxHeight / 2 - 5, boxWidth, boxHeight);       
            }
            this._loadingInitiated = true; // this indicates that there are some freshly added assets to load

            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - barWidth / 2, height - 200 - barHeight / 2 - 5, barWidth * value, barHeight);
            percentText.setText(Math.round(value * 100) + '%');
        });

        this.load.on('fileprogress', file => {
            assetText.setText('Loading asset: ' + file.key);
        });

        // delete bar graphics, when loading complete
        this.load.on("complete", f => {
            progressBar.destroy();
            progressBox.destroy();
            percentText.destroy();
            assetText.destroy();
            this._loadingText.setText('Loading completed');
            this._loadingFinished = true;
        });
    }
}