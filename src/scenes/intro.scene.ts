import { TextualService } from "../services/textual.service";

import { Settings } from "../models/settings";

import { SceneService } from "../services/scene.service";
import { FONT_FAMILY } from "../models/styles";
import { ImageService } from "../services/image.service";
import { IntroSceneOptions } from "./scene-options";

const TITLE_STYLE = { font: '18px ' + FONT_FAMILY, fill: '#FFEEBC'},
    BACK_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#581B06', align: 'center', stroke: '#000000', strokeThickness: 2 },
    SKIP_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#FF6A00', align: 'center', stroke: '#000000', strokeThickness: 2 },
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
                this.displayText('somewhere near the coast of the Fading sea ...');
                break;

            case 400:
                this._ambientMusic = this.sound.add('ambient-arrival', { volume: Settings.sound.sfxVolume });
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
                this.displayTextOnTopRight('one ship was sailing carrying mysterious passengers ...');
                break;

            case 800:
                this.displayCharacterOnLeft(0, 'Hey! This storm is getting bigger and bigger.\n We might die out here!!');
                break;

            case 1100:
                this.removeCharacterOnLeft();
                break;

            case 1150:
                this.displayTextOnTopRight('the sea was treacherous, and the ship swang on the waves helplesly ...');
                break;

            case 1300:
                this.displayCharacterOnRight(1, 'Hold tight! A large wave is coming!\n We\'re gonna drown!');
                break;

            case 1600:
                this.removeCharacterOnRight();
                break;

            case 1800:
                this.cameras.main.fadeOut(2000);
                break;

            case 1805:
                this.sound.volume -= 0.005;

            case 2000:
                this.cameras.main.fadeIn(2000);
                this.cameras.main.setBackgroundColor(0xFFFFFF);
                ImageService.stretchAndFitImage('arrival-map', this);
                break;
            
            case 2200:
                this._ambientMusic.stop();
                this._ambientMusic = this.sound.add('ambient-beach', { volume: Settings.sound.sfxVolume });
                this._ambientMusic.play('', { loop: true });
                break;
        }
    }

    private displayText(text: string) {
        this._centeredText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, text, TITLE_STYLE);
        this._centeredText.setOrigin(0.5, 0.5);    
        this._centeredText.alpha = 0;
        this.add.tween({
            targets: [ this._centeredText ],
            ease: 'Linear',
            duration: 2000,
            delay: 1000,
            alpha: 1,
            yoyo: true
        });
    }

    private displayTextOnTopRight(text: string) {
        this._centeredText = this.add.text(this.cameras.main.width * 0.6, 40, text, TITLE_STYLE);
        this._centeredText.setOrigin(0.5, 0.5);    
        this._centeredText.alpha = 0;
        this.add.tween({
            targets: [ this._centeredText ],
            ease: 'Linear',
            duration: 2000,
            delay: 1000,
            alpha: 1,
            yoyo: true
        });
    }

    private displayCharacterOnLeft(index: number, text: string) {
        var position = new Phaser.Geom.Point(-200, 250);
        var name = 'characters/' +  this._options.playerParty.members[index].name;
        this._character = this.add.sprite(position.x, this.cameras.main.height - position.y, name);
        this._character.setOrigin(0.5, 0.5);
        this._character.setAlpha(0);
        
        this.add.tween({
            targets: [this._character],
            ease: 'Quad.easeIn',
            duration: 800,
            x: 100,
            alpha: 1,
            onComplete: () => {
                this.displayCharacterTextOnLeft(text);
            }
        });
    }

    private displayCharacterTextOnLeft(text: string) {
        this._centeredText = this.add.text(this.cameras.main.width * 0.4, this.cameras.main.height - 100, text, TALK_STYLE);
        this._centeredText.setOrigin(0.5, 0.5);    
        this._centeredText.alpha = 0;
        this.add.tween({
            targets: [ this._centeredText ],
            ease: 'Linear',
            duration: 400,
            alpha: 1
        });
    }

    private removeCharacterOnLeft() {
        this._centeredText.alpha = 0;
        this.add.tween({
            targets: [this._character],
            ease: 'Quad.easeIn',
            duration: 800,
            delay: 200,
            x: -200,
            alpha: 0
        });
    }

    private displayCharacterOnRight(index: number, text: string) {
        var position = new Phaser.Geom.Point(2000, 250);
        var name = 'characters/' +  this._options.playerParty.members[index].name;
        this._character = this.add.sprite(position.x, this.cameras.main.height - position.y, name);
        this._character.setOrigin(0.5, 0.5);
        this._character.setAlpha(0);
        
        this.add.tween({
            targets: [this._character],
            ease: 'Quad.easeIn',
            duration: 800,
            x: this.cameras.main.width - 200,
            alpha: 1,
            onComplete: () => {
                this.displayCharacterTextOnRight(text);
            }
        });
    }

    private displayCharacterTextOnRight(text: string) {
        this._centeredText = this.add.text(this.cameras.main.width * 0.6, this.cameras.main.height - 100, text, TALK_STYLE);
        this._centeredText.setOrigin(0.5, 0.5);    
        this._centeredText.alpha = 0;
        this.add.tween({
            targets: [ this._centeredText ],
            ease: 'Linear',
            duration: 400,
            alpha: 1
        });
    }

    private removeCharacterOnRight() {
        this._centeredText.alpha = 0;
        this.add.tween({
            targets: [this._character],
            ease: 'Quad.easeIn',
            duration: 800,
            delay: 200,
            x: 2000,
            alpha: 0
        });
    }
}