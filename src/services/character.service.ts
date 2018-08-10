import { Combatant, Team } from "../models/combatant";
import { Assets } from "../models/assets";
import { SpecialService } from "./special.service";

export class CharacterService {

    static create(scene: Phaser.Scene, asset, position: Phaser.Geom.Point) {

        var character = new Combatant(scene, Team.Friend, position, 'characters/' + asset.name);

        character.setStats(asset);
        // TODO:RC character.type = stats.type;

        // load the selected weapon - every character MUST have a weapon defined to fight with!
        var weapon = Assets.weapons[asset.weapon];
        //var attack = SpecialService.create(game, character, weapon, true);
        //attack.name = weapon.title;

        //character.specials.add(attack);

        for (var index = 0; index < asset.specialsUsed; index++) {
            //character.specials.add(SpecialService.create(game, character, stats.specials[index]));
        }

        return character;
    };
}