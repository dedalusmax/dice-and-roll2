import { ImageService } from "../services/image.service";
import { Settings } from "../models/settings";
import { SceneService } from "../services/scene.service";
import { VictorySceneOptions, MapSceneOptions } from "./scene-options";
import { FONT_FAMILY } from "../models/styles";
import { TextualService } from "../services/textual.service";
import { MapScene } from "./map.scene";

const TITLE_TEXT_STYLE = { font: '72px ' + FONT_FAMILY, fill: '#22FF22', align: 'center' },
    BACK_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#581B06', align: 'center', stroke: '#000000', strokeThickness: 2 };

export class VictoryScene extends Phaser.Scene {

    private _options: VictorySceneOptions;
    private _canvas: HTMLCanvasElement;

    constructor() {
        super({
            key: "VictoryScene"
        });
    }

    init(data): void {
        this._options = data;
        this._canvas = this.textures.game.canvas;
    }

    create() {
        this.cameras.main.setBackgroundColor(0x360602);

        var logo = ImageService.stretchAndFitImage('victory', this);
        logo.setScale(0.3);
        logo.setOrigin(0.5, 0.5);   

        if (Settings.sound.musicVolume > 0) {
            this.sound.stopAll();
            var music = this.sound.add('victory');
            music.play('', { loop: true });    
        }

        var resultText = this.add.text(this._canvas.width / 2, 50, 'Victory', TITLE_TEXT_STYLE);
        resultText.setOrigin(0.5, 0.5);      

        TextualService.createTextButton(this, 'Close', this._canvas.width / 2, this._canvas.height - 100, BACK_STYLE, a => {
            if (this._options.skirmish) {
                SceneService.backToMenu(this);
            } else {
                var options = new MapSceneOptions();
                options.worldMap = false;
                options.playerParty = this._options.playerParty;
                SceneService.run(this, new MapScene(), false, options);
            }
        });
    }
}