import { TargetType, ExecutionType } from "./special";

export class Move {
    // from the JSON file:
    name: string;
    title: string;
    description: string;    
    targetType: TargetType;
    executionType: ExecutionType;
    attackCount: number;
    modifier: number;
}
