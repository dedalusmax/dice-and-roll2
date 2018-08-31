import { Settings } from "../models/settings";

export class EndScene extends Phaser.Scene {

    constructor() {
        super({
            key: "EndScene"
        });
    }

    create() {
        this.cameras.main.fadeIn(1000);
        this.cameras.main.setBackgroundColor(0x360602);

        // var logo = ImageService.stretchAndFitImage('victory', this);
        // logo.setScale(0.3);
        // logo.setOrigin(0.5, 0.5);   

        if (Settings.sound.musicVolume > 0) {
            this.sound.stopAll();
            var music = this.sound.add('end');
            music.play('', { loop: true });    
        }
    }
}