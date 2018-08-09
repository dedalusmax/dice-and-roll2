export class ImageService {
    
    static stretchAndFitImage(name: string, scene: Phaser.Scene) {

        var asset = scene.textures.get(name);
        var image = asset.getSourceImage(0);
        const canvas = scene.textures.game.canvas;
        
        // var x =  scene.add.sprite(canvas.width / 2, canvas.height / 2, name);
        // x.setDisplaySize(canvas.width, canvas.height);

        if (canvas.width !== image.width || canvas.height !== image.height) {
            var ratio = Math.min(canvas.width / image.width, canvas.height / image.height);
            var position = { x: (canvas.width - image.width * ratio) / 2, y: (canvas.height - image.height * ratio) / 2 };
            // var sprite = scene.add.sprite(position.x, position.y, name);
            var sprite = scene.add.sprite(canvas.width / 2, canvas.height / 2, name);
            sprite.setScale(ratio, ratio);
            return sprite;
        } else {
            return scene.add.sprite(0, 0, name);
        }
    }
}