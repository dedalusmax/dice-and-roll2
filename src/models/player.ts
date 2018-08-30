import { Combatant, CombatantSide } from "./combatant";
import { Armor } from "./armor";
import { ArmorService } from "../services/armor.service";
import { Special } from "./special";
import { Weapon } from "./weapon";
import { WeaponService } from "../services/weapon.service";

export class Player extends Combatant {
    
    story: string;
    armor: Armor;
    
    definedArmors: Array<Armor>;
    definedWeapons: Array<Weapon>;
    definedSpecials: Array<Special>;
    specialsUsed: number;
    
    get defense(): number {
        return this.baseDefense + this.armor.defense;
    }

    constructor(data: any) {
        super(data, CombatantSide.Friend);
        this.setPlayerData(data);
    }

    private setPlayerData(data: any) {
        this.story = data.story;
        this.armor = ArmorService.get(data.armor);
        
        // add all defined weapons for the character
        this.definedArmors = [];
        if (data.armors && data.armors.length > 0) {
            data.armors.forEach(a => {
                this.definedArmors.push(ArmorService.get(a));
            });
        }
        
        // add all defined weapons for the character
        this.definedWeapons = [];
        if (data.weapons && data.weapons.length > 0) {
            data.weapons.forEach(w => {
                this.definedWeapons.push(WeaponService.get(w));
            });
        }

        // remove specials if they are not purchased
        this.specialsUsed = data.specialsUsed;
        this.definedSpecials = this.specials.slice();
        this.specials.splice(this.specialsUsed, this.specials.length - this.specialsUsed);
    }
}