import { Location, LocationStatus, TerrainType } from "../models/location";
import { FONT_FAMILY } from "./styles";
import { Settings } from "./settings";

const TITLE_STYLE = { font: '24px ' + FONT_FAMILY, fill: '#581B06', align: 'center' },
    DESCRIPTION_STYLE =  { font: '16px ' + FONT_FAMILY, fill: '#000', wordWrap: { width: 400 }},
    BACK_STYLE = { font: '24px ' + FONT_FAMILY, fill: '#581B06' },
    ACTION_STYLE = { font: '24px ' + FONT_FAMILY, fill: '#581B06' },
    REWARD_STYLE = { font: '18px ' + FONT_FAMILY, fill: '#7F0000'};

export class Pinpoint {

    private _sprite: Phaser.GameObjects.Sprite;
    private _selectedTween: Phaser.Tweens.Tween;

    private _infoObjects: Array<Phaser.GameObjects.GameObject>;
    private _infoCamera: Phaser.Cameras.Scene2D.Camera;

    events = new Phaser.Events.EventEmitter();

    constructor(private _scene: Phaser.Scene, public location: Location) {
        this._sprite = _scene.add.sprite(location.x, location.y, 'locations', location.status);
        this._sprite.setAlpha(1);
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
        } else if (!this._selectedTween.isPlaying()) {
            this._selectedTween.restart();
        }

        this._sprite.setInteractive();

        this._sprite.on('pointerdown', e => {
            this._scene.sound.add('page', { volume: Settings.sound.sfxVolume }).play();
            this.displayInfo();
        });
    }

    deactivate() {
        this._sprite.setFrame(this.location.status);

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

        // ignore object from other cameras (map on the main, controls on the static)

        const map = this._scene.children.getByName('map'),
            minimapFrame = this._scene.children.getByName('minimapFrame'),
            exit = this._scene.children.getByName('exit');

        this._infoCamera.ignore([map, minimapFrame, exit]);

        this._infoObjects = [];

        var backgroundPaper = this._scene.add.sprite(0, 40, 'paper');
        backgroundPaper.setScale(width / backgroundPaper.width, height / backgroundPaper.height);
        backgroundPaper.setOrigin(0, 0);
        backgroundPaper.setAlpha(0);

        // ignore object on other cameras:
        this._scene.cameras.main.ignore(backgroundPaper);
        this._scene.cameras.getCamera('static').ignore(backgroundPaper);

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

        var title = this._scene.add.text(paper.x + 40, paper.y + 40, this.location.title, TITLE_STYLE);
        title.setOrigin(0, 0);

        var terrain = this._scene.add.sprite(paper.x + 130, paper.y + 160, 'terrain-' + TerrainType[this.location.terrain]);
        terrain.setOrigin(0, 0);

        var desc = this._scene.add.text(paper.x + 40, paper.y + 80, this.location.description, DESCRIPTION_STYLE);
        title.setOrigin(0, 0);

        var terrainTitle = this._scene.add.text(paper.x + 140, paper.y + 200, 'Terrain type:', DESCRIPTION_STYLE);
        terrainTitle.setOrigin(0, 0);

        var terrainType = this._scene.add.text(terrainTitle.x + 100, terrainTitle.y, TerrainType[this.location.terrain], DESCRIPTION_STYLE);
        terrainType.setOrigin(0, 0);

        var back = this._scene.add.sprite(paper.x + 60, paper.y + 280, 'location-buttons', 0);
        back.setOrigin(0, 0);
        back.setInteractive();
        back.on('pointerdown', e => {
            this._scene.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
            this.closeLocationInfo();
        });
        var backTitle = this._scene.add.text(back.x + 10, back.y + 40, 'Back', BACK_STYLE);
        backTitle.setOrigin(0, 0);

        var alreadyVisited = this.location.status == LocationStatus.visited;
        var action = this._scene.add.sprite(paper.x + 360, paper.y + 280, 'location-buttons', alreadyVisited ? 2 : 1);
        action.setOrigin(0, 0);
        action.setInteractive();
        action.on('pointerdown', e => {
            this._scene.sound.add('battle', { volume: Settings.sound.sfxVolume }).play();
            this.closeLocationInfo().then(() => {
                this.events.emit('travel', !alreadyVisited);
            });
        });
        var actionTitle = this._scene.add.text(action.x, action.y + 40, alreadyVisited ? 'Travel' : 'Fight', ACTION_STYLE);
        actionTitle.setOrigin(0, 0);

        let rewardTitle = this._scene.add.text(back.x + 110, back.y + 20, this.location.reward ? 'Additional Reward!' : '', REWARD_STYLE);
        rewardTitle.setOrigin(0, 0);

        this._infoObjects.push(title, desc, terrain, terrainTitle, terrainType, back, backTitle, action, actionTitle, rewardTitle);

        // ignore objects on other cameras
        this._scene.cameras.main.ignore(this._infoObjects);
        this._scene.cameras.getCamera('static').ignore(this._infoObjects);
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