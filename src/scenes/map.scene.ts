import { TextualService } from "../services/textual.service";
import { Styles } from "../models/styles";
import { LocationService } from "../services/location.service";
import { Pinpoint } from "../models/pinpoint";
import { LocationStatus, TerrainType } from "../models/location";
import { Assets } from "../models/assets";
import { Party } from "../models/party";
import { Settings } from "../models/settings";
import { MapSceneOptions, BattleSceneOptions } from "./scene-options";
import { SceneService } from "../services/scene.service";
import { BattleScene } from "./battle.scene";

export class MapScene extends Phaser.Scene {

    private _options: MapSceneOptions;
    private _ambientMusic: Phaser.Sound.BaseSound;

    private _controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    private _uiCamera: Phaser.Cameras.Scene2D.Camera;
    private _minimap: Phaser.Cameras.Scene2D.Camera;
    private _map: Phaser.GameObjects.Image;

    private _party: Phaser.GameObjects.Sprite;
    private _pinpoints: Array<Pinpoint> = [];

    constructor() {
        super({
            key: "MapScene"
        });
    }

    init(data): void {
        this._options = data;
        this._pinpoints = [];
        this._party = null;

        if (this._options.worldMap) {

            // TODO: this is just for testing the map with battles

            var party = new Party();
            party.add(Assets.characters.musketeer);
            party.add(Assets.characters.assasin);
            party.add(Assets.characters.illusionist);
                
            this._options.playerParty = party;
        }
    }

    preload(): void {
    }

    create(): void {
        // prepare the scene (must be in perfect order of the cameras that are added!):
        this.cameras.main.fadeIn(1000);

        // check if music is enabled
        if (Settings.sound.musicVolume > 0) {
            // introductory fade in of theme music
            this.sound.stopAll();
        }
        
        // background image 
        this._map = this.add.image(0, 0, 'map');
        this._map.setOrigin(0);
        this._map.setName('map');

        //this._map.setInteractive();

        // this.input.setDraggable(this._map);
        // this.input.dragTimeThreshold = 100;
        // this.input.dragDistanceThreshold = 10;

        // this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        //     this.cameras.main.scrollX += dragX;
        //     this.cameras.main.scrollY += dragY;
        // });
        this.displayMinimap();

        this.displayLocations();
        this.displayParty();

         // Set the camera bounds to be the size of the image
        this.cameras.main.setBounds(0, 0, this._map.width, this._map.height);
        
        //  Camera controls
        var cursors = this.input.keyboard.createCursorKeys();

        var controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            acceleration: 0.06,
            drag: 0.0005,
            maxSpeed: 1.0
        };
    
