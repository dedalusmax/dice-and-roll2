import { Combatant, CombatantSide } from "./combatant";
import { Styles, FONT_FAMILY } from "./styles";

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
    private _factionEmblem: Phaser.GameObjects.Sprite;
    private _attackEmblem: Phaser.GameObjects.Sprite;
    private _shieldEmblem: Phaser.GameObjects.Sprite;
    private _attackText: Phaser.GameObjects.Text;
    private _defenseText: Phaser.GameObjects.Text;
    private _image: Phaser.GameObjects.Sprite;
    private _healthIndicator: Phaser.GameObjects.Text;
    private _activeTween: Phaser.Tweens.Tween;

    private get allObjects(): Array<Phaser.GameObjects.GameObject> {
        return [
            this._mainSprite, this._image, this._healthIndicator
            // this._mainSprite, this._factionEmblem, this._attackEmblem, this._shieldEmblem,
            // this._attackText, this._defenseText, this._image, this._healthIndicator
        ];
    }

    constructor(private _scene: Phaser.Scene, combatant: Combatant, private _position: Phaser.Geom.Point) {

        this._canvas = _scene.textures.game.canvas;

        // the main sprite, the card background
        this._mainSprite = _scene.add.sprite(_position.x, _position.y, 'cards/card');
        //this._mainSprite.setScale(0.08, 0.08);
        
        // var shadow = _scene.add.sprite(_position.x, _position.y, 'cards/card');
        // shadow.setScale(0.09, 0.09);
        // shadow.setTint(0x000000, 0x000000, 0x000000, 0x000000);
        //shadow.setBlendMode(Phaser.BlendModes.DARKEN);
        //shadow.setDepth(this._mainSprite.depth - 1);

        // the faction emblem, top right corner
        //this._factionEmblem = this.addSpriteToCard(51, -74, combatant.side === CombatantSide.Friend ? 'cards/faction-1' : 'cards/faction-2', 0.3);

        // the attack emblem, bottom left corner
        //this._attackEmblem = this.addSpriteToCard(-51, 74, 'cards/emblem-sword');

        //this._attackText = this.addTextToCard(-50, 71, combatant.attack.toString());

        // the defense emblem, bottom right corner
        //this._shieldEmblem = this.addSpriteToCard(55, 74, 'cards/emblem-shield');

        //this._defenseText = this.addTextToCard(55, 73, combatant.defense.toString());

        if ( combatant.side === CombatantSide.Friend) {
            this._image = this.addSpriteToCard(0, 0, 'characters/' + combatant.name + '-head');
        } else {
            this._image = this.addSpriteToCard(0, 0, 'monsters/' + combatant.name, 0.4);
        }
    
        this._healthIndicator = this.addTextToCard(0, 60, combatant.health.toString(), 
        { font: '18px ' + FONT_FAMILY, fill: '#009900', align: 'center', stroke: '#000000', strokeThickness: 2 });
        this._healthIndicator.setShadow(0, 0, '#FFFFFF', 4, true, true);
    }

    private addSpriteToCard(left: number, top: number, texture, scale?: number) {
        var x = this._position.x + left;
        var y = this._position.y + top;
        var sprite = this._scene.add.sprite(x, y, texture);
        sprite.setDisplayOrigin(this._position.x, this._position.y);
        if (scale) 
            sprite.setScale(scale || 0.25);
        sprite.setOrigin(0.5, 0.5);
        return sprite;
    }

    private addTextToCard(left: number, top: number, text: string, style?: any) {
        var x = this._position.x + left;
        var y = this._position.y + top;
        var textObject = this._scene.add.text(x, y, text, style || Styles.battle.indicator);
        textObject.setDisplayOrigin(this._position.x, this._position.y);
        textObject.setOrigin(0.5, 0.5);
        return textObject;
    }

    select() {
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
    }

    activate(combatant: Combatant): Promise<Combatant> {
        this.select();
        this._image.setInteractive();
        
        return new Promise<Combatant>((resolve, reject) => {
            this._image.on('pointerdown', e => {
                resolve(combatant);
            });
        });
    }

    deactivate() {
        if (this._activeTween && this._activeTween.isPlaying()) {
            this._activeTween.stop(0);
        }
        this._image.disableInteractive();
        this._image.removeAllListeners('pointerdown');
     }

     showDamage(amount: number, health: number) {
        var damageText = this.addTextToCard(0, 0, amount.toString(), { font: '65px ' + FONT_FAMILY, fill: '#ff0000', align: 'center' });
        this._scene.add.tween({
            targets: damageText,
            alpha: 0,
            y: damageText.y - 60,
            ease: 'Linear',
            duration: 600,
            onComplete: () => {
                damageText.destroy();
                this.updateHealth(health);
            }
        });
    }

    remove() {
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