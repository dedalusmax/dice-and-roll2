import { Settings } from "../models/settings";
import { ImageService } from "../services/image.service";
import { FONT_FAMILY } from "../models/styles";
import { TextualService } from "../services/textual.service";
import { SceneService } from "../services/scene.service";

const TITLE_TEXT_STYLE = { font: '72px ' + FONT_FAMILY, fill: '#071600', align: 'center', stroke: '#004400', strokeThickness: 2 },
    BACK_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#888888', align: 'center', stroke: '#000000', strokeThickness: 2 },
    TEXT_STYLE = { font: '24px ' + FONT_FAMILY, fill: '#F4FFEF', align: 'center', stroke: '#000000', strokeThickness: 2 };
    
export class EndScene extends Phaser.Scene {

    constructor() {
        super({
            key: "EndScene"
        });
    }

    create() {
        this.cameras.main.fadeIn(1000);
        this.cameras.main.setBackgroundColor(0xF0DAB3);

        var logo = ImageService.stretchAndFitImage('end', this);
        logo.setOrigin(0.5, 0.5);   

        this.add.text(this.cameras.main.width / 2, 50, 'The End', TITLE_TEXT_STYLE)
            .setOrigin(0.5, 0.5);      

        TextualService.createTextButton(this, 'Close', 40, this.cameras.main.height - 60, BACK_STYLE, a => {
            SceneService.backToMenu(this);
        });

        if (Settings.sound.musicVolume > 0) {
            this.sound.stopAll();
            var music = this.sound.add('end');
            music.play('', { loop: true });    
        }

        const victory = this.sound.add('victory');
        victory.play();

        this.time.delayedCall(2000, () => {

            const message = 
            `As the enemy lays defeated are heroes stand victories on this black spire.\n 
            The light may shine again for, without them,\n
            this land would shorely stay by in the annales of history.\n 
            They have travelled far and wide, and here there are \n
            looking at the dawn of a new and better age.\n
            \n
            … Yet the Eather still lingers, weakend, but not defeated. \n 
            It may come once again, to stand as a great opponent\n
            for heroes yet to come …\n`;

            const text = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, message, TEXT_STYLE);
            text.setOrigin(0.5, 0.4);
            text.alpha = 0;
            this.add.tween({
                targets: [ text ],
                ease: 'Linear',
                duration: 2000,
                delay: 1000,
                alpha: 1
            });
        

        }, null, this);
    }
}