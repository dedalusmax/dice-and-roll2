import { Assets } from "../models/assets";

export class BootScene extends Phaser.Scene {
  
    private _loadingFinished: boolean;

    constructor() {
        super({
            key: "BootScene"
        });
    }

    preload(): void {        
        this._loadingFinished = false;

        // load fonts
        this.load.bitmapFont('berkshire', 'assets/fonts/BerkshireSwash-Regular.png', 'assets/fonts/BerkshireSwash-Regular.xml');
        this.load.bitmapFont('berkshire-stroked', 'assets/fonts/BerkshireSwash-Stroked.png', 'assets/fonts/BerkshireSwash-Stroked.xml');

        // Load assets required for preLoader (progress bar, etc.)
        this.load.image('logo', 'assets/screens/logo.png');
        this.load.audio('interlude', 'assets/sound/loops/looperman-l-1483711-0130311-hilltop-full.wav');

        // load data in JSON files
        this.load.text('characters', 'data/characters.json');
        this.load.text('monsters', 'data/monsters.json');
        this.load.text('campaign', 'data/campaign.json');
        this.load.text('specials', 'data/specials.json');
        this.load.text('weapons', 'data/weapons.json');
        this.load.text('armors', 'data/armors.json');

        this.load.on("complete", f => {
            this._loadingFinished = true;
        });
    }

    create(): void {
        // create object repository for usage in game
        var assets = new Assets(this.sys.game);
    }

    update(): void {    
        if (this._loadingFinished) {
            this.scene.start("LoadingScene", { loadScene: 'MainMenuScene' });
        }
    }
}