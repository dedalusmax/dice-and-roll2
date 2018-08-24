import { Location } from "../models/location";

export class Pinpoint {

    private _sprite: Phaser.GameObjects.Sprite;
    private _selectedTween: Phaser.Tweens.Tween;

    constructor(private _scene: Phaser.Scene, public location: Location) {
        this._sprite = _scene.add.sprite(location.x, location.y, 'locations', location.status);
        this._sprite.setAlpha(0.5);
    }

    activate(): Promise<Pinpoint> {
        this._sprite.setFrame(this.location.status);

        if (!this._selectedTween) {
            this._selectedTween = this._scene.tweens.add({
                targets: [this._sprite],
                duration: 600,
                scaleX: '+=0.25',
                scaleY: '+=0.25',
                alpha: '+=0.2',
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: Infinity
            });
        }

        this._sprite.setInteractive({ cursor: 'pointer' });

        return new Promise<Pinpoint>((resolve, reject) => {
            this._sprite.on('pointerdown', e => {
                resolve(this);
            });
        });
    }

    deactivate() {
        if (this._selectedTween && this._selectedTween.isPlaying()) {
            this._selectedTween.stop(0);
        }
        this._sprite.disableInteractive();
        this._sprite.removeAllListeners('pointerdown');
    }
}