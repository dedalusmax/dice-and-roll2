import { FONT_FAMILY, FONT_FAMILY_BLOCK } from "./styles";

const MAX_MANA_VALUE = 100;

export class Mana {

    private _enemyMana: number;
    get enemyMana(): number {
        return this._enemyMana;
    }
    private _partyMana: number;
    get partyMana(): number {
        return this._partyMana;
    }
    
    private _enemyValue: Phaser.GameObjects.Text;
    private _enemyGraphics: Phaser.GameObjects.Graphics;
    private _partyValue: Phaser.GameObjects.Text;
    private _partyGraphics: Phaser.GameObjects.Graphics;

    constructor(private _scene: Phaser.Scene, enemyAmount: number, partyAmount: number) {

        this._enemyMana = enemyAmount;
        this._partyMana = partyAmount;
        
        this.addBottle(_scene, partyAmount, true);
        this.addBottle(_scene, enemyAmount, false);
    }

    addBottle(scene: Phaser.Scene, manaTotal: number, isPartyMana: boolean) {

        var startX = scene.cameras.main.width - 80;
        var startY = isPartyMana ? scene.cameras.main.height - 100 : 60;

        var manaBottle = scene.add.sprite(startX, startY, 'mana-bottle');

        var manaTitle = scene.add.text(startX, startY + manaBottle.height / 2, isPartyMana ? 'Party mana' : 'Enemy mana', 
            { font: '18px ' + FONT_FAMILY, fill: '#7766AF' });
        manaTitle.setShadow(1, 1, '#000', 2, false, true);
        manaTitle.setOrigin(0.5, 0.5);

        this.displayMana(scene, isPartyMana, manaTotal);
    }

    private displayMana(scene: Phaser.Scene, isPartyMana: boolean, amount: number) {

        var startX = scene.cameras.main.width - 80;
        var startY = isPartyMana ? scene.cameras.main.height - 100 : 60;

        var value = scene.add.text(startX, startY + 10, amount.toString(), 
            { font: '24px ' + FONT_FAMILY_BLOCK, fill: '#13004F' });
        value.setShadow(1, 1, '#FFFFFF', 2, false, true);
        value.setOrigin(0.5, 0.5);

        var graphics = scene.add.graphics();
        graphics.clear();
        graphics.fillStyle(0x13004F, 0.8);

        var maxTop = startY - 20;
        var maxHeight = 60;
        var height = maxHeight * amount / MAX_MANA_VALUE;
        var top = maxTop + (maxHeight - height);
        graphics.fillRect(startX - 30, top, 60, height);

        if (isPartyMana) {
            this._partyValue = value;
            this._partyGraphics = graphics;
        } else {
            this._enemyValue = value;
            this._enemyGraphics = graphics;
        }
    }

    private updateLiquid(graphics: Phaser.GameObjects.Graphics, amount: number, isPartyMana: boolean) {

        var startX = this._scene.cameras.main.width - 80;
        var startY = isPartyMana ? this._scene.cameras.main.height - 100 : 60;

        graphics.clear();
        graphics.fillStyle(0x13004F, 0.8);

        var maxTop = startY - 20;
        var maxHeight = 60;
        var height = maxHeight * amount / MAX_MANA_VALUE;
        var top = maxTop + (maxHeight - height);
        graphics.fillRect(startX - 30, top, 60, height);
    }

    public updateMana(isPartyMana: boolean, amountSpent: number) {

        if (isPartyMana) {
            this._partyMana -= amountSpent;
            this._partyValue.setText(this._partyMana.toString());
            this.playTween(this._partyValue);
            this.updateLiquid(this._partyGraphics, this._partyMana, isPartyMana);
        } else {
            this._enemyMana -= amountSpent;
            this._enemyValue.setText(this._enemyMana.toString());
            this.playTween(this._enemyValue);
            this.updateLiquid(this._enemyGraphics, this._enemyMana, isPartyMana);
        }
    }

    private playTween(target) {
        this._scene.tweens.add({
            targets: [target],
            duration: 800,
            scaleX: '2',
            scaleY: '2',
            color: '#FFF',
            ease: 'Quad.easeIn',
            yoyo: true
        });
    }
}