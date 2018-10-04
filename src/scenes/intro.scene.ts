import { TextualService } from "../services/textual.service";

import { Settings } from "../models/settings";

import { SceneService } from "../services/scene.service";
import { FONT_FAMILY } from "../models/styles";
import { ImageService } from "../services/image.service";
import { IntroSceneOptions } from "./scene-options";

const NARRATION_LIGHT_STYLE = { font: '18px ' + FONT_FAMILY, fill: '#FFEEBC'},
    NARRATION_DARK_STYLE = { font: '18px ' + FONT_FAMILY, fill: '#581B06'},     
    BACK_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#581B06', align: 'center', stroke: '#000000', strokeThickness: 2 },
    TALK_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#FF6A00', align: 'center', stroke: '#000000', strokeThickness: 2 };

export class IntroScene extends Phaser.Scene {
  
    private _options: IntroSceneOptions;
    private _ambientMusic: Phaser.Sound.BaseSound;
    private _centeredText: Phaser.GameObjects.Text;
    private _timeline = 0;
    private _character: Phaser.GameObjects.Sprite;

    constructor() {
        super({
            key: "IntroScene"
        });
    }

    init(data): void {
        this._options = data;
    }

    create(): void {
        this._timeline = 0;

        this.cameras.main.fadeIn(1000);
        this.cameras.main.setBackgroundColor(0x040404);

        this.sound.stopAll();

        TextualService.createTextButton(this, 'Back', 50, 30, BACK_STYLE, a => {
            this.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
            SceneService.backToMenu(this);
        });
    }

    update() {
        this._timeline++;
        console.log(this._timeline);

        switch (this._timeline) {
            case 50:
                this.displayNarrationTextOnCenter('somewhere near the coast of the Fading sea ...');
                break;

            case 400:
                this._ambientMusic = this.sound.add('ambient-arrival', { volume: Settings.sound.musicVolume });
                this._ambientMusic.play('', { loop: true });
                this.cameras.main.flash(100);
                break;

            case 500:
                this.cameras.main.fadeIn(2000);
                ImageService.stretchAndFitImage('arrival-ship', this);
                break;

            case 550: 
                TextualService.createTextButton(this, 'Skip intro', this.cameras.main.width - 100, 30, BACK_STYLE, a => {
                    this.sound.add('page', { volume: Settings.sound.sfxVolume }).play();
                    SceneService.backToMenu(this);
                });
                break;

            case 600:
                this.displayNarrationText('one ship was sailing carrying mysterious passengers ...', NARRATION_LIGHT_STYLE);
                break;

            case 800:
                this.displayCharacter(0, true, 'Hey! This storm is getting bigger and bigger.\n We might die out here!!');
                break;

            case 1100:
                this.removeCharacter(true);
                break;

            case 1150:
                this.displayNarrationText('the sea was treacherous, and the ship swang on the waves helplesly ...', NARRATION_LIGHT_STYLE);
                break;

            case 1300:
                this.displayCharacter(1, false, 'Hold tight! A large wave is coming!\n We\'re gonna drown!');
                break;

            case 1600:
                this.removeCharacter(false);
                break;

            case 1800:
                this.cameras.main.fadeOut(2000);
                break;

            case 2000:
                this.sound.volume = Settings.sound.musicVolume;
                this.cameras.main.setBackgroundColor(0xFFFFFF);
                this.cameras.main.fadeIn(2000);
                ImageService.stretchAndFitImage('arrival-map', this);
                this._ambientMusic.stop();
                this._ambientMusic = this.sound.add('ambient-beach', { volume: Settings.sound.musicVolume });
                this._ambientMusic.play('', { loop: true });
                break;

            case 2200:
                this.displayNarrationText('the ship crashed on the shores of small peninsula\n so distant from their destination', NARRATION_DARK_STYLE);
                break;

            case 2400:
                this.displayCharacter(2, true, 'Well, that was close!\n Next time I\'m bringing swimming gear');
                break;

            case 2600:
                this.removeCharacter(true);
                break;
        }

        if (this._timeline >= 1800 && this._timeline < 2000 && this.sound.volume > 0) {
            this.sound.volume -= 0.005;
        }
    }

    private displayNarrationTextOnCenter(text: string) {
        this._centeredText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, text, NARRATION_LIGHT_STYLE);
        this._centeredText.setOrigin(0.5, 0.5);    
        this._centeredText.alpha = 0;
        this.applyTweenToText();
    }

    private displayNarrationText(text: string, style: any) {
        this._centeredText = this.add.text(this.cameras.main.width * 0.6, 40, text, style);
        this._centeredText.setOrigin(0.5, 0.5);    
        this._centeredText.alpha = 0;
        this.applyTweenToText();
    }

    private applyTweenToText() {
        this.add.tween({
            targets: [ this._centeredText ],
            ease: 'Linear',
            duration: 3000,
            delay: 1000,
            alpha: 1,
            yoyo: true
        });
    }

    private displayCharacter(index: number, left: boolean, text: string) {
        var leftPosition = new Phaser.Geom.Point(-200, 250);
        var rightPosition = new Phaser.Geom.Point(2000, 250);
        let position = left ? leftPosition : rightPosition;
        var name = 'characters/' +  this._options.playerParty.members[index].name;
        this._character = this.add.sprite(position.x, this.cameras.main.height - position.y, name);
        this._character.setOrigin(0.5, 0.5);
        this._character.setAlpha(0);
        let targetX = left ? 100 : this.cameras.main.width - 200;
        this.add.tween({
            targets: [this._character],
            ease: 'Quad.easeIn',
            duration: 800,
            x: targetX,
            alpha: 1,
            onComplete: () => {
                if (left) {
                    this.displayCharacterText(left, text);
                } else {
                    this.displayCharacterText(left, text);
                }
            }
        });
    }

    private displayCharacterText(left: boolean, text: string) {
        if (left) {
            this._centeredText = this.add.text(this.cameras.main.width * 0.4, this.cameras.main.height - 100, text, TALK_STYLE);
        } else {
            this._centeredText = this.add.text(this.cameras.main.width * 0.6, this.cameras.main.height - 100, text, TALK_STYLE);
        }
        this._centeredText.setOrigin(0.5, 0.5);    
        this._centeredText.alpha = 0;
        this.add.tween({
            targets: [ this._centeredText ],
            ease: 'Linear',
            duration: 400,
            alpha: 1
        });
    }

    private removeCharacter(left: boolean) {
        this._centeredText.alpha = 0;
        this.add.tween({
            targets: [this._character],
            ease: 'Quad.easeIn',
            duration: 800,
            delay: 200,
            x: left ? -200 : 2000,
            alpha: 0
        });
    }
}