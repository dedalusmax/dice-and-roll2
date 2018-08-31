import { Combatant, CombatantSide } from "./combatant";
import { FONT_FAMILY, FONT_FAMILY_BLOCK } from "./styles";
import { Player } from "./player";

export class Profile {

    private _background: Phaser.GameObjects.Sprite;
    private _objects: Array<Phaser.GameObjects.GameObject>;
    private _paper: Phaser.GameObjects.Sprite;

    constructor(private _scene: Phaser.Scene, private _combatant: Combatant) {

        var position = new Phaser.Geom.Point(-200, 250);
        var name = _combatant.side === CombatantSide.Friend ? 'characters/' + _combatant.name : 'monsters/' + _combatant.name
        this._background = _scene.add.sprite(position.x, _scene.cameras.main.height - position.y, name);
        this._background.setOrigin(0.5, 0.5);
        this._background.setAlpha(0);
        
        _scene.add.tween({
            targets: [this._background],
            ease: 'Quad.easeIn',
            duration: 800,
            x: 100,
            alpha: 1
        });
    }

    public display(): Promise<any> {

        return new Promise((resolve, reject) => {
            this._objects = [];

            var backgroundPaper = this._scene.add.sprite(this._scene.cameras.main.width, this._scene.cameras.main.height / 2 + 50, 'paper');
            backgroundPaper.setDisplayOrigin(this._scene.cameras.main.x, this._scene.cameras.main.height);
            backgroundPaper.setScale(0.35, 0.35);
            backgroundPaper.setAlpha(0);

            this._scene.add.tween({
                targets: [backgroundPaper],
                ease: 'Quad.easeIn',
                delay: 200,
                duration: 600,
                x: backgroundPaper.x - 320,
                alpha: 1,
                onComplete: () => {
                    this._paper = backgroundPaper;
                    this.displayStats(resolve);
                }
            });

            this._objects.push(backgroundPaper);
        });
    }

    private displayStats(resolve: any) {

        var startX = this._paper.x + 30;
        var startY = this._paper.y - 180;

        var title = this._scene.add.text(startX, startY, this._combatant.title, {
            font: '24px ' + FONT_FAMILY, fill: '#581B06'
        });
        this._objects.push(title);

        var desc = this._scene.add.text(startX, startY + 25, this._combatant.description, {
            font: '14px ' + FONT_FAMILY, fill: '#000', wordWrap: { width: 250 }
        });
        this._objects.push(desc);

        var hpTitle = this._scene.add.text(startX, startY + 70, 'HP', {
            font: '18px ' + FONT_FAMILY_BLOCK, fill: '#FF0000'
        });
        hpTitle.setShadow(1, 1, '#000', 2, false, true);
        this._objects.push(hpTitle);

        var hpBox = this._scene.add.graphics();
        hpBox.fillStyle(0x6D2401, 0.8);
        var boxLeft = startX + 40;
        var boxTop = startY + 70;
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
            font: '16px ' + FONT_FAMILY_BLOCK, fill: '#FFFFFF'
        });
        this._objects.push(hpValue);

        var hpMax = this._scene.add.text(boxLeft + boxWidth + 4, boxTop + 2, this._combatant.baseHealth.toString(), {
            font: '16px ' + FONT_FAMILY_BLOCK, fill: '#FF0000', strokeThickness: 2
        });
        this._objects.push(hpMax);

        var attackTitle = this._scene.add.text(startX, startY + 100, 'Attack:', {
            font: '18px ' + FONT_FAMILY, fill: '#FF6A00'
        });
        attackTitle.setShadow(1, 1, '#000', 2, false, true);
        this._objects.push(attackTitle);

        var baseAttack = this._scene.add.text(attackTitle.x + attackTitle.width + 5, attackTitle.y, this._combatant.baseAttack.toString(), {
            font: '18px ' + FONT_FAMILY_BLOCK, fill: '#581B06'
        });
        this._objects.push(baseAttack);

        var weaponTitle = this._scene.add.text(attackTitle.x + 20, baseAttack.y + 20, 'Weapon:', {
            font: '16px ' + FONT_FAMILY, fill: '#000'
        });
        this._objects.push(weaponTitle);

        var weaponName = this._scene.add.text(weaponTitle.x + weaponTitle.width + 5, weaponTitle.y, 
            this._combatant.weapon.title + ' (+' + this._combatant.weapon.modifier + ')', 
            { font: '16px ' + FONT_FAMILY, fill: '#581B06' });
        this._objects.push(weaponName);

        var defenseTitle = this._scene.add.text(startX, startY + 140, 'Defense:', {
            font: '18px ' + FONT_FAMILY, fill: '#FF6A00'
        });
        defenseTitle.setShadow(1, 1, '#000', 2, false, true);
        this._objects.push(defenseTitle);

        var baseDefense = this._scene.add.text(defenseTitle.x + defenseTitle.width + 5, defenseTitle.y, this._combatant.baseDefense.toString(), {
            font: '18px ' + FONT_FAMILY_BLOCK, fill: '#581B06'
        });
        this._objects.push(baseDefense);

        if (this._combatant instanceof Player) {
            var player = this._combatant as Player;
            var armorTitle = this._scene.add.text(defenseTitle.x + 20, baseDefense.y + 20, 'Armor:', {
                font: '16px ' + FONT_FAMILY, fill: '#000'
            });
            this._objects.push(armorTitle);
    
            var armorName = this._scene.add.text(armorTitle.x + armorTitle.width + 5, armorTitle.y, 
                player.armor.title + ' (+' + player.armor.defense + ')', 
                { font: '16px ' + FONT_FAMILY, fill: '#581B06' });
            this._objects.push(armorName);  
        }

        var effectsTitle = this._scene.add.text(startX, startY + 180, 'Current effects:', {
            font: '18px ' + FONT_FAMILY, fill: '#FF6A00'
        });
        effectsTitle.setShadow(1, 1, '#000', 2, false, true);
        this._objects.push(effectsTitle);

        var effectTop = effectsTitle.y + 20;
        this._combatant.effects.forEach(e => {
            var effectTitle = this._scene.add.text(effectsTitle.x + 20, effectTop, e.title, {
                font: '16px ' + FONT_FAMILY, fill: '#000'
            });
            this._objects.push(effectTitle);

            var effectDuration = this._scene.add.text(effectTitle.x + effectTitle.width + 5, effectTop, 
                ' (' + e.duration + ' turns)', 
                { font: '16px ' + FONT_FAMILY, fill: '#581B06' });
            this._objects.push(effectDuration);  

            effectTop += 15;
        });

        resolve();
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