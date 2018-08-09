export class TextualService {

    static createTextButton(scene: Phaser.Scene, text, x, y, style, soundset, action): Phaser.GameObjects.Text {

        var item = scene.add.text(x, y, text, style);
        item.setOrigin(0.5, 0.5);

        item.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, item.width, item.height), Phaser.Geom.Rectangle.Contains);

        item.on('pointerdown', e => {
            if (soundset) soundset.play();
            item.setStyle({ font: style.font, fill: '#DDDD00', align: style.align });
            if (action) action.call();
        });

        return item;
    };
}