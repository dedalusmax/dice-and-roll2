import { CombatantSide, Combatant } from "./combatant";
import { Special } from "./special";

export class Enemy extends Combatant {
    
    constructor(data: any) {
        super(data, CombatantSide.Enemy);
        this.setEnemyData(data);
    }

    private setEnemyData(data: any) {
        
    }

    public activateRandomMove(manaLeft: number) {
        // try picking random move until mana is enough, or at least weapon is picked
        var enoughMana = false;
        var randomMove: number;
        while (!enoughMana) {
            var randomMove = Phaser.Math.RND.between(0, this.specials.length);
            if (randomMove === 0) {
                enoughMana = true;
            } else {
                var special = this.specials[randomMove - 1] as Special;
                enoughMana = special.manaCost <= manaLeft;
            }    
        }
        this.selectMove(randomMove, manaLeft);
    }
}