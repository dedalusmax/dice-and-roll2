import { Combatant, Team } from "../models/combatant";
import { Assets } from "../models/assets";
import { SpecialService } from "./special.service";

export class CreatureService {

    static create(scene: Phaser.Scene, asset, position: Phaser.Geom.Point) {

        var creature = new Combatant(scene, Team.Enemy, position, asset);
        return creature;
    };
}