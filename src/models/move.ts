import { TargetType, ExecutionType, EffectType } from "./special";

export class Move {
    // from the JSON file:
    name: string;
    title: string;
    description: string;   
    targetType: TargetType; 
    executionType: ExecutionType;
    effectType: EffectType;
    modifier?: number; // which amount it deals over one turn
}
