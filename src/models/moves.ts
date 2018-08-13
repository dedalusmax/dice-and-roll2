import { FONT_FAMILY } from "./styles";
import { Special } from "./special";
import { Weapon } from "./weapon";

const SPECIAL_SIZE = 100,
    SPECIAL_ICON_SIZE = 100,
    SPECIAL_NAME_STYLE = { font: '18px ' + FONT_FAMILY, fill: '#7F5935', align: 'center'},
    SPECIAL_DESCRIPTION_STYLE = { font: '14px ' + FONT_FAMILY, fill: '#7F460F', align: 'center'};

export class Moves {

    private _canvas: HTMLCanvasElement;
    private _nameText: Phaser.GameObjects.Text;
    private _descriptionText: Phaser.GameObjects.Text;
    private _images: Array<Phaser.GameObjects.Sprite>;
    private _activeTween: Phaser.Tweens.Tween;

    // constructs with a weapon as a first (default) move
    constructor(private _scene: Phaser.Scene, texture, name, description) {

        this._canvas = _scene.textures.game.canvas;
        this._images = [];

        this._nameText =_scene.add.text(this._canvas.width / 2, this._canvas.height / 2 + 25, name, SPECIAL_NAME_STYLE);
        this._nameText.setOrigin(0.5, 0);
        this._descriptionText = _scene.add.text(this._canvas.width / 2, this._canvas.height / 2 + 45, description, SPECIAL_DESCRIPTION_STYLE);
        this._descriptionText.setOrigin(0.5, 0);
    }

    addWeapon(weapon: Weapon, movesCount: number) {

        var leftMostPosition = (this._canvas.width - ((movesCount - 1) * SPECIAL_ICON_SIZE) - ((movesCount - 1) * 10)) / 2,
            y = this._canvas.height / 2 - 10;
        
        this.addSprite(leftMostPosition, y, 'cards/emblem-' + weapon.type.toLowerCase());  
    }

    addSpecials(specials: Array<Special>, movesCount: number) {
        var leftMostPosition = (this._canvas.width - ((movesCount - 1) * SPECIAL_ICON_SIZE) - ((movesCount - 1) * 10)) / 2,
            y = this._canvas.height / 2 - 10;

        specials.forEach((special, i) => {
            var index = i + 1;
            var x = leftMostPosition + (index * SPECIAL_ICON_SIZE) + ((index - 1) * 10);

            this.addSprite(x, y, 'specials/' + special.name);  
        });
    }
    
    private addSprite(x: number, y: number, texture: string) {
       
        var image = this._scene.add.sprite(x, y, texture);

        var initialScale = 0.1 * SPECIAL_ICON_SIZE / image.height,
            finalScale = SPECIAL_ICON_SIZE / image.height;

        image.setScale(0.5);

        image.setInteractive();
        image.on('pointerdown', e => {
            
        });

        // special.inputEnabled = true;
        // special.events.onInputDown.removeAll();
        // special.events.onInputDown.add(this.selectMove, this);

        // special.executed.addOnce(this.deactivate, this);

        // special.tweenMove = this.game.add.tween(special).to({ angle: 0, x: x, y: y }, 500, Phaser.Easing.Bounce.Out).start();
        // special.tweenScale = this.game.add.tween(special.scale).to({ x: finalScale, y: finalScale }, 500, Phaser.Easing.Bounce.Out).start();

        this._images.push(image);
    }

    public selectMove(index: number, name: string, description: string) {
        
        this._nameText.setText(name);
        this._descriptionText.setText(description);
        this._activeTween = this._scene.add.tween({
            targets: [ this._images[index] ],
            ease: 'Sine.easeInOut',
            duration: 700,
            scaleX: '-=.2',
            scaleY: '-=.2',
            angle: '-=30',
            yoyo: true,
            repeat: Infinity
        });
    }

    public resetMoves() {
        if (this._activeTween && this._activeTween.isPlaying()) {
            this._activeTween.stop();
        }
    }

    public close() {
        this.resetMoves();
        
        this._scene.add.tween({
            targets: this._images,
            ease: 'Linear',
            duration: 400,
            alpha: 0
        });

        this._scene.add.tween({
            targets: [ this._nameText, this._descriptionText ],
            ease: 'Linear',
            duration: 400,
            alpha: 0
        });

        // destroy data
        this._images.forEach(i => {
            i.destroy();
        });
        this._nameText.destroy();
        this._descriptionText.destroy();
    }
}