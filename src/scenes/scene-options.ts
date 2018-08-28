import { Party } from "../models/party";
import { Location } from "../models/location";

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
    terrain: string; // only in case of skirmish
    playerParty: Party;
    enemyParty: Array<any>;
    enemyMana: number;
}

export class MapSceneOptions {
    loadScene: string;
    worldMap: boolean;
    playerParty: Party;
}
