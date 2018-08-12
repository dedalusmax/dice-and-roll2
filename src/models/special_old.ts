const SPECIAL_SIZE = 100,
    SPECIAL_NAME_STYLE = { font: '24px Berkshire Swash', fill: '#7F5935', align: 'center'},
    SPECIAL_DESCRIPTION_STYLE = { font: '20px Berkshire Swash', fill: '#7F460F', align: 'center'};

export class SpecialOld extends Phaser.GameObjects.Sprite {

    private _isSelected: boolean;
    private _activeTween: Phaser.Tweens.Tween;
    private _nameText: Phaser.GameObjects.Text;
    private _descriptionText: Phaser.GameObjects.Text;
    private _canvas: HTMLCanvasElement;
    private _execute: any;

    constructor(private _scene: Phaser.Scene, private _character, texture, private _data) {
        super(_scene, 0, 0, texture);
        this.setOrigin(0.5);
        // super.kill();
        // this.executed = new Phaser.Signal();
        this._canvas = _scene.textures.game.canvas;
    }

    select() {
        if (this._isSelected)
            return;

        this._isSelected = true;
        this.angle = -5;
        if (!this._activeTween || !this._activeTween.isPlaying()) {
            this._activeTween = this._scene.add.tween({
                targets: [this],
                ease: 'Quad.easeIn',
                duration: 200,
                angle: 5,
                loop: true
            });
        }
            //this._activeTween = this._scene.add.tween(this).to({ angle: 5 }, 200, Phaser.Easing.Quadratic.In, false, 0, Number.MAX_VALUE, true);
            // this.activeTween.start();

        this.unsetTargets();
        // TODO: ??
        // if (this.getTargets && !this.character.ai)
        //     this.setTargets(this.getTargets());

        this._nameText = this._scene.add.text(this._canvas.width / 2, this._canvas.height / 2 + 50, this._data.name, SPECIAL_NAME_STYLE);
        this._nameText.setOrigin(0.5, 0);
        this._descriptionText = this._scene.add.text(this._canvas.width / 2, this._canvas.height / 2 + 75, this._data.description, SPECIAL_DESCRIPTION_STYLE);
        this._descriptionText.setOrigin(0.5, 0);
    }

    deselect() {
        if (!this._isSelected)
            return;

        this._isSelected = false;
        if (this._activeTween)
            this._activeTween.stop();
        this.angle = 0;
        if (this._nameText)
            this._nameText.destroy();
        if (this._descriptionText)
            this._descriptionText.destroy();
    }

    executeAndNotify(target) {
        this.deselect();
        this.unsetTargets();

        if (!this._execute)
            return;

        var promise;
        switch (this._data.executionType) {
            case 'attackSingleTarget':
            case 'attackRandomInSequence':
                promise = this._execute(target, this._data.attackCount, this._data.modifier);
                break;
            case 'attackRankAtOnce':
            case 'attackRankInSequence':
            case 'attackAllAtOnce':
            case 'healSingleTarget':
                promise = this._execute(target, this._data.modifier);
                break;
            case 'applyStatusToSingleTarget':
            case 'applyStatusToRank':
            case 'applyStatusToParty':
                promise = this._execute(target, this._data.statusTypes, this._data.duration, this._data.power);
                break;
            default:
                promise = this._execute(target);
                break;
        }
        promise.onComplete.addOnce(function () { this.executed.dispatch(); }, this);
    }

    setTargets(targets) {
        for (var i in targets) {
            var target = targets[i];
            target.originalY = target.y;
            if (!target.selectableTween || !target.selectableTween.isRunning) {
                target.selectableTween = this._scene.add.tween({
                    targets: [target],
                    ease: 'Quad.easeIn',
                    duration: 200,
                    y: target.y + 5,
                    loop: true
                });
            }
            //     target.selectableTween = this._scene.add.tween(target).to({ y: target.y + 5 }, 200, Phaser.Easing.Quadratic.In, false, 0, Number.MAX_VALUE, true);
            // target.selectableTween.start();
            target.customEvents.onInputDown.removeAll();
            target.customEvents.onInputDown.addOnce(this.executeAndNotify, this);
        }
    }

    unsetTargets() {
        // var combatants = this.character.parent;
        // combatants.forEach(function (target) {
        //     target.customEvents.onInputDown.removeAll();
        //     if (target.selectableTween)
        //         target.selectableTween.stop();
        //     target.y = target.originalY || target.y;
        // }, this);
    }
}