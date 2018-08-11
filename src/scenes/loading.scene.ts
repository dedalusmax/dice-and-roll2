import { Settings } from '../models/settings';
import { Soundsets } from '../models/soundsets';
import { Assets } from '../models/assets';
import { ImageService } from '../services/image.service';

export class LoadingScene extends Phaser.Scene {

    private _loadScene: string;
    private _options: any;

    private _loadingFinished: boolean;
    private _music: Phaser.Sound.BaseSound;

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
                // background screen
                this.load.image('menu', 'assets/screens/menu.png');
                // ambient music
                this.load.audio('theme', [
                    'assets/sound/loops/looperman-l-0208341-0069234-drmistersir-4moe-xxgrave-robbers.ogg',
                    'assets/sound/loops/looperman-l-0208341-0069234-drmistersir-4moe-xxgrave-robbers.mp3'
                ]);
                // common assets
                var arrowsSheet: Phaser.Loader.FileTypes.ImageFrameConfig = { frameWidth: 80, frameHeight: 80 };
                // arrowsSheet.frameWidth = 80;
                // arrowsSheet.frameHeight = 80;
                this.load.spritesheet('arrows', 'assets/common/arrows.png', arrowsSheet);
                // load sound effects
                this.load.audio('gong', ['assets/sound/effects/Metal_Gong-Dianakc-109711828.mp3']);
                // sword audio set:
                this.load.audio('sword', ['assets/sound/effects/sword-clang.ogg', 'assets/sound/effects/sword-clang.mp3']);
                this.load.audio('sword2', ['assets/sound/effects/sword-clang2.ogg', 'assets/sound/effects/sword-clang2.mp3']);
                this.load.audio('sword3', ['assets/sound/effects/sword-clang3.ogg', 'assets/sound/effects/sword-clang3.mp3']);
                this.load.audio('sword4', ['assets/sound/effects/sword-clang4.ogg', 'assets/sound/effects/sword-clang4.mp3']);
                this.load.audio('sword5', ['assets/sound/effects/sword-clang5.ogg', 'assets/sound/effects/sword-clang5.mp3']);
                break;
            case 'NewGameScene':
                break;
            case 'MapScene':
                break;
            case 'BattleScene':
                // background screen
                this.load.image('battle_' + this._options.terrain, 'assets/screens/battle_' + this._options.terrain + '_noir.png');
                // ambient music
                if (this._options.terrain === 'grass') {
                    this.load.audio('battle_' + this._options.terrain,
                        ['assets/sound/loops/looperman-l-0202721-0075453-anubis-tribal-escape-02.ogg',
                            'assets/sound/loops/looperman-l-0202721-0075453-anubis-tribal-escape-02.mp3']);
                } else if (this._options.terrain === 'dirt') {
                    this.load.audio('battle_' + this._options.terrain,
                        ['assets/sound/loops/looperman-l-0202721-0074960-anubis-tribal-percussion-07.ogg',
                            'assets/sound/loops/looperman-l-0202721-0074960-anubis-tribal-percussion-07.mp3']);
                } else if (this._options.terrain === 'siege') {
                    this.load.audio('battle_' + this._options.terrain,
                        ['assets/sound/loops/looperman-l-0202721-0074435-anubis-tribal-percussion-01.ogg',
                            'assets/sound/loops/looperman-l-0202721-0074435-anubis-tribal-percussion-01.mp3']);
                }
                // load characters in party
                this._options.playerParty.forEach(character => {
                    this.load.image('characters/' + character.name, 'assets/characters/' + character.name + '.png');
                });
                // load monsters in battle
                this._options.enemyParty.forEach(monster => {
                    this.load.image('monsters/' + monster.name, 'assets/monsters/' + monster.name + '.png');
                });
                // sound effects
                this.load.audio('hit', ['assets/sound/effects/Swoosh02.mp3']);
                this.load.audio('multi-hit', ['assets/sound/effects/SwooshCombo1.mp3']);
                this.load.audio('multi-hit2', ['assets/sound/effects/SwooshCombo2.mp3']);
                this.load.audio('click', ['assets/sound/effects/mechanical-clonk-1.mp3']);
                this.load.audio('click2', ['assets/sound/effects/smack-1.mp3']);
                // swing audio set:
                this.load.audio('swing', ['assets/sound/effects/swing.ogg', 'assets/sound/effects/swing.mp3']);
                this.load.audio('swing2', ['assets/sound/effects/swing2.ogg', 'assets/sound/effects/swing2.mp3']);
                this.load.audio('swing3', ['assets/sound/effects/swing3.ogg', 'assets/sound/effects/swing3.mp3']);
                this.load.audio('swoosh', ['assets/sound/effects/Swoosh02.ogg', 'assets/sound/effects/Swoosh02.mp3']);
                // select audio set:
                this.load.audio('swords', ['assets/sound/effects/Swords_Collide.ogg', 'assets/sound/effects/Swords_Collide.mp3']);
                // load specials
                for (var special in Assets.specials) {
                    this.load.image('specials/' + special, 'assets/specials/' + special + '_s.png');
                }
                // TODO: assort these images more efficiently !!!

                this.load.image('cards/back', 'assets/cards/card-back.png');
                this.load.image('cards/front', 'assets/cards/card-front.png');
                this.load.image('cards/faction-1', 'assets/cards/card-faction-1.png');
                this.load.image('cards/faction-2', 'assets/cards/card-faction-2.png');
                this.load.image('cards/emblem-axe', 'assets/cards/card-axe.png');
                this.load.image('cards/emblem-mace', 'assets/cards/card-mace.png');
                this.load.image('cards/emblem-potion', 'assets/cards/card-potion.png');
                this.load.image('cards/emblem-bow', 'assets/cards/card-bow.png');
                this.load.image('cards/emblem-shield', 'assets/cards/card-shield.png');
                this.load.image('cards/emblem-sword', 'assets/cards/card-sword.png');
                this.load.image('cards/emblem-claw', 'assets/cards/card-claw.png');
                this.load.image('cards/emblem-spear', 'assets/cards/card-spear.png');
                this.load.image('cards/emblem-missile', 'assets/cards/card-missile.png');

                break;
        }
    }

    create(): void {
        // create all soundsets for the game
        var soundsets = new Soundsets(this);
        soundsets.create('sword', ['sword', 'sword2', 'sword3', 'sword4', 'sword5']);
        soundsets.create('page', ['page', 'page2', 'page3', 'page4']);
        soundsets.create('select', ['swords']);
        soundsets.create('swing', ['swing', 'swing2', 'swing3', 'swoosh']);                
    }

    update(): void {
        // fade in the music
        if (this.sound.volume < Settings.sound.musicVolume) {
            this.sound.volume += 0.005;
        }

        // check if the loading is over and prepare transition (with some sound loading sync)
        if (this._loadingFinished) {
            this.scene.start(this._loadScene, this._options);
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

        var loadingText = this.make.text({
            x: width / 2,
            y: height - 250,
            text: 'Loading...',
            style: {
                font: '20px Berkshire Swash',
                fill: '#D4915C'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        var percentText = this.make.text({
            x: width / 2,
            y: height - 205,
            text: '0%',
            style: {
                font: '18px Berkshire Swash',
                fill: '#EDEAD9'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        var assetText = this.make.text({
            x: width / 2,
            y: height - 160,
            text: '',
            style: {
                font: '18px Berkshire Swash',
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
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
            this._loadingFinished = true;
        });
    }
}