import { Move } from "./move";

// explains to which combatant(s) special move executes
export enum TargetType { 
    self = 1, // targets the actor himself
    anyEnemyInNearestRank, // targets only melee enemy, or any other if no melee enemies
    anyEnemy, // targets any enemy regardless of distance
    anyFriend // targets any friendly player, including the actor
}

// explains on how many targets special move executes
export enum ExecutionType {
    singleTarget = 1, // effects only one target
    twoTargets, // effects first on the selected target, and second random target on the same side
    allTargetsInRank, //  effects the selected target and all other targets in rank on the same side 
    allTargets // effect the selected target and all targets on the same side
}

// explains on which modifier special move acts
export enum EffectType {
    damage = 1, // effects directly as a weapon attack, e.g. Ricochet
    heal, // heals one friendly unit, e.g. Remedy
    attack, // effects positively or negatively on attack modifier, e.g. Bullseye (+ATT), Disarm (-ATT)
    defense, // effects positively or negatively on defense modifier, e.g. Brass shield (+DEF), Throw acid (-DEF)
    stun, // stuns opponent, skips next turn, e.g. Playing dirty
    lingering, // deals smaller damage in several rounds, effects when the round completes, ignores armor, e.g. Poisonous gas (POISON)
    instantKill, // deals max damage (kills) opponent, e.g. Cutthroat
    hide // temporary hides the character, e.g. hide
}

// explains which type of lingering damage it is (for sake of graphics)
export enum LingeringType {
    poison, // e.g. Poisonous gas
    bleeding, // e.g. Bayonette charge
    fire // e.g. Burning flames
}

export class Special extends Move {
    // from the JSON file:
    lingeringType?: LingeringType;
    duration?: number; // how many turns it effects (0 if immediate effect)
    manaCost: number;
}
