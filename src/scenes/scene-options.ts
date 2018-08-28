import { Party } from "../models/party";

export interface SceneOptions {
    loadScene: string;
}

export class LoadingSceneOptions implements SceneOptions {
    loadScene: string;
    persistMusic: boolean;
    sceneOptions: SceneOptions;
}

export class BattleSceneOptions implements SceneOptions {
    loadScene: string;
    
    skirmish: boolean;
    terrain: string;
    playerParty: Party;
    enemyParty: Array<any>;
    enemyMana: number;
}

export class MapSceneOptions {
    loadScene: string;
    worldMap: boolean;
    playerParty: Party;
}
