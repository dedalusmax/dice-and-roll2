import { Combatant, CombatantSide } from "./combatant";
import { Armor } from "./armor";
import { ArmorService } from "../services/armor.service";
import { Special } from "./special";

export class Player extends Combatant {
    
    story: string;
    armor: Armor;
    
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
        
        // remove specials if they are not purchased
        this.specialsUsed = data.specialsUsed;
        this.definedSpecials = this.specials.slice();
        this.specials.splice(this.specialsUsed, this.specials.length - this.specialsUsed);
    }
}