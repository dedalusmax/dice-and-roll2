import { TextualService } from "../services/textual.service";

import { Settings } from "../models/settings";

import { SceneService } from "../services/scene.service";
import { FONT_FAMILY } from "../models/styles";
import { ImageService } from "../services/image.service";
import { IntroSceneOptions, MapSceneOptions } from "./scene-options";
import { MapScene } from "./map.scene";

const NARRATION_LIGHT_STYLE = { font: '18px ' + FONT_FAMILY, fill: '#FFEEBC'},
    NARRATION_DARK_STYLE = { font: '18px ' + FONT_FAMILY, fill: '#581B06'},     
    BACK_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#581B06', align: 'center', stroke: '#000000', strokeThickness: 2 },
    TALK_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#60362B', align: 'center', stroke: '#000000', strokeThickness: 2 };

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

        TextualService.createTextButton(this, 'Give up', 50, 30, BACK_STYLE, a => {
            this.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
            SceneService.backToMenu(this);
        });
    }

    update() {
        this._timeline++;
        console.log(this._timeline);

        switch (this._timeline) {
            case 50:
                this.displayNarrationTextOnCenter('Somewhere near the coast of the Fading sea ...');
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
                    this.endScene();
                });
                break;

            case 600:
                this.displayNarrationText('A steamboat sails close to the shore of an unknown land,\n hitting rocks as it getting closer to the shallow bay.', NARRATION_LIGHT_STYLE);
                break;
            
            case 1100:
                this.displayNarrationText('Its waters are murky, and as the ship moves closer to the shore,\n a light gust of wind disperses thick fog over the ink-like water.', NARRATION_LIGHT_STYLE);
                break;

            case 1600:
                this.displayCharacter(0, true, 'Draw your cards!\n I can still beat you in this poker game!');
                break;

            case 1800:
                this.removeCharacter(true);
                break;

            case 2000:
                this.displayCharacter(1, false, 'The lights have gone out!,\n What\'s happening?');
                break;

            case 2200:
                this.removeCharacter(false);
                break;

            case 2300:
                this.displayNarrationText('The boat trembles, as it hits the rocky ridge.', NARRATION_LIGHT_STYLE);
                break;

            case 2500:
                this.displayCharacter(2, true, 'Hold tight!\n We\'re gonna hit the rocks!');
                break;

            case 2700:
                this.removeCharacter(true);
                break;

            case 2900:
                const crash = this.sound.add('crash');
                crash.play();
                break;

            case 3000:
                this.cameras.main.fadeOut(2000);
                const panic = this.sound.add('panic');
                panic.play();
                break;

            case 3400:
                this.sound.volume = Settings.sound.musicVolume;
                this.cameras.main.fadeIn(2000);
                ImageService.stretchAndFitImage('arrival-map', this);
                this._ambientMusic.stop();
                this._ambientMusic = this.sound.add('ambient-beach', { volume: Settings.sound.musicVolume });
                this._ambientMusic.play('', { loop: true });
                break;

            case 3600:
                this.displayNarrationText('The ship crashed on the shores of a small peninsula\n very distant from their destinations.', NARRATION_DARK_STYLE);
                break;

            case 4000:
                this.displayNarrationText('A vast land stretches before their eyes,\n villages, distant towns and forests can be seen.', NARRATION_DARK_STYLE);
                break;

            case 4400:
                this.displayCharacter(2, true, 'Well, that was close!\n We were lucky we survived - not like the others!');
                break;

            case 4700:
                this.removeCharacter(true);
                break;

            case 4800:
                this.displayCharacter(1, false, 'Look there! There is a lighthouse!\n We can take a refuge there and rest.');
                break;

            case 5100:
                this.removeCharacter(false);
                break;

            case 5200:
                this.displayCharacter(0, true, 'A great journey awaits us,\n for there is no return back for us now!');
                break;

            case 5600:
                this.removeCharacter(true);
                break;

            case 5700:
                const horn = this.sound.add('horn');
                horn.play();
                this.cameras.main.fadeOut(2000);
                break;

            case 6200:
                this.endScene();
                break;
        }

        if (this._timeline >= 3000 && this._timeline < 3400 && this.sound.volume > 0) {
            this.sound.volume -= 0.005;
        }

        if (this._timeline >= 6000 && this._timeline < 6200 && this.sound.volume > 0) {
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
            duration: 4000,
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

    private endScene() {
        if (this._options.newGame) {
            var options = new MapSceneOptions();
            options.worldMap = false;
            options.playerParty = this._options.playerParty;
            SceneService.run(this, new MapScene(), false, options);    
        } else {
            SceneService.backToMenu(this);
        }
    }
}