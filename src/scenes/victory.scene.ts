import { ImageService } from "../services/image.service";
import { TextualService } from "../services/textual.service";
import { Styles } from "../models/styles";
import { Settings } from "../models/settings";

export class VictoryScene extends Phaser.Scene {

    private _options: any;

    constructor() {
        super({
            key: "VictoryScene"
        });
    }

    init(data): void {
        this._options = data;
    }

    create() {
        var logo = ImageService.stretchAndFitImage('victory', this);
        logo.setScale(0.3);
        logo.setOrigin(0.5, 0.5);   

        // quit victory button (visible only in skirmish mode)
        if (this._options.skirmish) {
            var exit = TextualService.createTextButton(this, 'Exit', 0, 0, Styles.battle.backButton, a => {
                var options = this._options;
                options.loadScene = 'MainMenuScene';
                this.scene.start('LoadingScene', { loadScene: 'MainMenuScene' });
            });
        }

        if (Settings.sound.musicVolume > 0) {
            this.sound.stopAll();
            var music = this.sound.add('victory');
            music.play('', { loop: true });    
        }
    }
}