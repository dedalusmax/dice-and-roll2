import { Combatant } from "../models/combatant";
import { Assets } from "../models/assets";
import { SpecialService } from "./special.service";

export class CharacterService {

    static create(stats, level, position, scene) {
        level = level || 1;

        var character = new Combatant(scene, 1, position, 'characters/' + stats.name);

        character.setStats(stats);
        // TODO:RC character.type = stats.type;

        // load the selected weapon - every character MUST have a weapon defined to fight with!
        var weapon = Assets.weapons[stats.weapon];
        //var attack = SpecialService.create(game, character, weapon, true);
        //attack.name = weapon.title;

        //character.specials.add(attack);

        for (var index = 0; index < stats.specialsUsed; index++) {
            //character.specials.add(SpecialService.create(game, character, stats.specials[index]));
        }

        return character;
    };
}