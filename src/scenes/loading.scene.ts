import { ImageService } from '../services/image.service';
import { Settings } from '../models/settings';
import { Soundsets } from '../models/soundsets';

const PROGRESSBAR_EMPTY = 0x5dae47;
const PROGRESSBAR_FILL = 0xfff6d3;

export class LoadingScene extends Phaser.Scene {

    private _loadScene: string;
    private _options: any;

    private _music: Phaser.Sound.BaseSound;

    constructor() {
        super({
            key: "LoadingScene"
        });
    }

    init(data): void {
        this._loadScene = data.loadScene;
        this._options = data.options || {};
    }

    preload(): void {
        // ImageService.stretchAndFitImage('preloader', this);
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
                this.load.image('menu', 'assets/screens/menu_noir.png');
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
        if (this._music.isPlaying ||  this.cache.audio.exists('interlude')) {
            this.scene.start(this._loadScene, this._options);
        }
    }

    private setProgress() {

        var width = this.cameras.main.width;
        var height = this.cameras.main.height;

        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        var boxWidth = 320;
        var boxHeight = 50;
        progressBox.fillRect(width / 2 - boxWidth / 2, height / 2 - boxHeight / 2 - 5, boxWidth, boxHeight);

        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px Berkshire Swash',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px Berkshire Swash',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px Berkshire Swash',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        var barWidth = 300;
        var barHeight = 30;

        // pass value to change the loading bar fill
        this.load.on("progress", function (value: number) {
            console.log(value);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - barWidth / 2, height / 2 - barHeight / 2 - 5, barWidth * value, barHeight);
            percentText.setText(Math.round(value * 100) + '%');
            // for (var i = 0; i < 400000000; i++) {}
        }, this);

        this.load.on('fileprogress', function (file) {
            console.log(file.src);
            assetText.setText('Loading asset: ' + file.key);
        });

        // delete bar graphics, when loading complete
        this.load.on("complete", function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        }, this);
    }
}