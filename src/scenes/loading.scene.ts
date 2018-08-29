import { Settings } from '../models/settings';
import { Assets } from '../models/assets';
import { ImageService } from '../services/image.service';
import { FONT_FAMILY, FONT_FAMILY_BLOCK } from '../models/styles';
import { ArrowsService } from '../services/arrows.service';
import { LoadingSceneOptions, BattleSceneOptions } from './scene-options';
import { SceneService } from '../services/scene.service';

export class LoadingScene extends Phaser.Scene {

    private _options: LoadingSceneOptions;

    private _loadingFinished: boolean;
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
                if (this.textures.exists('menu')) {
                    this._loadingFinished = true;
                    break;
                }
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
                // if (this.textures.exists('mana-bottle')) {
                //     this._loadingFinished = true;
                //     break;
                // }

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
                    this.load.audio(character.weapon.name, Assets.sounds.weapons[character.weapon.name]);
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
            case 'VictoryScene':
                this.load.image('victory', 'assets/screens/menu.png');
                this.load.audio('victory', Assets.sounds.victory);
                break;
            case 'DefeatScene':
                this.load.image('defeat', 'assets/screens/menu.png');
                this.load.audio('defeat', Assets.sounds.defeat);
                break;
            case 'MapScene':
                if (this.textures.exists('map')) {
                    this._loadingFinished = true;
                    break;
                }

                this.load.image('map', 'assets/screens/world-map-locations.png');

                this.load.spritesheet('locations', 'assets/common/locations-colors-soft.png', { frameWidth: 36, frameHeight: 36 });
                this.load.spritesheet('location-buttons', 'assets/common/location-buttons.png', { frameWidth: 68, frameHeight: 46 });
                this.load.image('party', 'assets/common/party-small.png');

                this.load.image('terrain-beach', 'assets/screens/terrain-beach-small.png');

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
                if (this.textures.exists('special-card')) {
                    this._loadingFinished = true;
                    break;
                }
                
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
                this._loadingFinished = true;
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

        // check if the loading is over and prepare transition (with some sound loading sync)
        if (this._loadingFinished) {
            this._loadingText.setText('Loading complete');
                SceneService.runLoadedScene(this, this._options);
        }
    }

    private setProgress() {

        var width = this.cameras.main.width;
        var height = this.cameras.main.height;

        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x6D2401, 0.8);
        var boxWidth = 320;
        var boxHeight = 50;
        progressBox.fillRect(width / 2 - boxWidth / 2, height - 200 - boxHeight / 2 - 5, boxWidth, boxHeight);

        this._loadingText = this.make.text({
            x: width / 2,
            y: height - 250,
            text: 'Loading...',
            style: {
                font: '20px ' + FONT_FAMILY,
                fill: '#D4915C'
            }
        });
        this._loadingText.setOrigin(0.5, 0.5);

        var percentText = this.make.text({
            x: width / 2,
            y: height - 205,
            text: '0%',
            style: {
                font: '18px ' + FONT_FAMILY_BLOCK,
                fill: '#EDEAD9'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        var assetText = this.make.text({
            x: width / 2,
            y: height - 160,
            text: '',
            style: {
                font: '18px ' + FONT_FAMILY,
                fill: '#884825'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        var barWidth = 300;
        var barHeight = 30;

        // pass value to change the loading bar fill
        this.load.on("progress", (value: number) => {
            // console.log(value);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - barWidth / 2, height - 200 - barHeight / 2 - 5, barWidth * value, barHeight);
            percentText.setText(Math.round(value * 100) + '%');
            // for (var i = 0; i < 400000000; i++) {}
        });

        this.load.on('fileprogress', file => {
            // console.log(file.src);
            assetText.setText('Loading asset: ' + file.key);
        });

        // delete bar graphics, when loading complete
        this.load.on("complete", f => {
            progressBar.destroy();
            progressBox.destroy();
            percentText.destroy();
            assetText.destroy();
            this._loadingFinished = true;
        });
    }
}