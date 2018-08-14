import { FONT_FAMILY } from "./styles";
import { Special } from "./special";
import { Weapon } from "./weapon";
import { Move } from "./move";

const SPECIAL_SIZE = 100,
    SPECIAL_ICON_SIZE = 100,
    SPECIAL_NAME_STYLE = { font: '20px ' + FONT_FAMILY, fill: '#7F5935', align: 'center'},
    SPECIAL_DESCRIPTION_STYLE = { font: '16px ' + FONT_FAMILY, fill: '#7F460F', align: 'center'};

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

        this._nameText =_scene.add.text(this._canvas.width / 2, this._canvas.height / 2 + 35, name, SPECIAL_NAME_STYLE);
        this._nameText.setOrigin(0.5, 0);
        this._descriptionText = _scene.add.text(this._canvas.width / 2, this._canvas.height / 2 + 55, description, SPECIAL_DESCRIPTION_STYLE);
        this._descriptionText.setOrigin(0.5, 0);
    }

    addMoves(weapon: Weapon, specials: Array<Special>): Promise<Move> {
        var movesCount = 1 + specials.length;
        return new Promise<Move>((resolve, reject) => {

            var leftMostPosition = (this._canvas.width - ((movesCount - 1) * SPECIAL_ICON_SIZE) - ((movesCount - 1) * 10)) / 2;
            var y = this._canvas.height / 2 - 10;

            this.addAction(leftMostPosition, y, 'cards/emblem-' + weapon.type.toLowerCase(), weapon, 0, resolve);  

            specials.forEach((special, i) => {
                var index = i + 1;
                var x = leftMostPosition + (index * SPECIAL_ICON_SIZE) + ((index - 1) * 10);
    
                var specialCard = this._scene.add.sprite(x, y, 'cards/special-card');
    
                this.addAction(x, y, 'specials/' + special.name, special, i + 1, resolve);  
            });

        });
    }
    
    private addAction(x: number, y: number, texture: string, move: Move, index: number, resolve: any) {
       
        var image = this._scene.add.sprite(x, y, texture);

        image.setInteractive();
        image.on('pointerdown', e => {
            this.resetMoves();
            this.selectMove(index, move.title, move.description);
            resolve(move);
        });

        this._images.push(image);
    }

    public selectMove(index: number, name: string, description: string) {
        
        this._nameText.setText(name);
        this._descriptionText.setText(description);
        this._activeTween = this._scene.add.tween({
            targets: [ this._images[index] ],
            ease: 'Sine.easeInOut',
            duration: 700,
            scaleX: '-=.15',
            scaleY: '-=.15',
            // y: '-=10',
            // angle: '+=30',
            yoyo: true,
            repeat: Infinity
        });
    }

    public resetMoves() {
        if (this._activeTween && this._activeTween.isPlaying()) {
            this._activeTween.stop(0);
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