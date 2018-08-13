import { Move } from "./move";

export enum TargetType {
    self = 1,
    anyEnemy,
    anyEnemyInNearestRank,
    anyFriend
}

export enum ExecutionType {
    attackSingleTarget = 1,
    healSingleTarget,
    attackRankAtOnce,
    applyStatusToParty,
    attackAllAtOnce,
    applyStatusToSingleTarget,
    attackRankInSequence,
    healParty,
    attackRandomInSequence,
    applyStatusToRank
}

export enum StatusType {
    Poison,
    Attack,
    Stun,
    Fire
}

export class Special extends Move {
    
    statusType?: StatusType;
    duration?: number;
    power?: number;
}