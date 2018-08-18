import { CombatantSide, Combatant } from "./combatant";

export class Enemy extends Combatant {
    
    constructor(data: any) {
        super(data, CombatantSide.Enemy);
        this.setEnemyData(data);
    }

    private setEnemyData(data: any) {
        
    }

    public activateRandomMove(manaLeft: number) {
        // TODO: take into account party mana!
        var randomMove = Phaser.Math.RND.between(0, this.specials.length);
        this.selectMove(randomMove, manaLeft);
    }
}