import { ImageService } from "../services/image.service";
import { TextualService } from "../services/textual.service";
import { Styles } from "../models/styles";
import { Settings } from "../models/settings";

export class DefeatScene extends Phaser.Scene {

    private _options: any;

    constructor() {
        super({
            key: "DefeatScene"
        });
    }

    init(data): void {
        this._options = data;
    }

    create() {
        var logo = ImageService.stretchAndFitImage('defeat', this);
        logo.setScale(0.3);
        logo.setOrigin(0.5, 0.5);   

        // quit victory button (visible only in skirmish mode)
        // if (this._options.skirmish) {
            var exit = TextualService.createTextButton(this, 'Exit', 0, 0, Styles.battle.backButton, a => {
                this.scene.start('LoadingScene', { loadScene: 'MainMenuScene' });
            });
        // }

        if (Settings.sound.musicVolume > 0) {
            this.sound.stopAll();
            var music = this.sound.add('defeat');
            music.play('', { loop: true });    
        }
    }
}