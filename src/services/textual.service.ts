import { Settings } from "../models/settings";

export class TextualService {

    static createTextButton(scene: Phaser.Scene, text, x, y, style, action): Phaser.GameObjects.Text {

        var item = scene.add.text(x, y, text, style);
        item.setOrigin(0.5, 0.5);

        item.setInteractive();
        item.on('pointerdown', e => {
            scene.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
            item.setStyle({ font: style.font, fill: '#DDDD00', align: style.align });
            if (action) action.call();
        });

        return item;
    };
}