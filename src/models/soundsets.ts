import { Settings } from "./settings";

export class Soundsets {

    constructor(private scene: Phaser.Scene) {
    }

    public static sounds: any = {};

    create(name: string, sounds: Array<string>) {
        Soundsets.sounds[name] = new SoundItem(name, sounds, this.scene);
    }
}

export class SoundItem {

    _sounds: Array<Phaser.Sound.BaseSound>;

    constructor(private key: string, sounds: Array<string>, scene: Phaser.Scene) {

        this._sounds = [];
        sounds.forEach(sound => {
            this._sounds.push(scene.sound.add(sound));
        });
    };

    play() {
        var randomSound: Phaser.Sound.BaseSound = Phaser.Math.RND.pick(this._sounds);
        randomSound.play('', { volume: Settings.sound.sfxVolume });
    };
}
