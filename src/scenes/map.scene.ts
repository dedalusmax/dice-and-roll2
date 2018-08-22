import { TextualService } from "../services/textual.service";
import { Styles } from "../models/styles";
import { LocationService } from "../services/location.service";

export class MapScene extends Phaser.Scene {

    private _options: any;
    private _controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    private _uiCamera: Phaser.Cameras.Scene2D.Camera;
    private _minimap: Phaser.Cameras.Scene2D.Camera;
    private _map: Phaser.GameObjects.Image;

    private _activeLocation: Phaser.GameObjects.Sprite;

    private _pinpoints: Array<Phaser.GameObjects.Sprite> = [];

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
        this._map.setInteractive();

        // this.input.setDraggable(this._map);
        // this.input.dragTimeThreshold = 100;
        // this.input.dragDistanceThreshold = 10;

        // this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        //     this.cameras.main.scrollX += dragX;
        //     this.cameras.main.scrollY += dragY;
        // });

        this.displayLocations();

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
            // zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            // zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            acceleration: 0.06,
            drag: 0.0005,
            maxSpeed: 1.0
        };
    
        this._controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        this.displayMinimap();
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
        this._minimap.setBackgroundColor(0x002244);
    }

    displayControls() {
        this._uiCamera = this.cameras.add(0, 0, this._map.width, this._map.height);
        this._uiCamera.ignore(this._map);
        this._pinpoints.forEach(pinpoint => this._uiCamera.ignore(pinpoint));

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
                
                var pinpoint = this.physics.add.sprite(location.x, location.y, 'locations', 0);

                if (this._minimap) {
                    this._minimap.ignore(pinpoint);
                }

                if (this._uiCamera) {
                    this._uiCamera.ignore(pinpoint);
                }

                pinpoint.setInteractive({ cursor: 'pointer' });

                pinpoint.on('pointerdown', e => {
                    //pinpoint.setFrame(2);
                    this.travelTo(pinpoint);
                });

                pinpoint.on('pointerover', e => {
                    //pinpoint.setFrame(1);
                });
            
                pinpoint.on('pointerout', e => {
                    //pinpoint.setFrame(0);
                });

                this._pinpoints.push(pinpoint);
            });
        }

        this.selectLocation(this._pinpoints[0]);

        this.cameras.main.startFollow(this._activeLocation, false, 0.5, 0.5);
    }

    travelTo(location: Phaser.GameObjects.Sprite) {
        this.physics.moveToObject(this._activeLocation, location, 200);
    }

    selectLocation(location: Phaser.GameObjects.Sprite) {
        this._activeLocation = location;
            // var firstLocation = this._pinpoints[0];
            // this.cameras.main.scrollX = firstLocation.x;
            // this.cameras.main.scrollY = firstLocation.y;        
            // this.cameras.main.startFollow(this._activeLocation, false, 0.5, 0.5);

            //this.cameras.main.setScroll(firstLocation.x, firstLocation.y);
        }

    displayLocationInfo() {

    }
}