import { Combatant, CombatantSide } from "./combatant";
import { Styles } from "./styles";

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
    private _activeEventEmitter: Phaser.Events.EventEmitter;

    private get allObjects(): Array<Phaser.GameObjects.GameObject> {
        return [
            this._mainSprite, this._factionEmblem, this._attackEmblem, this._shieldEmblem,
            this._attackText, this._defenseText, this._image, this._healthIndicator
        ];
    }

    constructor(private _scene: Phaser.Scene, private _combatant: Combatant, private _position: Phaser.Geom.Point) {

        this._canvas = _scene.textures.game.canvas;

        // the main sprite, the card background
        this._mainSprite = _scene.add.sprite(_position.x, _position.y, 'cards/front');
        this._mainSprite.setScale(0.30, 0.32);

        // the faction emblem, top right corner
        this._factionEmblem = this.addSpriteToCard(51, -74, _combatant.side === CombatantSide.Friend ? 'cards/faction-1' : 'cards/faction-2', 0.3);

        // the attack emblem, bottom left corner
        this._attackEmblem = this.addSpriteToCard(-51, 74, 'cards/emblem-sword');

        this._attackText = this.addTextToCard(-50, 71, _combatant.attack.toString());

        // the defense emblem, bottom right corner
        this._shieldEmblem = this.addSpriteToCard(55, 74, 'cards/emblem-shield');

        this._defenseText = this.addTextToCard(55, 73, _combatant.defense.toString());

        if ( _combatant.side === CombatantSide.Friend) {
            this._image = this.addSpriteToCard(0, 0, 'characters/' + _combatant.name, 0.05);
        } else {
            this._image = this.addSpriteToCard(0, 0, 'monsters/' + _combatant.name, 0.4);
        }
    
        this._healthIndicator = this.addTextToCard(0, 60, _combatant.health.toString());
        this._healthIndicator.setColor('#009900');

        // main sprite imput simply delegates to custom group imput
        // this._mainSprite.setInteractive();
        // this._mainSprite.events.onInputDown.add(function () {
        //     this.customEvents.onInputDown.dispatch(this);
        // }, this);
        // this._mainSprite.events.onKilled.add(this.combatantKilled, this);
    }

    private addSpriteToCard(left: number, top: number, texture, scale?: number) {
        var x = this._position.x + left;
        var y = this._position.y + top;
        var sprite = this._scene.add.sprite(x, y, texture);
        sprite.setDisplayOrigin(this._position.x, this._position.y);
        sprite.setScale(scale || 0.25);
        sprite.setOrigin(0.5, 0.5);
        return sprite;
    }

    private addTextToCard(left: number, top: number, text: string) {
        var x = this._position.x + left;
        var y = this._position.y + top;
        var textObject = this._scene.add.text(x, y, text, Styles.battle.indicator);
        textObject.setDisplayOrigin(this._position.x, this._position.y);
        // bitmapText.setScale(0.3);
        textObject.setOrigin(0.5, 0.5);
        return textObject;
    }

    activate(onClickCallback?: any) {

        if (!this._activeTween) {
            this._activeTween = this._scene.tweens.add({
                targets: this.allObjects,
                y: '-=24',
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: Infinity
            });
        }

        if (onClickCallback) {
            this._image.setInteractive();
            if (!this._activeEventEmitter) {
                this._activeEventEmitter = this._image.on('pointerdown', e => {
                    onClickCallback.call();
                });   
            }
        }
    }
}