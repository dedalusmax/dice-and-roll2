import { ImageService } from "../services/image.service";
import { TextualService } from "../services/textual.service";
import { FONT_FAMILY } from "../models/styles";
import { Settings } from "../models/settings";
import { SceneService } from "../services/scene.service";

const TITLE_TEXT_STYLE = { font: '72px ' + FONT_FAMILY, fill: '#990000', align: 'center' },
    BACK_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#581B06', align: 'center', stroke: '#000000', strokeThickness: 2 };
    
export class DefeatScene extends Phaser.Scene {

    private _canvas: HTMLCanvasElement;

    constructor() {
        super({
            key: "DefeatScene"
        });
    }

    init(): void {
        this._canvas = this.textures.game.canvas;
    }

    create() {
        this.cameras.main.setBackgroundColor(0x360602);

        var logo = ImageService.stretchAndFitImage('defeat', this);
        logo.setScale(0.5);
        logo.setOrigin(0.5, 0.5);   

        if (Settings.sound.musicVolume > 0) {
            this.sound.stopAll();
            var music = this.sound.add('defeat');
            music.play('', { loop: true });    
        }

        var resultText = this.add.text(this._canvas.width / 2, 50, 'You have been defeated', TITLE_TEXT_STYLE);
        resultText.setOrigin(0.5, 0.5);      

        TextualService.createTextButton(this, 'Close', this._canvas.width / 2, this._canvas.height - 100, BACK_STYLE, a => {
            SceneService.backToMenu(this);
        });
    }
}