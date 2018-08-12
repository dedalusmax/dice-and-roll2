import { Team, Combatant } from "./combatant";
import { FONT_FAMILY } from "./styles";

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
                this.displayStats();
            }
        });
    }

    private displayStats() {
        var title = this._scene.add.text(30, this._scene.cameras.main.height - 300, this._combatant.data.title, {
            font: '24px ' + FONT_FAMILY, fill: '#FF6A00', strokeThickness: 1
        });
        title.setShadow(2, 2, '#333333', 2, true, true);

        var desc = this._scene.add.text(30, this._scene.cameras.main.height - 270, this._combatant.data.desc, {
            font: '14px ' + FONT_FAMILY, fill: '#EDEAD9', wordWrap: { width: 250 }
        });
        // desc.setShadow(1, 1, '#000', 2, false, true);

        var hpTitle = this._scene.add.text(30, this._scene.cameras.main.height - 150, 'HP', {
            font: '18px ' + FONT_FAMILY, fill: '#FF0000'
        });
        hpTitle.setShadow(1, 1, '#000', 2, false, true);

        var hpBox = this._scene.add.graphics();
        hpBox.fillStyle(0x6D2401, 0.8);
        var boxLeft = 70;
        var boxTop = this._scene.cameras.main.height - 150;
        var boxWidth = 180;
        var boxHeight = 24;
        hpBox.strokeRect(boxLeft, boxTop, boxWidth, boxHeight);

        var hpBar = this._scene.add.graphics();
        hpBar.fillStyle(0xFF0000, 1);
        hpBar.fillRect(boxLeft + 1, boxTop + 1, (boxWidth * 0.8) - 1, boxHeight - 1);

        var hpValue = this._scene.add.text(boxLeft + 4, boxTop, '50', {
            font: '16px ' + FONT_FAMILY, fill: '#FFFFFF'
        });

        var hpMax = this._scene.add.text(boxLeft + boxWidth + 4, boxTop + 2, this._combatant.data.health, {
            font: '16px ' + FONT_FAMILY, fill: '#FF0000', strokeThickness: 2
        });
        
        var attackTitle = this._scene.add.text(30, this._scene.cameras.main.height - 120, 'Attack', {
            font: '18px ' + FONT_FAMILY, fill: '#FF6A00'
        });
        attackTitle.setShadow(1, 1, '#000', 2, false, true);

        this._scene.add.text(attackTitle.x + attackTitle.width + 5, attackTitle.y, this._combatant.data.attack, {
            font: '18px ' + FONT_FAMILY, fill: '#FFFFFF'
        });

        var defenseTitle = this._scene.add.text(30, this._scene.cameras.main.height - 100, 'Defense', {
            font: '18px ' + FONT_FAMILY, fill: '#FF6A00'
        });
        defenseTitle.setShadow(1, 1, '#000', 2, false, true);

        this._scene.add.text(defenseTitle.x + defenseTitle.width + 5, defenseTitle.y, this._combatant.data.defense, {
            font: '18px ' + FONT_FAMILY, fill: '#FFFFFF'
        });
    }
}