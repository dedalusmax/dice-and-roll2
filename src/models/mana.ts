import { FONT_FAMILY, FONT_FAMILY_BLOCK } from "./styles";

const MANA_TITLE_STYLE = { font: '18px ' + FONT_FAMILY, fill: '#7766AF' },
    MANA_AMOUNT_STYLE = { font: '24px ' + FONT_FAMILY_BLOCK, fill: '#13004F' };

export class Mana {

    private _totalAmount: number;

    private _amount: number;
    get amount(): number {
        return this._amount;
    }

    private _text: Phaser.GameObjects.Text;
    private _graphics: Phaser.GameObjects.Graphics;

    constructor(private _scene: Phaser.Scene, private _isBottom: boolean, text: string, amount: number) {

        this._totalAmount = amount;
        this._amount = amount;
        
        var startX = _scene.cameras.main.width - 80;
        var startY = _isBottom ? _scene.cameras.main.height - 100 : 60;

        var manaBottle = _scene.add.sprite(startX, startY, 'mana-bottle');

        var manaTitle = _scene.add.text(startX, startY + manaBottle.height / 2, text, MANA_TITLE_STYLE);
        manaTitle.setShadow(1, 1, '#000', 2, false, true);
        manaTitle.setOrigin(0.5, 0.5);

        this.displayMana();
    }

    private displayMana() {

        var startX = this._scene.cameras.main.width - 80;
        var startY = this._isBottom ? this._scene.cameras.main.height - 100 : 60;

        var text = this._scene.add.text(startX, startY + 10, this._amount.toString(), MANA_AMOUNT_STYLE);
        text.setShadow(1, 1, '#FFFFFF', 2, false, true);
        text.setOrigin(0.5, 0.5);

        var graphics = this._scene.add.graphics();
        graphics.clear();
        graphics.fillStyle(0x13004F, 0.8);

        var maxTop = startY - 20;
        var maxHeight = 60;
        var height = maxHeight * this._amount / this._totalAmount;
        var top = maxTop + (maxHeight - height);
        graphics.fillRect(startX - 30, top, 60, height);

        this._text = text;
        this._graphics = graphics;
    }

    public update(amountSpent: number) {

        this._amount -= amountSpent;
        if (this._amount > this._totalAmount) {
            this._totalAmount = this._amount;
        }

        this._text.setText(this._amount.toString());

        this._scene.tweens.add({
            targets: [this._text],
            duration: 800,
            scaleX: '2',
            scaleY: '2',
            color: '#FFF',
            ease: 'Quad.easeIn',
            yoyo: true
        });

        this.updateLiquid();
    }

    private updateLiquid() {

        var startX = this._scene.cameras.main.width - 80;
        var startY = this._isBottom ? this._scene.cameras.main.height - 100 : 60;

        this._graphics.clear();
        this._graphics.fillStyle(0x13004F, 0.8);

        var maxTop = startY - 20;
        var maxHeight = 60;
        var height = maxHeight * this._amount / this._totalAmount;
        var top = maxTop + (maxHeight - height);
        this._graphics.fillRect(startX - 30, top, 60, height);
    }
}