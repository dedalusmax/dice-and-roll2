import { TextualService } from "../services/textual.service";
import { Styles, FONT_FAMILY } from "../models/styles";
import { LocationService } from "../services/location.service";
import { Pinpoint } from "../models/pinpoint";
import { LocationStatus, TerrainType } from "../models/location";
import { Assets } from "../models/assets";

export class MapScene extends Phaser.Scene {

    private _options: any;
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
    }

    preload(): void {
    }

    create(): void {
        // prepare the scene (must be in perfect order of the cameras that are added!):

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

        //this.displayControls();
        // this.input.on('pointermove', (pointer) => {



        // });

        // this.input.on('gameobjectover', function (pointer, gameObject) {

        //     gameObject.setTint(0xff0000);
        // });
    
        // this.input.on('gameobjectout', function (pointer, gameObject) {
    
        //     gameObject.clearTint();
        // });
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
                var options = this._options;
                options.loadScene = 'MainMenuScene';
                this.scene.start('LoadingScene', { loadScene: 'MainMenuScene' });
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
        if (this._options.worldMap) {
            // display only the general properties of the locations

            // var circle = new Phaser.Geom.Circle(0, 0, 18);
            // var graphics = this.add.graphics();
            // graphics.fillStyle(0xff0000, 0.5);
            
            LocationService.getAll().forEach(location => {
                // circle.setPosition(location.x, location.y);
                // graphics.fillCircleShape(circle);
                
                var pinpoint = new Pinpoint(this, location);
                pinpoint.events.on('travel', (fight) => {
                    this.travelTo(pinpoint, fight);
                });

                // var pinpoint = this.add.sprite(location.x, location.y, 'locations', 0);
                // pinpoint.setAlpha(0.5);

                // if (this._minimap) {
                //     this._minimap.ignore(pinpoint);
                // }

                // if (this._uiCamera) {
                //     this._uiCamera.ignore(pinpoint);
                // }

                this._pinpoints.push(pinpoint);
            });
        }

        //this.setPinpoint(this._pinpoints[0]);
    }

    displayParty() {
        var firstLocation = this._pinpoints[0];
        var party = this.physics.add.sprite(firstLocation.location.x, firstLocation.location.y, 'party');

        this.add.tween({
            targets: [ party ],
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
        //  this.cameras.main.startFollow(this._party, false, 0.2, 0.2, 250, 250);
        //this.cameras.main.startFollow(this._party, false);

        this.setPinpoint(firstLocation);
    }

    travelTo(pinpoint: Pinpoint, fight: boolean) {

        //this.physics.moveToObject(this._party, location, 200);

        // var collider = this.physics.add.overlap(this._party, location, party => {
        //     party.body.stop();
        //     this.physics.world.removeCollider(collider);

            this.add.tween({
                targets: [ this._party ],
                duration: 500,
                x: pinpoint.location.x,
                y: pinpoint.location.y,
                ease: 'Power2',
                onComplete: () => {

                    if (fight) {

                        var enemies = [];
                        pinpoint.location.enemies.forEach(e => {
                            enemies.push(Assets.monsters[e]);
                        });
            
                        this.scene.start('LoadingScene', { loadScene: 'BattleScene', terrain: TerrainType[pinpoint.location.terrain],
                        playerParty: [ Assets.characters.assasin, Assets.characters.musketeer, Assets.characters.automaton ], //, Assets.characters.musketeer, Assets.characters.assasin, Assets.characters.illusionist ],
                        enemyParty: enemies, 
                        playerMana: 100, enemyMana: 100
                    });
            
                    } else {
                        this.setPinpoint(pinpoint);
                    }
                }
            });
            // this._party.setPosition(location.x, location.y);

        // }, null);
    }

    setPinpoint(pinpoint: Pinpoint) {

        this._pinpoints.forEach(p => p.deactivate());

        pinpoint.location.connectsTo.forEach(l => {
            var connection = this._pinpoints.find(p => p.location.name === l);
            if (connection.location.status == LocationStatus.unknown) {
                connection.location.status = LocationStatus.available;
            }
            connection.activate();
            // connection.activate().then(sprite => {
            //     // connection.(connection);
            //     // this.travelTo(sprite);
            // });
        });

        // var firstLocation = this._pinpoints[0];
        // this.cameras.main.scrollX = firstLocation.x;
        // this.cameras.main.scrollY = firstLocation.y;        
        // this.cameras.main.startFollow(this._activeLocation, false, 0.5, 0.5);

        //this.cameras.main.setScroll(firstLocation.x, firstLocation.y);
    }
}