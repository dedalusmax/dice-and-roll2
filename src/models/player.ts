import { Combatant, CombatantSide } from "./combatant";
import { Armor } from "./armor";
import { ArmorService } from "../services/armor.service";

export class Player extends Combatant {
    
    armor: Armor;
    specialsUsed: number;
    
    get defense(): number {
        return this.baseDefense + this.armor.defense;
    }

    constructor(data: any) {
        super(data, CombatantSide.Friend);
        this.setPlayerData(data);
    }

    private setPlayerData(data: any) {
        this.armor = ArmorService.get(data.armor);
    }
}