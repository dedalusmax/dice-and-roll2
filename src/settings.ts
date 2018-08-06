export class Settings {

    private static _sound = {
        musicVolume: 1
    };

    public static get sound() {
        return this._sound;
    }
    public static set sound(value) {
        this._sound = value;
    }
}