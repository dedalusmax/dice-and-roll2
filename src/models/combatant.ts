import { Weapon } from "./weapon";
import { Special } from "./special";
import { Effect, EffectType } from "./effect";
import { WeaponService } from "../services/weapon.service";
import { Card } from "./card";

export enum CombatantType {
    Melee = 1,
    Ranged = 2
}

export enum CombatantSide {
    Friend = 1,
    Enemy = 2
}

export abstract class Combatant {

    // from the JSON files:
    name: string;
    title: string;
    description: string;
    baseHealth: number; 
    baseDefense: number;
    baseAttack: number;
    type: CombatantType;
    weapon: Weapon;
    specials: Array<Special>;

    effects: Array<Effect>;

    card: Card;
    
    // calculates:

    get health(): number {
        return this.baseHealth;
    }

    get attack(): number {
        return this.baseAttack;
    }

    get defense(): number {
        return this.baseDefense;
    }

    constructor(data: any, public side: CombatantSide) {
        this.setCommonData(data);
    }

    public canAct(): boolean {
        return this.effects.findIndex(e => e.type === EffectType.Stun) < 0;
    }

    private setCommonData(data: any) {
        this.name = data.name;
        this.title = data.title;
        this.description = data.desc;
        this.baseHealth = data.health;
        this.baseAttack = data.attack;
        this.baseDefense = data.defense;
        this.type = data.type === 'MELEE' ? CombatantType.Melee : CombatantType.Ranged;
        this.weapon = WeaponService.get(data.weapon);
        this.specials = [];
        this.effects = [];
    }

    public addCard(card: Card) {
        this.card = card;
    }

    private calculateCombatantPosition(side: CombatantSide, type: CombatantType, slot, totalCount, width, height): Phaser.Geom.Point {
        var SIZE = { X: 110, Y: 150 },
            x, y;

        if (side === CombatantSide.Friend) {
            y = height - (SIZE.Y / 2 + ((type === CombatantType.Melee) ? 20 : 70));
        } else if (side === CombatantSide.Enemy) {
            y = SIZE.Y / 2 + ((type === CombatantType.Ranged) ? 20 : 70);
        }

        var offsetLeft = (width - (totalCount * SIZE.X + 20)) / 2;

        x = offsetLeft + (slot * SIZE.X) + (slot - 1) * 20 + SIZE.X / 2;

        return new Phaser.Geom.Point(x, y);
    }

}