import { Assets } from "../models/assets";
import { SceneService } from "../services/scene.service";

export class BootScene extends Phaser.Scene {
  
    private _loadingFinished: boolean;

    constructor() {
        super({
            key: "BootScene"
        });
    }

    // no init, since no scene parameters passed

    preload(): void {        
        this._loadingFinished = false;

        // Load assets required for preLoader (progress bar, etc.)
        this.load.image('logo', 'assets/screens/logo.png');
        this.load.audio('interlude', 'assets/sound/loops/looperman-l-1483711-0130311-hilltop-full.wav'); // this is the only sound asset that has to be fixed (since there are not assets yet)

        // load data in JSON files
        this.load.text('characters', 'data/characters.json');
        this.load.text('monsters', 'data/monsters.json');
        this.load.text('campaign', 'data/campaign.json');
        this.load.text('specials', 'data/specials.json');
        this.load.text('weapons', 'data/weapons.json');
        this.load.text('armors', 'data/armors.json');
        this.load.text('sounds', 'data/sounds.json');

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
            SceneService.backToMenu(this);
        }
    }
}