        this._controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    }

    displayMinimap() {
        var size = new Phaser.Geom.Point(250, 250);
        this._minimap = this.cameras.add(this.cameras.main.width - size.x - 20, 20, size.x, size.y).setZoom(0.2);
    }

    displayControls() {
        this._uiCamera = this.cameras.add(0, 0, this._map.width, this._map.height);
        this._uiCamera.ignore(this._map);
        //this._pinpoints.forEach(pinpoint => this._uiCamera.ignore(pinpoint));

        // quit battle button (visible only in skirmish mode)
        if (this._options.worldMap) {
            var exit = TextualService.createTextButton(this, 'Exit', 80, 20, Styles.battle.backButton, a => {
                SceneService.backToMenu(this);
            });
            if (this._minimap) {
                this._minimap.ignore(exit);
            }
            this.cameras.main.ignore(exit);
        }    
    }

    update(time, delta) {
        this._controls.update(delta);

        if (this.cameras.main && this._minimap) {
            this._minimap.scrollX = Phaser.Math.Clamp(this.cameras.main.scrollX + 500, 500, this._map.width);
            this._minimap.scrollY = Phaser.Math.Clamp(this.cameras.main.scrollY - 200, 500, this._map.height);    
        }
    }

    displayLocations() {
        LocationService.getAll().forEach(location => {

            if (this._options.playerParty.alreadyThere(location)) {
                location.status = LocationStatus.visited;
            }

            var pinpoint = new Pinpoint(this, location);
            pinpoint.events.on('travel', (fight) => {
                this.travelTo(pinpoint, fight);
            });

            this._pinpoints.push(pinpoint);
        });
    }

    displayParty() {
        if (!this._options.playerParty.activeLocation) {
            // appearance of the party from the sea
            this._ambientMusic = this.sound.add('ambient-arrival', { volume: Settings.sound.sfxVolume });
            this._ambientMusic.play('', { loop: true });

            var firstLocation = this._pinpoints[0];
            var party = this.physics.add.sprite(firstLocation.location.x - 500, firstLocation.location.y - 200, 'party');
            party.setAlpha(0);
            this.cameras.main.startFollow(party, false, 0.5, 0.5);

            this.add.tween({
                targets: [party],
                ease: 'Linear',
                duration: 1600,
                x: firstLocation.location.x,
                y: firstLocation.location.y,
                alpha: 1,
                onComplete: () => {
                    // the party has come to the lighthouse
                    this.cameras.main.stopFollow();

                    this.time.delayedCall(500, () => {
                        this.cameras.main.flash();
                    }, null, this);

                    this.add.tween({
                        targets: [party],
                        ease: 'Sine.easeInOut',
                        duration: 700,
                        scaleX: '-=.15',
                        scaleY: '-=.15',
                        angle: '-=10',
                        yoyo: true,
                        repeat: Infinity
                    });

                    if (this._uiCamera) {
                        this._uiCamera.ignore(party);
                    }

                    this._party = party;
                    this.setPinpoint(firstLocation);
                }
            });
        } else {
            var location = this._options.playerParty.activeLocation;
            var party = this.physics.add.sprite(location.x, location.y, 'party');

            this.add.tween({
                targets: [party],
                ease: 'Sine.easeInOut',
                duration: 700,
                scaleX: '-=.15',
                scaleY: '-=.15',
                angle: '-=10',
                yoyo: true,
                repeat: Infinity
            });

            this.cameras.main.startFollow(party, false, 0.5, 0.5);
            this.cameras.main.stopFollow();

            this._party = party;

            var pinpoint = this._pinpoints.find(p => p.location.name === location.name);
            this.setPinpoint(pinpoint);
        }
    }

    travelTo(pinpoint: Pinpoint, fight: boolean) {

        //this.physics.moveToObject(this._party, location, 200);
        this.cameras.main.startFollow(this._party, false, 0.5, 0.5);

        // var collider = this.physics.add.overlap(this._party, location, party => {
        //     party.body.stop();
        //     this.physics.world.removeCollider(collider);

            this.add.tween({
                targets: [ this._party ],
                duration: 1200,
                delay: 200,
                x: pinpoint.location.x,
                y: pinpoint.location.y,
                ease: 'Power2',
                onComplete: () => {
                    this.cameras.main.stopFollow();

                    if (fight) {

                        var enemies = [];
                        pinpoint.location.enemies.forEach(e => {
                            enemies.push(Assets.monsters[e]);
                        });
            
                        this._options.playerParty.startFight(pinpoint.location);

                        var options = new BattleSceneOptions();
                        options.terrain = TerrainType[pinpoint.location.terrain];
                        options.playerParty = this._options.playerParty;
                        options.enemyParty = enemies;
                        options.enemyMana = 100;

                        SceneService.run(this, new BattleScene(), false, options);
                    } else {
                        this.setPinpoint(pinpoint);
                    }
                }
            });
            // this._party.setPosition(location.x, location.y);

        // }, null);
    }

    setPinpoint(pinpoint: Pinpoint) {

        pinpoint.location.status = LocationStatus.visited;

        this._pinpoints.forEach(p => p.deactivate());

        pinpoint.location.connectsTo.forEach(l => {
            var connection = this._pinpoints.find(p => p.location.name === l);
            if (connection.location.status == LocationStatus.unknown) {
                connection.location.status = LocationStatus.available;
            }
            connection.activate();
        });

        if (pinpoint.location.terrain !== TerrainType.start) {
            this._ambientMusic.stop();
            this._ambientMusic = this.sound.add('ambient-' + TerrainType[pinpoint.location.terrain], { volume: Settings.sound.sfxVolume });
            this._ambientMusic.play('', { loop: true });
        }

        // store current party stats, along with the locations visited
        localStorage.setItem('dice-and-roll', JSON.stringify(this._options.playerParty));
    }
}