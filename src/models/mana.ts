import { FONT_FAMILY } from "./styles";

const MAX_MANA_VALUE = 100;

export class Mana {

    private readonly enemyMana: number;
    private readonly partyMana: number;
    
    private _enemyValue: Phaser.GameObjects.Text;
    private _enemyGraphics: Phaser.GameObjects.Graphics;
    private _partyValue: Phaser.GameObjects.Text;
    private _partyGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, enemyAmount: number, partyAmount: number) {

        this.enemyMana = enemyAmount;
        this.partyMana = partyAmount;
        
        this.addBottle(scene, partyAmount, true);
        this.addBottle(scene, enemyAmount, false);
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
            { font: '24px ' + FONT_FAMILY, fill: '#13004F' });
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

    public updateEnemyMana(amountSpent: number) {
        
    }

    public updatePartyMana(amountSpent: number) {
        
    }
}