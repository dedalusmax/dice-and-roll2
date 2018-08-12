import { CombatantSide, Combatant } from "./combatant";

export class Enemy extends Combatant {
    
    constructor(data: any) {
        super(data, CombatantSide.Enemy);
        this.setEnemyData(data);
    }

    private setEnemyData(data: any) {
        
    }
}