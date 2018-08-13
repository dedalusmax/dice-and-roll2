import { Assets } from "../models/assets";
import { Armor } from "../models/armor";

export class ArmorService {

    // static getAll(): Array<Armor> {
    //     var result = [];
    //     Object.keys(Assets.armors).forEach(key => {
    //         result.push(this.matchArmor(Assets.armors[key]))
    //     });
    //     return result;
    // }

    static get(name: string): Armor {
        var key = Object.keys(Assets.armors).find(w => w == name);
        return this.matchArmor(Assets.armors[key]);
    }

    static matchArmor(prop: any): Armor {
        var result = new Armor();
        result.name = prop.name;
        result.title = prop.title;
        result.description = prop.desc;
        result.defense = prop.defense;
        return result;
    }
}