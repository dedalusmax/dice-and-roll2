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
        // Settings.sound.musicVolume = 0;
        
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
                this.load.audio('theme', 'assets/sound/loops/looperman-l-0626891-0132037-tuesday.wav');
                // common assets
                this.load.audio('click', 'assets/sound/effects/mechanical-clonk-1.mp3');
                this.load.audio('closed', 'assets/sound/effects/175662__simpsi__cant-open.wav');
                ArrowsService.init(this);
                break;

            case 'BattleScene':
                if (this.textures.exists('mana-bottle')) {
                    this._loadingFinished = true;
                    break;
                }

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
                if (options.terrain === 'beach') {
                    this.load.audio('battle_' + options.terrain, 'assets/sound/loops/looperman-l-0202721-0073828-anubis-face-2-face.wav');
                } else if (options.terrain === 'dirt') {
                    this.load.audio('battle_' + options.terrain, 'assets/sound/loops/looperman-l-0202721-0074107-anubis-titans-on-the-battlefield.wav');
                } else if (options.terrain === 'siege') {
                    this.load.audio('battle_' + options.terrain, 'assets/sound/loops/looperman-l-0202721-0107482-anubis-heavy-drums-04-groove.wav');
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
                this.load.audio('claws', 'assets/sound/effects/weapons/435238__aris621__nasty-knife-stab.wav');
                this.load.audio('cutlass', 'assets/sound/effects/weapons/sword-clang.mp3');
                this.load.audio('arquebus', 'assets/sound/effects/weapons/128978__aaronsiler__aaronsiler-musket-2.wav');
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
                this.load.audio('disappear', 'assets/sound/effects/specials/193810__geoneo0__four-voices-whispering-3.wav');
                this.load.audio('backstab', 'assets/sound/effects/specials/435238__aris621__nasty-knife-stab.wav');
                this.load.audio('reaping_cut', 'assets/sound/effects/specials/175953__freefire66__dagger-drawn2.wav');
                this.load.audio('throwing_knives', 'assets/sound/effects/specials/SwooshCombo1.wav');
                // specials for monsters
                this.load.audio('enchanting_song', 'assets/sound/effects/specials/345504__cormi__mermaids.wav');
                this.load.audio('tidal_wave', 'assets/sound/effects/specials/412308__straget__big-waves-hit-land.wav');
                break;
            case 'VictoryScene':
                this.load.image('victory', 'assets/screens/menu.png');
                this.load.audio('victory', 'assets/sound/loops/looperman-l-0173301-0131687-eepic.wav');
                break;
            case 'DefeatScene':
                this.load.image('defeat', 'assets/screens/menu.png');
                this.load.audio('defeat', 'assets/sound/loops/looperman-l-0202721-0070581-anubis-anubis.wav');
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

                this.load.audio('ambient-arrival', 'assets/sound/ambient/331435__codeine__storm-at-sea.wav');
                this.load.audio('ambient-beach', 'assets/sound/ambient/ocean-wave-1.mp3');
                this.load.audio('ambient-swamp', 'assets/sound/ambient/lake-waves-01.mp3');
                this.load.audio('ambient-hills', 'assets/sound/ambient/405561__inspectorj__wind-realistic-a.wav');
                this.load.audio('ambient-forest', 'assets/sound/ambient/385279__bajko__sfx-amb-forest-spring-afternoon-02.wav');
                this.load.audio('ambient-mine', 'assets/sound/ambient/89448__bkamuse__dangerous-mine-shaft.wav');
                this.load.audio('ambient-city', 'assets/sound/ambient/75076__nupton__abandoned.wav');

                this.load.audio('page', 'assets/sound/effects/page-flip-01a.mp3');
                this.load.audio('card', 'assets/sound/effects/434472__dersuperanton__taking-card.wav');
                this.load.audio('battle', 'assets/sound/effects/347981__madmanmusic__battle-preparations.wav');
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

                this.load.audio('click', 'assets/sound/effects/mechanical-clonk-1.mp3');
                this.load.audio('card', 'assets/sound/effects/434472__dersuperanton__taking-card.wav');
                this.load.audio('closed', 'assets/sound/effects/175662__simpsi__cant-open.wav');
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