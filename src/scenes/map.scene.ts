import { TextualService } from "../services/textual.service";
import { Styles } from "../models/styles";

export class MapScene extends Phaser.Scene {

    private _options: any;
    private _controls: any;

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
        var map = this.add.image(0, 0, 'map');
        map.setOrigin(0);

         // Set the camera bounds to be the size of the image
        this.cameras.main.setBounds(0, 0, 4259, 3301);

        //  Camera controls
        var cursors = this.input.keyboard.createCursorKeys();

        var controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            acceleration: 0.06,
            drag: 0.0005,
            maxSpeed: 1.0
        };
    
        this._controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    
        // quit battle button (visible only in skirmish mode)
        if (this._options.skirmish) {
            TextualService.createTextButton(this, 'Exit', 80, 20, Styles.battle.backButton, a => {
                var options = this._options;
                options.loadScene = 'MainMenuScene';
                this.scene.start('LoadingScene', { loadScene: 'MainMenuScene' });
            });
        }
    }

    update(time, delta) {
        this._controls.update(delta);
    }
}