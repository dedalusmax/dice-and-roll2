import { TextualService } from "../services/textual.service";
import { Styles } from "../models/styles";
import { LocationService } from "../services/location.service";

export class MapScene extends Phaser.Scene {

    private _options: any;
    private _controls: Phaser.Cameras.Controls.SmoothedKeyControl;
    private _uiCamera: Phaser.Cameras.Scene2D.Camera;
    private _minimap: Phaser.Cameras.Scene2D.Camera;
    private _map: Phaser.GameObjects.Image;

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
        // prepare the scene:

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

         // Set the camera bounds to be the size of the image
        this.cameras.main.setBounds(0, 0, this._map.width, this._map.height);

        this._uiCamera = this.cameras.add(0, 0, this._map.width, this._map.height);
        this._uiCamera.ignore(this._map);

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

        var size = new Phaser.Geom.Point(250, 250);
        this._minimap = this.cameras.add(this.cameras.main.width - size.x - 20, 20, size.x, size.y).setZoom(0.2);
        this._minimap.setBackgroundColor(0x002244);
    
        // quit battle button (visible only in skirmish mode)
        if (this._options.worldMap) {
            var exit = TextualService.createTextButton(this, 'Exit', 80, 20, Styles.battle.backButton, a => {
                var options = this._options;
                options.loadScene = 'MainMenuScene';
                this.scene.start('LoadingScene', { loadScene: 'MainMenuScene' });
            });
            this._minimap.ignore(exit);
            this.cameras.main.ignore(exit);
        }    

        this.displayLocations();
    }

    update(time, delta) {
        this._controls.update(delta);

        if (this.cameras.main) {
            this._minimap.scrollX = Phaser.Math.Clamp(this.cameras.main.scrollX + 500, 500, this._map.width);
            this._minimap.scrollY = Phaser.Math.Clamp(this.cameras.main.scrollY - 200, 500, this._map.height);    
        }
    }

    displayLocations() {
        if (this._options.worldMap) {
            // display only the general properties of the locations

            var circle = new Phaser.Geom.Circle(0, 0, 18);

            var graphics = this.add.graphics();
            graphics.fillStyle(0xff0000, 0.5);

            LocationService.getAll().forEach(location => {

                circle.setPosition(location.x, location.y);
                graphics.fillCircleShape(circle);
            });
        }
    }

    displayLocationInfo() {

    }
}