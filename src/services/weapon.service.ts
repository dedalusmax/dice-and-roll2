import { Weapon } from "../models/weapon";
import { Assets } from "../models/assets";
import { Combatant, CombatantType } from "../models/combatant";
import { TargetType, ExecutionType } from "../models/special";

export class WeaponService {

    // static getAll(): Array<Weapon> {
    //     var result = [];
    //     Object.keys(Assets.weapons).forEach(key => {
    //         result.push(this.matchWeapon(Assets.weapons[key]))
    //     });
    //     return result;
    // }

    static get(name: string): Weapon {
        var key = Object.keys(Assets.weapons).find(w => w == name);
        return this.matchWeapon(Assets.weapons[key]);
    }

    static matchWeapon(prop: any): Weapon {
        var result = new Weapon();
        result.name = prop.name;
        result.title = prop.title;
        result.description = prop.desc;
        result.type = prop.type;
        result.attack = prop.attack;

        result.targetType = TargetType.anyEnemyInNearestRank;
        result.executionType = ExecutionType.singleTarget;
        
        return result;
    }
}