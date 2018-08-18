import { FONT_FAMILY } from "../models/styles";

const MAX_MANA_VALUE = 100;

export class ManaService {
    
    static init(scene: Phaser.Scene, enemyAmount: number, partyAmount: number) {

        ManaService.addBottle(scene, partyAmount, true);
        ManaService.addBottle(scene, enemyAmount, false);
    }

    private static addBottle(scene: Phaser.Scene, manaTotal: number, isPartyMana: boolean) {

        var startX = scene.cameras.main.width - 80;
        var startY = isPartyMana ? scene.cameras.main.height - 100 : 60;

        var manaBottle = scene.add.sprite(startX, startY, 'mana-bottle');

        var manaTitle = scene.add.text(startX, startY + manaBottle.height / 2, isPartyMana ? 'Party mana' : 'Enemy mana', 
            { font: '18px ' + FONT_FAMILY, fill: '#7766AF' });
        manaTitle.setShadow(1, 1, '#000', 2, false, true);
        manaTitle.setOrigin(0.5, 0.5);

        ManaService.displayMana(scene, isPartyMana, manaTotal);
    }

    static displayMana(scene: Phaser.Scene, isPartyMana: boolean, amount: number) {

        var startX = scene.cameras.main.width - 80;
        var startY = isPartyMana ? scene.cameras.main.height - 100 : 60;

        var enemyMana = scene.add.text(startX, startY + 10, amount.toString(), 
            { font: '24px ' + FONT_FAMILY, fill: '#13004F' });
        enemyMana.setShadow(1, 1, '#FFFFFF', 2, false, true);
        enemyMana.setOrigin(0.5, 0.5);

        var progressBar = scene.add.graphics();
        progressBar.clear();
        progressBar.fillStyle(0x13004F, 0.8);

        var maxTop = startY - 20;
        var maxHeight = 60;
        var height = maxHeight * amount / MAX_MANA_VALUE;
        var top = maxTop + (maxHeight - height);
        progressBar.fillRect(startX - 30, top, 60, height);
    }
}