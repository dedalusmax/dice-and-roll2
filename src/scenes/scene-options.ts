import { Party } from "../models/party";
import { LocationReward } from "../models/location";

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
    reward?: LocationReward;
    end: boolean;
}

export class MapSceneOptions {
    loadScene: string;
    worldMap: boolean;
    playerParty: Party;
}

export class VictorySceneOptions {
    loadScene: string;
    skirmish: boolean;
    playerParty: Party;
    reward?: LocationReward;
}

export class IntroSceneOptions {
    loadScene: string;
    newGame: boolean;
    playerParty: Party;
}