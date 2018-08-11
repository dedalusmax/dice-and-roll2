import { Profile } from "../models/profile";
import { Combatant } from "../models/combatant";

export class ProfileService {

    static create(scene: Phaser.Scene, combatant: Combatant) {
        return new Profile(scene, combatant);
    }
}