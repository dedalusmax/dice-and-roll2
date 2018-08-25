import { Location, LocationStatus, TerrainType } from "../models/location";
import { FONT_FAMILY } from "./styles";
import { Settings } from "./settings";

export class Pinpoint {

    private _sprite: Phaser.GameObjects.Sprite;
    private _selectedTween: Phaser.Tweens.Tween;

    private _infoObjects: Array<Phaser.GameObjects.GameObject>;
    private _infoCamera: Phaser.Cameras.Scene2D.Camera;

    events = new Phaser.Events.EventEmitter();

    constructor(private _scene: Phaser.Scene, public location: Location) {
        this._sprite = _scene.add.sprite(location.x, location.y, 'locations', location.status);
        this._sprite.setAlpha(0.5);
    }

    activate() {
        this._sprite.setFrame(this.location.status);
        this._scene.sound.add('card', { volume: Settings.sound.sfxVolume }).play();

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

        this._sprite.on('pointerdown', e => {
            this._scene.sound.add('page', { volume: Settings.sound.sfxVolume }).play();
            this.displayInfo();
        });
    }

    deactivate() {
        if (this._selectedTween && this._selectedTween.isPlaying()) {
            this._selectedTween.stop(0);
        }
        this._sprite.disableInteractive();
        this._sprite.removeAllListeners('pointerdown');
    }

    private displayInfo() {
        var width = 500;
        var height = 400;

        this._infoCamera = this._scene.cameras.add(
            this._scene.cameras.systems.canvas.width / 2 - width / 2, 
            this._scene.cameras.systems.canvas.height / 2 - height / 2, width, height);
        this._infoCamera.transparent = true;
        this._infoCamera.ignore(this._scene.children.getByName('map'));

        // this._infoCamera.ignore(this._scene.children.getByName('map'));
        this._infoObjects = [];

        var backgroundPaper = this._scene.add.sprite(0, 40, 'paper');
        backgroundPaper.setScale(width / backgroundPaper.width, height / backgroundPaper.height);
        backgroundPaper.setOrigin(0, 0);
        backgroundPaper.setAlpha(0);

        this._scene.cameras.main.ignore(backgroundPaper);

        this._scene.add.tween({
            targets: [backgroundPaper],
            ease: 'Quad.easeIn',
            duration: 600,
            y: 0,
            alpha: 1,
            onComplete: () => {
                this.displayInfoContent();
            }
        });

        this._infoObjects.push(backgroundPaper);

    }

    displayInfoContent() {

        var paper = this._infoObjects[0] as Phaser.GameObjects.Sprite;

        var title = this._scene.add.text(paper.x + 40, paper.y + 40, this.location.title, {
            font: '24px ' + FONT_FAMILY, fill: '#581B06', align: 'center'
        });
        title.setOrigin(0, 0);

        var desc = this._scene.add.text(paper.x + 40, paper.y + 80, this.location.description, {
            font: '14px ' + FONT_FAMILY, fill: '#000', wordWrap: { width: 400 }
        });
        title.setOrigin(0, 0);

        var terrain = this._scene.add.sprite(paper.x + 140, paper.y + 150, 'terrain-' + TerrainType[this.location.terrain]);
        terrain.setOrigin(0, 0);

        var back = this._scene.add.sprite(paper.x + 60, paper.y + 280, 'location-buttons', 0);
        back.setOrigin(0, 0);
        back.setInteractive({ cursor: 'pointer' });
        back.on('pointerdown', e => {
            this._scene.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
            this.closeLocationInfo();
        });
        var backTitle = this._scene.add.text(back.x + 10, back.y + 40, 'Back', {
            font: '24px ' + FONT_FAMILY, fill: '#581B06'
        });
        backTitle.setOrigin(0, 0);

        var alreadyVisited = this.location.status == LocationStatus.visited;
        var action = this._scene.add.sprite(paper.x + 360, paper.y + 280, 'location-buttons', alreadyVisited ? 2 : 1);
        action.setOrigin(0, 0);
        action.setInteractive({ cursor: 'pointer' });
        action.on('pointerdown', e => {
            this._scene.sound.add('battle', { volume: Settings.sound.sfxVolume }).play();
            this.closeLocationInfo().then(() => {
                this.events.emit('travel', !alreadyVisited);
            });
        });
        var actionTitle = this._scene.add.text(action.x, action.y + 40, alreadyVisited ? 'Travel' : 'Fight', {
            font: '24px ' + FONT_FAMILY, fill: '#581B06'
        });
        actionTitle.setOrigin(0, 0);

        this._infoObjects.push(title, desc, terrain, back, backTitle, action, actionTitle);
        this._scene.cameras.main.ignore([title, desc, terrain, back, backTitle, action, actionTitle]);
    }

    private closeLocationInfo() : Promise<any> {
        return new Promise((resolve, reject) => {
            this._scene.add.tween({
                targets: this._infoObjects,
                ease: 'Quad.easeIn',
                duration: 600,
                y: '+=20',
                alpha: 0,
                onComplete: () => {
                    // destroy data
                    for (var index in this._infoObjects) {
                        this._infoObjects[index].destroy();
                    };
                    // destroy camera
                    this._scene.cameras.remove(this._infoCamera);
                    // return back
                    resolve();
                }
            });
        });
    }
}