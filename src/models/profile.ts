import { Combatant, CombatantSide } from "./combatant";
import { FONT_FAMILY } from "./styles";

export class Profile {

    private _background: Phaser.GameObjects.Sprite;
    private _objects: Array<Phaser.GameObjects.GameObject>;

    constructor(private _scene: Phaser.Scene, private _combatant: Combatant) {

        var position = new Phaser.Geom.Point(-200, 250);
        var name = _combatant.side === CombatantSide.Friend ? 'characters/' + _combatant.name : 'monsters/' + _combatant.name
        this._background = _scene.add.sprite(position.x, _scene.cameras.main.height - position.y, name);
        this._background.setOrigin(0.5, 0.5);
        this._background.setScale(0.3);
        this._background.setAlpha(0);
        
        _scene.add.tween({
            targets: [this._background],
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
        this._objects = [];

        // var graphics = this._scene.add.graphics({ lineStyle: { width: 2, color: 0xaa0000 }, fillStyle: { color: 0x0000aa }});
        // var rect1 = new Phaser.Geom.Rectangle(100, 0, 250, 100);
        // graphics.fillRectShape(square);

        var title = this._scene.add.text(30, this._scene.cameras.main.height - 300, this._combatant.title, {
            font: '24px ' + FONT_FAMILY, fill: '#FF6A00', strokeThickness: 1
        });
        title.setShadow(4, 4, '#333333', 4, true, true);
        this._objects.push(title);

        var desc = this._scene.add.text(30, this._scene.cameras.main.height - 270, this._combatant.description, {
            font: '14px ' + FONT_FAMILY, fill: '#EDEAD9', wordWrap: { width: 250 }
        });
        desc.setShadow(2, 2, '#000', 10, true, true);
        this._objects.push(desc);

        var hpTitle = this._scene.add.text(30, this._scene.cameras.main.height - 150, 'HP', {
            font: '18px ' + FONT_FAMILY, fill: '#FF0000'
        });
        hpTitle.setShadow(1, 1, '#000', 2, false, true);
        this._objects.push(hpTitle);

        var hpBox = this._scene.add.graphics();
        hpBox.fillStyle(0x6D2401, 0.8);
        var boxLeft = 70;
        var boxTop = this._scene.cameras.main.height - 150;
        var boxWidth = 180;
        var boxHeight = 24;
        hpBox.strokeRect(boxLeft, boxTop, boxWidth, boxHeight);
        this._objects.push(hpBox);

        var healthPercentage = this._combatant.health / this._combatant.baseHealth;
        var hpBar = this._scene.add.graphics();
        hpBar.fillStyle(0xFF0000, 1);
        hpBar.fillRect(boxLeft + 1, boxTop + 1, (boxWidth * healthPercentage) - 1, boxHeight - 1);
        this._objects.push(hpBar);

        var hpValue = this._scene.add.text(boxLeft + 4, boxTop + 2, this._combatant.health.toString(), {
            font: '16px ' + FONT_FAMILY, fill: '#FFFFFF'
        });
        this._objects.push(hpValue);

        var hpMax = this._scene.add.text(boxLeft + boxWidth + 4, boxTop + 2, this._combatant.baseHealth.toString(), {
            font: '16px ' + FONT_FAMILY, fill: '#FF0000', strokeThickness: 2
        });
        this._objects.push(hpMax);

        var attackTitle = this._scene.add.text(30, this._scene.cameras.main.height - 120, 'Attack', {
            font: '18px ' + FONT_FAMILY, fill: '#FF6A00'
        });
        attackTitle.setShadow(1, 1, '#000', 2, false, true);
        this._objects.push(attackTitle);

        var baseAttack = this._scene.add.text(attackTitle.x + attackTitle.width + 5, attackTitle.y, this._combatant.baseAttack.toString(), {
            font: '18px ' + FONT_FAMILY, fill: '#FFFFFF'
        });
        this._objects.push(baseAttack);

        var defenseTitle = this._scene.add.text(30, this._scene.cameras.main.height - 100, 'Defense', {
            font: '18px ' + FONT_FAMILY, fill: '#FF6A00'
        });
        defenseTitle.setShadow(1, 1, '#000', 2, false, true);
        this._objects.push(defenseTitle);

        var baseDefense = this._scene.add.text(defenseTitle.x + defenseTitle.width + 5, defenseTitle.y, this._combatant.baseDefense.toString(), {
            font: '18px ' + FONT_FAMILY, fill: '#FFFFFF'
        });
        this._objects.push(baseDefense);
    }

    public remove() {
        // destroy data
        for (var index in this._objects) {
            this._objects[index].destroy();
        };

        this._scene.add.tween({
            targets: [this._background],
            ease: 'Quad.easeIn',
            duration: 800,
            delay: 200,
            x: -200,
            alpha: 0
        });
    }
}