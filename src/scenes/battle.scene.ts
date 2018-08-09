import { Settings } from "../models/settings";
import { ImageService } from "../services/image.service";
import { TextualService } from "../services/textual.service";
import { Styles } from "../models/styles";
import { Soundsets } from "../models/soundsets";

export class BattleScene extends Phaser.Scene {

    private _options: any;
    private _music: Phaser.Sound.BaseSound;
    private _soundRound: Phaser.Sound.BaseSound;
    private _soundClick: Phaser.Sound.BaseSound;
    
    private _isTurnInProgress: boolean;
    private _turnNumber: number;
    private _roundNumber: number;

    constructor() {
        super({
            key: "BattleScene"
        });
    }

    init(data): void {
        this._options = data.options || {};
        this._isTurnInProgress = false;
    }

    preload(): void {
    }

    create(): void {
        var music;
        // check if music is enabled
        if (Settings.sound.musicVolume > 0) {
            // introductory fade in of theme music
            this.sound.stopAll();
            this._music = this.sound.add('battle_' + this._options.terrain);
            music = this._music.play('', { loop: true });    
        }

        // add sounds

        this._soundRound = this.sound.add('gong');
        this._soundClick = this.sound.add('click');

        this._turnNumber = 0;
        this._roundNumber = 0;

        // background image 
        ImageService.stretchAndFitImage('battle_' + this._options.terrain, this);

        // quit battle button (visible only in skirmish mode)
        if (this._options.skirmish) {
            TextualService.createTextButton(this, 'Quit battle', 140, 800, Styles.text.backButton, Soundsets.sounds['sword'], a => {
                var options = this._options;
                options.loadScene = 'MainMenuScene';
                this.scene.start('LoadingScene', options);
            });
        }
        
    }

    update(): void {

    }
    
}