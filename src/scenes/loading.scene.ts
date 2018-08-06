import { ImageService } from '../services/image.service';
import { Settings } from '../settings';

export class LoadingScene extends Phaser.Scene {

    private _loadScene: string;
    private _options: any;

    private loadingBar: Phaser.GameObjects.Graphics;
    private progressBar: Phaser.GameObjects.Graphics;

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
        this.cameras.main.setBackgroundColor(0x98d687);

        if (!this._options.persistMusic) {
            this.sound.stopAll();
            if (Settings.sound.musicVolume > 0) {
                this._music = this.sound.add('interlude');
                this._music.play('', { loop: true });                
            }
        }

        // this.createLoadingbar();

        // pass value to change the loading bar fill
        this.load.on("progress", function (value) {
            this.progressBar.clear();
            this.progressBar.fillStyle(0xfff6d3, 1);
            this.progressBar.fillRect(
                this.cameras.main.width / 4,
                this.cameras.main.height / 2 - 16,
                (this.cameras.main.width / 2) * value,
                16
            );
        }, this);

        // delete bar graphics, when loading complete
        this.load.on("complete", function () {
            this.progressBar.destroy();
            this.loadingBar.destroy();
        }, this);

    }

    private createLoadingbar(): void {
        this.loadingBar = this.add.graphics();
        this.loadingBar.fillStyle(0x5dae47, 1);
        this.loadingBar.fillRect(
            this.cameras.main.width / 4 - 2,
            this.cameras.main.height / 2 - 16,
            this.cameras.main.width / 2 + 4,
            20
        );
        this.progressBar = this.add.graphics();
    }

    create(): void {
        ImageService.stretchAndFitImage('preloader', this);
        // this.add.image(0, 0, 'preloader');
    }
}