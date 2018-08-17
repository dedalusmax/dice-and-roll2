import { Weapon } from "./weapon";
import { Special, TargetType, EffectType } from "./special";
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

    effects: Array<Special>;

    card: Card;

    moves: Moves;
    activeMove: Move;

    // calculates:
    health: number;
    killed: boolean;

    get defense(): number {
        return this.baseDefense;
    }

    constructor(data: any, public side: CombatantSide) {
        this.setCommonData(data);
    }

    public canAct(): boolean {
        return this.effects.findIndex(e => e.effectType === EffectType.stun) < 0 && !this.killed;
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

    public addEffect(effect: Special) {
        // search for similar effects, and overwrite it if the same
        this.effects.forEach((e, index) => {
            if (e.effectType === effect.effectType) {
                if (e.modifier) {
                    if (e.modifier > 0 && effect.modifier > 0 || e.modifier < 0 && effect.modifier < 0) {
                        // it's the same effect, overwrite it with new one
                        this.effects.splice(index, 1);
                    }
                } else {
                    // it's the same effect, overwrite it with new one
                    this.effects.splice(index, 1);
                }
            }
        });

        this.effects.push(effect);

        this.card.showEffect(EffectType[effect.effectType], effect.modifier > 0 ? '+' + effect.modifier : effect.modifier.toString())
            .then(() => {
                this.updateEffectsOnCard();
            });
    }

    public wearOffEffects() {
        // it happens before the combatant is playing his move, decreases all effects by one
        this.effects.forEach((e, index) => {
            e.duration--;
            if (e.duration <= 0) {
                // remove the effect if it wore off completely
                this.effects.splice(index, 1);
            }
        });

        this.updateEffectsOnCard();
    }

    private updateEffectsOnCard() {
        var eff = this.effects.filter(e => e.effectType === EffectType.attack || e.effectType === EffectType.defense);
        var positives = eff.some(e => e.modifier > 0);
        var negatives = eff.some(e => e.modifier < 0);
        this.card.updateEffects(positives, negatives);
    }
}