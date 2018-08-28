import { ImageService } from "../services/image.service";
import { TextualService } from "../services/textual.service";
import { Styles } from "../models/styles";
import { Settings } from "../models/settings";
import { SceneService } from "../services/scene.service";

// TODO: delete this!!
export class DefeatScene extends Phaser.Scene {

    constructor() {
        super({
            key: "DefeatScene"
        });
    }

    init(): void {
    }

    create() {
        var logo = ImageService.stretchAndFitImage('defeat', this);
        logo.setScale(0.3);
        logo.setOrigin(0.5, 0.5);   

        // quit victory button (visible only in skirmish mode)
        // if (this._options.skirmish) {
            var exit = TextualService.createTextButton(this, 'Exit', 0, 0, Styles.battle.backButton, a => {
                SceneService.backToMenu(this);
            });
        // }

        if (Settings.sound.musicVolume > 0) {
            this.sound.stopAll();
            var music = this.sound.add('defeat');
            music.play('', { loop: true });    
        }
    }
}