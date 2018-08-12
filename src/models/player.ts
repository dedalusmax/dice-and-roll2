import { Combatant, CombatantSide } from "./combatant";
import { Armor } from "./armor";
import { ArmorService } from "../services/armor.service";

export class Player extends Combatant {
    
    armor: Armor;

    constructor(data: any) {
        super(data, CombatantSide.Friend);

    }

    private setPlayerData(data: any) {
        this.armor = ArmorService.get(data.armor);
    }
}