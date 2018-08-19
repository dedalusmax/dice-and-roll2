import { FONT_FAMILY } from "./styles";
import { Special } from "./special";
import { Weapon } from "./weapon";
import { Move } from "./move";
import { Settings } from "./settings";

const SPECIAL_SIZE = 100,
    SPECIAL_ICON_SIZE = 100,
    SPECIAL_NAME_STYLE = { font: '20px ' + FONT_FAMILY, fill: '#7F5935', align: 'center'},
    SPECIAL_DESCRIPTION_STYLE = { font: '16px ' + FONT_FAMILY, fill: '#7F460F', align: 'center'},
    SPECIAL_MANA_STYLE = { font: '16px ' + FONT_FAMILY, fill: '#13004F', align: 'center'};

export class Moves {

    private _canvas: HTMLCanvasElement;
    
    private _nameText: Phaser.GameObjects.Text;
    private _descriptionText: Phaser.GameObjects.Text;
    private _manaCostText: Phaser.GameObjects.Text;

    private _images: Array<Phaser.GameObjects.Sprite>;
    
    private _activeTween: Phaser.Tweens.Tween;

    events = new Phaser.Events.EventEmitter();

    // constructs with a weapon as a first (default) move
    constructor(private _scene: Phaser.Scene, name, description) {

        this._canvas = _scene.textures.game.canvas;
        this._images = [];

        this._nameText =_scene.add.text(this._canvas.width / 2, this._canvas.height / 2 + 25, name, SPECIAL_NAME_STYLE);
        this._nameText.setOrigin(0.5, 0);
        this._descriptionText = _scene.add.text(this._canvas.width / 2, this._canvas.height / 2 + 45, description, SPECIAL_DESCRIPTION_STYLE);
        this._descriptionText.setOrigin(0.5, 0);
        this._manaCostText = _scene.add.text(this._canvas.width / 2, this._canvas.height / 2 + 63, '', SPECIAL_MANA_STYLE);
        this._manaCostText.setOrigin(0.5, 0);
    }

    addMoves(weapon: Weapon, specials: Array<Special>) {

        var movesCount = 1 + specials.length;

        var leftMostPosition = (this._canvas.width - ((movesCount - 1) * SPECIAL_ICON_SIZE) - ((movesCount - 1) * 10)) / 2;
        var y = this._canvas.height / 2 - 20;

        this.addAction(leftMostPosition, y, 'cards/emblem-' + weapon.type.toLowerCase(), 0);

        specials.forEach((special, i) => {
            var index = i + 1;
            var x = leftMostPosition + (index * SPECIAL_ICON_SIZE) + ((index - 1) * 10);

            var specialCard = this._scene.add.sprite(x, y, 'special-card');
            this._images.push(specialCard);

            this.addAction(x, y, 'specials/' + special.name, i + 1);
        });
    }
    
    private addAction(x: number, y: number, texture: string, index: number) {
       
        var image = this._scene.add.sprite(x, y, texture);

        image.setInteractive();
        image.on('pointerdown', e => {
            this.resetMoves();
            this.events.emit('moveClicked', index);
        });

        this._images.push(image);
    }

    public removeSpecialMoves() {

        this._scene.add.tween({
            targets: this._images.filter((i, index) => index > 0),
            ease: 'Linear',
            duration: 400,
            alpha: 0,
            onComplete: () => {
                // destroy special images
                this._images.forEach((image, index) => {
                    if (index > 0) {
                        image.destroy();
                    }
                });
            }
        });

        // reset texts
        this._nameText.setText('');
        this._descriptionText.setText('');
        this._manaCostText.setText('');
    }

    public selectMove(index: number, name: string, description: string, manaCost?: number, manaLeft?: number) {
        
        this._nameText.setText(name);
        this._descriptionText.setText(description);
        
        if (manaCost) {
            this._manaCostText.setText('Mana cost: ' + manaCost);
            if (manaCost <= manaLeft) {
                this._scene.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
            } else {
                this._scene.sound.add('closed', { volume: Settings.sound.sfxVolume }).play();
            }
        } else {
            this._manaCostText.setText('');
            this._scene.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
        }
        
        this._activeTween = this._scene.add.tween({
            targets: [ this._images[index == 0 ? 0 : index * 2] ],
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
            targets: [ this._nameText, this._descriptionText, this._manaCostText ],
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
        this._manaCostText.destroy();
    }
}