import { Team, Combatant } from "./combatant";

export class Profile {

    constructor(private _scene: Phaser.Scene, private _combatant: Combatant) {

        var position = new Phaser.Geom.Point(-200, 250);
        var name = _combatant.team === Team.Friend ? 'characters/' + _combatant.data.name : 'monsters/' + _combatant.data.name
        var background = _scene.add.sprite(position.x, _scene.cameras.main.height - position.y, name);
        background.setOrigin(0.5, 0.5);
        background.setScale(0.3);
        background.setAlpha(0);
        
        _scene.add.tween({
            targets: [background],
            ease: 'Quad.easeIn',
            duration: 800,
            delay: 200,
            x: 100,
            alpha: 1,
            onComplete: () => {
            }
        });
    }
}