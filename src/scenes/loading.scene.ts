import { Settings } from '../models/settings';
import { Assets } from '../models/assets';
import { ImageService } from '../services/image.service';
import { FONT_FAMILY, FONT_FAMILY_BLOCK } from '../models/styles';
import { ArrowsService } from '../services/arrows.service';

export class LoadingScene extends Phaser.Scene {

    private _loadScene: string;
    private _options: any;

    private _loadingFinished: boolean;
    private _music: Phaser.Sound.BaseSound;
    private _loadingText: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: "LoadingScene"
        });
    }

    init(data): void {
        this._loadScene = data.loadScene;
        this._options = data;
    }

    preload(): void {
        this._loadingFinished = false;
               
        this.cameras.main.fadeIn(500);
        this.cameras.main.setBackgroundColor(0x360602);

        var logo = ImageService.stretchAndFitImage('logo', this);
        logo.setScale(0.2);
        logo.setOrigin(0.5, 0.8);   
        // Settings.sound.musicVolume = 0;
        
        if (!this._options.persistMusic) {
            this.sound.stopAll();
            if (Settings.sound.musicVolume > 0) {
                this._music = this.sound.add('interlude');
                this._music.play('', { loop: true });       
            }
        }

        this.setProgress();

        switch (this._loadScene) {
            case 'MainMenuScene':
                if (this.textures.exists('menu')) {
                    this._loadingFinished = true;
                    break;
                }
                // background screen
                this.load.image('menu', 'assets/screens/menu.png');
                this.load.image('paper', 'assets/common/paper-soften.png');
                // ambient music
                this.load.audio('theme', 'assets/sound/loops/looperman-l-0626891-0132037-tuesday.wav');
                // common assets
                this.load.audio('click', 'assets/sound/effects/mechanical-clonk-1.mp3');
                this.load.audio('closed', 'assets/sound/effects/175662__simpsi__cant-open.wav');
                ArrowsService.init(this);
                break;
            case 'NewGameScene':
                break;
            case 'MapScene':
                break;
            case 'BattleScene':
                if (this.textures.exists('battle_grass')) {
                    this._loadingFinished = true;
                    break;
                }
                // GRAPHICS:

                // background screen
                // this.load.image('battle_' + this._options.terrain, 'assets/screens/battle_' + this._options.terrain + '_noir.png');
                this.load.image('battle_' + this._options.terrain, 'assets/screens/menu.png');
              
                // mana bottles
                this.load.image('mana-bottle', 'assets/common/mana-bottle.png');

                // load characters in party
                this._options.playerParty.forEach(character => {
                    this.load.image('characters/' + character.name, 'assets/characters/' + character.name + '.png');
                    this.load.image('characters/' + character.name + '-head', 'assets/characters/' + character.name + '-head-s.png');
                });
                // load monsters in battle
                this._options.enemyParty.forEach(monster => {
                    this.load.image('monsters/' + monster.name, 'assets/monsters/' + monster.name + '.png');
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
                if (this._options.terrain === 'grass') {
                    this.load.audio('battle_' + this._options.terrain, 'assets/sound/loops/looperman-l-0202721-0073828-anubis-face-2-face.wav');
                } else if (this._options.terrain === 'dirt') {
                    this.load.audio('battle_' + this._options.terrain, 'assets/sound/loops/looperman-l-0202721-0074107-anubis-titans-on-the-battlefield.wav');
                } else if (this._options.terrain === 'siege') {
                    this.load.audio('battle_' + this._options.terrain, 'assets/sound/loops/looperman-l-0202721-0107482-anubis-heavy-drums-04-groove.wav');
                }

                // round
                this.load.audio('gong', 'assets/sound/effects/Metal_Gong-Dianakc-109711828.mp3');
                // weapons for characters
                this.load.audio('revolvers', 'assets/sound/effects/weapons/213925__diboz__pistol-riccochet-s.wav');
                this.load.audio('steam_pipe', 'assets/sound/effects/weapons/175180__yottasounds__clank-002.wav');
                this.load.audio('explosive_bomb', 'assets/sound/effects/weapons/155235__zangrutz__bomb-small.wav');
                this.load.audio('musket', 'assets/sound/effects/weapons/128978__aaronsiler__aaronsiler-musket-2.wav');
                this.load.audio('deck_of_cards', 'assets/sound/effects/weapons/434472__dersuperanton__taking-card.wav');
                this.load.audio('dagger', 'assets/sound/effects/weapons/sword-clang5.wav');
                // weapons for monsters
                this.load.audio('strings', 'assets/sound/effects/weapons/336859__borque__zoiing-display-wires.wav');
                this.load.audio('sceptre', 'assets/sound/effects/weapons/Swords_Collide.mp3');
                this.load.audio('poison', 'assets/sound/effects/weapons/270409__littlerobotsoundfactory__spell-00.wav');
                // SPECIALS:
                this.load.audio('heal', 'assets/sound/effects/specials/218561__phr4kture__last-scar-healed.wav');
                // gunslinger
                this.load.audio('ricochet', 'assets/sound/effects/specials/315858__benjaminharveydesign__gunshot-ricochet.wav');
                this.load.audio('bullseye', 'assets/sound/effects/specials/351777__kennysvoice__sniper-rifle-m24-sfx-edit.wav');
                this.load.audio('disarm', 'assets/sound/effects/specials/disarm-with-pistol.wav');
                this.load.audio('playing_dirty', 'assets/sound/effects/specials/434473__dersuperanton__sand-rattle.wav');
                // automaton
                this.load.audio('break_defense', 'assets/sound/effects/specials/423010__ogsoundfx__monster-bite-on-armor.wav');
                this.load.audio('burning_flames', 'assets/sound/effects/specials/338685__natemarler__flame-thrower-varying-power.wav');
                this.load.audio('brass_shield', 'assets/sound/effects/specials/352187__inspectorj__snapping-wooden-fence-i.wav');
                this.load.audio('shake_ground', 'assets/sound/effects/specials/399656__bajko__sfx-thunder-blast.wav');
                // alchemist
                this.load.audio('poisonous_gas', 'assets/sound/effects/specials/202629__alexmaxlle__gas.wav');
                this.load.audio('catalitic_bomb', 'assets/sound/effects/specials/129281__sanitysprime__grende-with-falling-earth.wav');
                this.load.audio('throw_acid', 'assets/sound/effects/specials/270409__littlerobotsoundfactory__spell-00.wav');
                // musketeer
                this.load.audio('precision_shot', 'assets/sound/effects/specials/393651__eflexthesounddesigner__sniper-rifle-shot-gun-shot.wav');
                this.load.audio('bayonet_charge', 'assets/sound/effects/specials/431757__schoggimousse__musket-massacre.wav');
                this.load.audio('battle_cry', 'assets/sound/effects/specials/165492__chripei__victory-cry-reverb-1.wav');
                // illusionist
                this.load.audio('ace', 'assets/sound/effects/specials/121894__stephensaldanha__magical-effect.wav');
                this.load.audio('blind', 'assets/sound/effects/specials/360830__tec-studios__fantasy-sfx-003.wav');
                this.load.audio('performance', 'assets/sound/effects/specials/12896__harri__circus-short.wav');
                this.load.audio('magic_trick', 'assets/sound/effects/specials/179055__robinhood76__04148-a-circus-jump-with-clarinet.wav');
                // assasin
                this.load.audio('backstab', 'assets/sound/effects/specials/435238__aris621__nasty-knife-stab.wav');
                this.load.audio('ripping_cut', 'assets/sound/effects/specials/175953__freefire66__dagger-drawn2.wav');
               
                break;
            case 'VictoryScene':
                this.load.image('victory', 'assets/screens/menu.png');
                this.load.audio('victory', 'assets/sound/loops/looperman-l-0173301-0131687-eepic.wav');
                break;
            case 'DefeatScene':
                this.load.image('defeat', 'assets/screens/menu.png');
                this.load.audio('defeat', 'assets/sound/loops/looperman-l-0202721-0070581-anubis-anubis.wav');
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
            //this.time.delayedCall(2000, () => {
                this.scene.start(this._loadScene, this._options);
            //}, null, this);
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