import { Combatant, CombatantSide } from "./combatant";
import { Styles, FONT_FAMILY, FONT_FAMILY_BLOCK } from "./styles";

const COLOR = {
    RED: '#990000',
    YELLOW: '#999900',
    GREEN: '#009900',
    BLACKISH: '#11111',
    GRAY: '#333333'
};

export class Card {

    private _canvas: HTMLCanvasElement;

    private _mainSprite: Phaser.GameObjects.Sprite;
    private _positiveEffect: Phaser.GameObjects.Sprite;
    private _negativeEffect: Phaser.GameObjects.Sprite;
    private _attackText: Phaser.GameObjects.Text;
    private _defenseText: Phaser.GameObjects.Text;
    private _image: Phaser.GameObjects.Sprite;
    private _healthIndicator: Phaser.GameObjects.Text;

    private _selectedTween: Phaser.Tweens.Tween;
    private _activeTween: Phaser.Tweens.Tween;

    private get allObjects(): Array<Phaser.GameObjects.GameObject> {

        var objects = [this._mainSprite, this._image, this._healthIndicator];
        
        if (this._positiveEffect) {
            objects.push(this._positiveEffect);
        }
        if (this._negativeEffect) {
            objects.push(this._negativeEffect);
        }
        
        return objects;
    }

    constructor(private _scene: Phaser.Scene, combatant: Combatant, private _position: Phaser.Geom.Point) {

        this._canvas = _scene.textures.game.canvas;

        // the main sprite, the card background
        this._mainSprite = _scene.add.sprite(_position.x, _position.y, 'cards/card');

        if ( combatant.side === CombatantSide.Friend) {
            this._image = this.addSpriteToCard(0, 0, 'characters/' + combatant.name + '-head');
        } else {
            this._image = this.addSpriteToCard(0, 0, 'monsters/' + combatant.name);
        }

        this._healthIndicator = this.addTextToCard(0, 60, combatant.health.toString(), 
        { font: '18px ' + FONT_FAMILY_BLOCK, fill: '#009900', align: 'center', stroke: '#000000', strokeThickness: 2 });
        this._healthIndicator.setShadow(0, 0, '#FFFFFF', 4, true, true);
    }

    private addSpriteToCard(left: number, top: number, texture, frame?) {

        var x = this._position.x + left;
        var y = this._position.y + top;
        var sprite = this._scene.add.sprite(x, y, texture, frame);
        sprite.setDisplayOrigin(this._position.x, this._position.y);
        sprite.setOrigin(0.5, 0.5);

        return sprite;
    }

    private addTextToCard(left: number, top: number, text: string | string[], style?: any) {

        var x = this._position.x + left;
        var y = this._position.y + top;
        var textObject = this._scene.add.text(x, y, text, style || Styles.battle.indicator);
        textObject.setDisplayOrigin(this._position.x, this._position.y);
        textObject.setOrigin(0.5, 0.5);
      
        return textObject;
    }

    public select() {
        if (!this._selectedTween) {
            this._selectedTween = this._scene.tweens.add({
                targets: this.allObjects,
                scaleX: '+=0.05',
                scaleY: '+=0.05',
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: Infinity
            });
        } else if (!this._selectedTween.isPlaying()) {
            this._selectedTween.restart();
        }
    }

    public unselect() {
        if (this._selectedTween && this._selectedTween.isPlaying()) {
            this._selectedTween.stop(0);
        }
    }

    public activate(combatant: Combatant): Promise<Combatant> {

        if (!this._activeTween) {
            this._activeTween = this._scene.tweens.add({
                targets: this.allObjects,
                y: '-=24',
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: Infinity
            });
        } else if (!this._activeTween.isPlaying()) {
            this._activeTween.restart();
        }

        this._image.setInteractive();
        
        return new Promise<Combatant>((resolve, reject) => {
            this._image.on('pointerdown', e => {
                resolve(combatant);
            });
        });
    }

