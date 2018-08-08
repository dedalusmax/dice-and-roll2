import { Assets } from "../models/assets";

export class BootScene extends Phaser.Scene {
  
    constructor() {
        super({
            key: "BootScene"
        });
    }

    preload(): void {
        // load fonts
        this.load.bitmapFont('berkshire', 'assets/fonts/BerkshireSwash-Regular.png', 'assets/fonts/BerkshireSwash-Regular.xml');
        this.load.bitmapFont('berkshire-stroked', 'assets/fonts/BerkshireSwash-Stroked.png', 'assets/fonts/BerkshireSwash-Stroked.xml');

        // Load assets required for preLoader (progress bar, etc.)
        this.load.image('preloader', 'assets/screens/loading.opt.jpg');
        this.load.audio('interlude', [
            'assets/sound/loops/looperman-l-0079105-0053511-centrist-tales-of-home-guitar.ogg',
            'assets/sound/loops/looperman-l-0079105-0053511-centrist-tales-of-home-guitar.mp3'
        ]);

        // load data in JSON files
        this.load.text('characters', 'data/characters.json');
        this.load.text('monsters', 'data/monsters.json');
        this.load.text('campaign', 'data/campaign.json');
        this.load.text('specials', 'data/specials.json');
        this.load.text('weapons', 'data/weapons.json');
        this.load.text('armors', 'data/armors.json');
    }

    create(): void {
        // create object repository for usage in game
        var assets = new Assets(this.sys.game);
    }

    update(): void {
        this.scene.start("LoadingScene", { loadScene: 'MainMenuScene' });
    }
}