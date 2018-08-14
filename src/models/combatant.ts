import { Weapon } from "./weapon";
import { Special, TargetType, EffectType } from "./special";
import { Effect } from "./effect";
import { WeaponService } from "../services/weapon.service";
import { Card } from "./card";
import { Moves } from "./moves";
import { Move } from "./move";
import { SpecialService } from "../services/special.service";

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

    moves: Moves;
    activeMove: Move;

    // calculates:
    health: number;
    killed: boolean;

    get attack(): number {
        return this.baseAttack + this.weapon.modifier;
    }

    get defense(): number {
        return this.baseDefense;
    }

    constructor(data: any, public side: CombatantSide) {
        this.setCommonData(data);
    }

    public canAct(): boolean {
        return this.effects.findIndex(e => e.type === EffectType.stun) < 0 && !this.killed;
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
        if (data.specials && data.specials.length > 0) {
            data.specials.forEach(s => {
                this.specials.push(SpecialService.get(s));
            });
        }

        this.effects = [];
        this.health = this.baseHealth;
    }

    public addCard(card: Card) {
        this.card = card;
    }

    public addMoves(moves: Moves) {
        this.moves = moves;
    }

    public selectMove(index: number) {
        
        if (index === 0) {
            this.activeMove = this.weapon;
            this.moves.selectMove(index, this.weapon.title, this.weapon.description);
        } else {
            this.activeMove = this.specials[index - 1];
            this.moves.selectMove(index, this.specials[index - 1].title, this.specials[index - 1].description);
        }
    }

    public kill() {
        this.card.remove();
        this.killed = true;
    }
}