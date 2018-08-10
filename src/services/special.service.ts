import { Special } from "../models/special";
import { Assets } from "../models/assets";

export class SpecialService {

    static create(scene: Phaser.Scene, asset, key, isWeapon) {
        if (isWeapon) {
            return SpecialService.assembleSpecialFromWeapon(scene, asset, key);
        } else {
            //return assembleSpecial(game, character, key);
        }
    }

    private static assembleSpecialFromWeapon(scene: Phaser.Scene, asset, weapon) {

        var data = Assets.specials[asset.type.toLowerCase() + '_attack'];
        var special = new Special(scene, asset, 'cards/emblem-' + weapon.type.toLowerCase(), data);

        // special.getTargets = targeting[data.targetType];
        // special.execute = execution[data.executionType] || executeCallbacks[key];

        return special;
    };

    private static assembleSpecial(scene: Phaser.Scene, asset, key) {

        var data = Assets.specials[key];
        var special = new Special(scene, asset, 'specials/' + key, data);

        // special.getTargets = targeting[data.targetType];
        // special.execute = execution[data.executionType] || executeCallbacks[key];

        return special;
    };
}
