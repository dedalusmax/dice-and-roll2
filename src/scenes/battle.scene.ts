import { Settings } from "../models/settings";

export class BattleScene extends Phaser.Scene {

    private _options: any;
    private _music: Phaser.Sound.BaseSound;
    private _soundRound: Phaser.Sound.BaseSound;
    private _soundClick: Phaser.Sound.BaseSound;
    private _isTurnInProgress: boolean;

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

    }

    update(): void {

    }
    
}