    public deactivate() {
        if (this._activeTween && this._activeTween.isPlaying()) {
            this._activeTween.stop(0);
        }
        this._image.disableInteractive();
        this._image.removeAllListeners('pointerdown');
     }

     public showDamage(amount: number, health: number) {
        var damageText = this.addTextToCard(0, 0, amount.toString(), { font: '65px ' + FONT_FAMILY_BLOCK, fill: '#ff0000', align: 'center' });
        // this._scene.add.tween({
        //     targets: damageText,
        //     alpha: 0,
        //     y: damageText.y - 60,
        //     ease: 'Linear',
        //     duration: 600,
        //     onComplete: () => {
        //         damageText.destroy();
        //         this.updateHealth(health);
        //     }
        // });
        this.playVanishingEffect(damageText).then(() => {
            this.updateHealth(health);
        });
    }

    public showHealing(amount: number, health: number) {
        var healingText = this.addTextToCard(0, 0, amount.toString(), { font: '65px ' + FONT_FAMILY_BLOCK, fill: '#00FF00', align: 'center' });
        // this._scene.add.tween({
        //     targets: healingText,
        //     alpha: 0,
        //     y: healingText.y - 60,
        //     ease: 'Linear',
        //     duration: 600,
        //     onComplete: () => {
        //         healingText.destroy();
        //         this.updateHealth(health);
        //     }
        // });
        this.playVanishingEffect(healingText).then(() => {
            this.updateHealth(health);
        });
    }

    public showEffect(name: string, modifier: string): Promise<any> {
        var effect = this.addTextToCard(0, 0, [name, modifier], { font: '48px ' + FONT_FAMILY_BLOCK, fill: '#FFD800', align: 'center' });
        return this.playVanishingEffect(effect);
    }

    private playVanishingEffect(target: Phaser.GameObjects.Text): Promise<any> {
        return new Promise((resolve) => {
            this._scene.add.tween({
                targets: target,
                alpha: 0,
                y: target.y - 60,
                ease: 'Linear',
                duration: 1000,
                onComplete: () => {
                    target.destroy();
                    resolve();
                }
            });
        });
    }

    public updateEffects(showPositive: boolean, showNegative: boolean) {
        
        if (showPositive && !this._positiveEffect) {
            // show positive since it's not displayed yet
            this._positiveEffect = this.addSpriteToCard(-40, -60, 'card-effects', 0);
            this._positiveEffect.setAlpha(0.5);
            this._scene.add.tween({
                targets: [this._positiveEffect],
                alpha: 1,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: Infinity
            });
        } else if (!showPositive && this._positiveEffect) {
            // remove positive since it's displayed already
            this._positiveEffect.destroy();
            this._positiveEffect = null;
        }

        if (showNegative && !this._negativeEffect) {
            // show positive since it's not displayed yet
            this._negativeEffect = this.addSpriteToCard(40, -60, 'card-effects', 1);
            this._negativeEffect.setAlpha(0.5);
            this._scene.add.tween({
                targets: [this._negativeEffect],
                alpha: 1,
                ease: 'Linear',
                yoyo: true,
                repeat: Infinity
            });
        } else if (!showNegative && this._negativeEffect) {
            // remove positive since it's displayed already
            this._negativeEffect.destroy();
        }
    }

    public remove() {
        this.deactivate();

        this._scene.add.tween({
            targets: this.allObjects,
            scaleX: 0.001,
            scaleY: 0.001,
            angle: 180,
            ease: 'Power2',
            duration: 1000,
            delay: 50,
            onComplete: () => {
                this.allObjects.forEach(o => o.destroy());
            }
        });
    }

    private updateHealth(health: number) {

        this._healthIndicator.setText(health.toString());
        if (health < 20) {
            this._healthIndicator.setColor(COLOR.RED);
        } else if (health < 40) {
            this._healthIndicator.setColor(COLOR.YELLOW);
        } else {
            this._healthIndicator.setColor(COLOR.GREEN);
        }
    }
}