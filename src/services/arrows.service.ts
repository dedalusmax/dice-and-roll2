import { Settings } from "../models/settings";
import { Soundsets } from "../models/soundsets";

export enum ArrowOrientation {
    left,
    right,
    up,
    down
}

export class ArrowsService {

    static init(scene: Phaser.Scene) {
        scene.load.spritesheet('arrows', 'assets/common/arrows.png', { frameWidth: 100, frameHeight: 176 });
        scene.load.spritesheet('arrows-small', 'assets/common/arrows-small.png', { frameWidth: 30, frameHeight: 53 });
        scene.load.audio('click', 'assets/sound/effects/mechanical-clonk-1.mp3');
    }

    static createArrow(scene: Phaser.Scene, x: number, y: number, orientation: ArrowOrientation, clickEventHandler: any, disable?: boolean) {

        var arrow = scene.add.sprite(x, y, 'arrows-small', disable ? 1 : 0);

        switch (orientation) {
            case ArrowOrientation.left:
                arrow.setRotation(4.71239); // 270 degrees
                break;
            case ArrowOrientation.right:
                arrow.setRotation(1.5708); // 90 degrees
                break;
            case ArrowOrientation.up:
                // do nothing, original position
                break;
            case ArrowOrientation.down:
                arrow.setRotation(3.14159); // 180 degrees
                break;
        }

        arrow.setInteractive();
        arrow.on('pointerdown', e => {
            var sound = scene.sound.add('click', { volume: Settings.sound.sfxVolume });
            sound.play();
            clickEventHandler.call(this);
        });

        return arrow;
    }

    static disableArrow(arrow: Phaser.GameObjects.Sprite) {
        // arrow.disableInteractive();
        // arrow.removeAllListeners('pointerdown');
        arrow.setFrame(1);
    }

    static enableArrow(arrow: Phaser.GameObjects.Sprite) {
        // arrow.setInteractive();
        arrow.setFrame(0);
    }
}