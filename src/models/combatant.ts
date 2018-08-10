import { Status } from "./status";
import { Assets } from "./assets";
import { Soundsets } from "./soundsets";
import { Styles, FONT_FAMILY } from "./styles";

export enum Team {
    Friend = 1,
    Enemy = 2
}

const TEAMS = { FRIEND: 1, ENEMY: 2 },
        ACTUAL_SIZE = { X: 394, Y: 530 },
        BOUNDS = {
            TOP: -1 * ACTUAL_SIZE.Y / 2,
            BOTTOM: ACTUAL_SIZE.Y / 2,
            LEFT: -1 * ACTUAL_SIZE.X / 2,
            RIGHT: ACTUAL_SIZE.X / 2
        },
        SCALED_SIZE = { X: 153, Y: 220 },
        SPECIAL_ICON_SIZE = 100,
        HEALTH_TEXT_STYLE = { font: '45px Berkshire Swash', fill: '#ffffff', align: 'center' },
        STAT_TEXT_STYLE = { font: '56px Berkshire Swash', fill: '#ffffff', align: 'center' },
        COLOR = {
            RED: 0x990000,
            YELLOW: 0x999900,
            GREEN: 0x009900,
            BLACKISH: 0x11111,
            GRAY: 0x333333
        };

// Combatant is any combat unit, friend or foe. 
// it consists of the character/monster graphic and all other supporting graphics together forming a unit card.
export class Combatant {

    private _mainSprite: Phaser.GameObjects.Sprite;
    private _attackText: Phaser.GameObjects.Text;
    private _defenseText: Phaser.GameObjects.Text;
    private _healthIndicator: Phaser.GameObjects.Text;
    private _customEvents: any;
    private _status: Status;
    private _stats: any;
    private _canvas: HTMLCanvasElement;
    private _isAttacking: boolean;
    private _activeTween: Phaser.Tweens.Tween;
    private _selectedMove: any; // TODO:RC special

    private _specials : Phaser.GameObjects.Group;
    public get specials() : Phaser.GameObjects.Group {
        return this._specials;
    }
    
    private addSpriteToCard(scene: Phaser.Scene, left: number, top: number, texture, scale?: number) {
        var x = this._position.x + left;
        var y = this._position.y + top;
        var sprite = scene.add.sprite(x, y, texture);
        sprite.setDisplayOrigin(this._position.x, this._position.y);
        sprite.setScale(scale || 0.25);
        sprite.setOrigin(0.5, 0.5);
        return sprite;
    }

    private addTextToCard(scene: Phaser.Scene, left: number, top: number, text: string) {
        var x = this._position.x + left;
        var y = this._position.y + top;
        var textObject = scene.add.text(x, y, text, Styles.battle.indicator);
        textObject.setDisplayOrigin(this._position.x, this._position.y);
        // bitmapText.setScale(0.3);
        textObject.setOrigin(0.5, 0.5);
        return textObject;
    }

    constructor(private _scene: Phaser.Scene, public team: Team, private _position: Phaser.Geom.Point, private _asset) {

        this._canvas = _scene.textures.game.canvas;

        // the main sprite, the card background
        this._mainSprite = _scene.add.sprite(_position.x, _position.y, 'cards/front');
        //this._mainSprite.setOrigin(0.5, 0.5);
        this._mainSprite.setScale(0.32); // (SCALED_SIZE.X / ACTUAL_SIZE.X, SCALED_SIZE.Y / ACTUAL_SIZE.Y);
        // console.log(this._mainSprite.x, this._mainSprite.y, this._mainSprite.width, this._mainSprite.height);

        // the faction emblem, top right corner
        var z = this.addSpriteToCard(_scene, 51, -74, team === Team.Friend ? 'cards/faction-1' : 'cards/faction-2', 0.3);

        // the attack emblem, bottom left corner
        // TODO: Add the character specific emblem here
        // TODO: Add attack value display here
        this.addSpriteToCard(_scene, -51, 74, 'cards/emblem-sword');

        this._attackText = this.addTextToCard(_scene, -50, 71, _asset.attack);

        // the defense emblem, bottom right corner
        // TODO: Add defense value display here
        this.addSpriteToCard(_scene, 55, 74, 'cards/emblem-shield');

        this._defenseText = this.addTextToCard(_scene, 55, 73, _asset.defense);

        this.addSpriteToCard(_scene, 0, 0, team === Team.Friend ? 'characters/' + _asset.name : 'monsters/' + _asset.name, 0.4);

        this._healthIndicator = this.addTextToCard(_scene, 0, 60, _asset.health);
        this._healthIndicator.setColor('#009900');

        this._customEvents = {
            onInputDown: new Phaser.Events.EventEmitter(),
            onReady: new Phaser.Events.EventEmitter(),
            onActed: new Phaser.Events.EventEmitter()
        };

        // main sprite imput simply delegates to custom group imput
        this._mainSprite.setInteractive();
        // this._mainSprite.events.onInputDown.add(function () {
        //     this.customEvents.onInputDown.dispatch(this);
        // }, this);
        // this._mainSprite.events.onKilled.add(this.combatantKilled, this);

        this._status = new Status(this);
        //_scene.add.group(this._status);
        // this._status.position.setTo(BOUNDS.LEFT + 58, BOUNDS.TOP + 72);

        // contains the character's moves
        this._specials = _scene.add.group();
        //this._specials. = false;

        this._stats = {};
    }

    activate() {
        if (!this.canAct()) {
            //this._customEvents.onActed.dispatch();
            return;
        }

        // TODO: Level check to see if special is usable
        this._specials.getChildren().forEach(special => {
            special.setActive(true); // TODO:RC revive
        });
        var specialCount = this._specials.countActive(); // this will change based on level
        var leftMostPosition = (this._canvas.width - ((specialCount - 1) * SPECIAL_ICON_SIZE) - ((specialCount - 1) * 10)) / 2, y = this._canvas.height / 2;
        this._specials.getChildren().forEach((special: Phaser.GameObjects.Sprite, index: number) => {
            var x = leftMostPosition + (index * SPECIAL_ICON_SIZE) + ((index === 0 ? index : index - 1) * 10);
            special.setPosition(this._position.x, this._position.y);
            var initialScale = 0.1 * SPECIAL_ICON_SIZE / special.height, finalScale = SPECIAL_ICON_SIZE / special.height;
            special.setScale(initialScale);
            special.setAngle(180);
            special.setInteractive();
            special.off('pointerdown', null, null, true);
            special.on('pointerdown', () => {
                this.selectMove(special);

            });

            // special.events.onInputDown.removeAll();
            // special.events.onInputDown.add(this.selectMove, this);
            // special.executed.addOnce(this.deactivate, this);
            // TODO:RC special.tweenMove = this._scene.add.tween(special).to({ angle: 0, x: x, y: y }, 500, Phaser.Easing.Bounce.Out).start();
            // TODO:RC special.tweenScale = this._scene.add.tween(special.scale).to({ x: finalScale, y: finalScale }, 500, Phaser.Easing.Bounce.Out).start();
        });
        this._scene.time.addEvent({ delay: 1000, callback: () => {
            //this._customEvents.onReady.dispatch();
            // if (this._specials.countActive() > 0) //  && !this.ai)
                // this.selectMove(this._specials.getAt(0));
        }});

        this._isAttacking = true;
        this._mainSprite.setAngle(-5);
        if (!this._activeTween || !this._activeTween.isPlaying()) {
            this._activeTween = this._scene.add.tween({
                targets: [this],
                ease: 'Quad.easeIn',
                duration: 200,
                delay: 0,
                angle: 5,
                loop: true
            });
            // this._activeTween = this._scene.add.tween(this).to({ angle: 5 }, 200, Phaser.Easing.Quadratic.In, false, 0, Number.MAX_VALUE, true);
        }
        this._activeTween.play(true);
    }

    deactivate() {
        // var finalPosition = this.position;
        this._specials.getChildren().forEach(special => {
            //var finalScale = 0.1 * SPECIAL_ICON_SIZE / special.texture.height;
            // TODO:RC
            // this.game.add.tween(special).to({ angle: 180, x: finalPosition.x, y: finalPosition.y }, 600, Phaser.Easing.Quadratic.Out, true);
            // this.game.add.tween(special.scale).to({ x: finalScale, y: finalScale }, 600, Phaser.Easing.Quadratic.Out, true).onComplete.addOnce(special.kill, special);
        });
        this._isAttacking = false;
        if (this._activeTween)
            this._activeTween.stop();
        // TODO:RC this.angle = 0;
        this._customEvents.onActed.dispatch();
    }

    selectMove(selectedMove: Phaser.GameObjects.Sprite) {
        // TODO: check if first (default) move, then no sound
        Soundsets['swing'].play();
        this._selectedMove = selectedMove;
        selectedMove.setActive(true);
        this._specials.getChildren().forEach((move: Phaser.GameObjects.Sprite) => {
           if (move !== selectedMove)
                move.setActive(false);
        });
    }

    combatantKilled() {
        this._customEvents.onReady.removeAll();
        // this.parent.remove(this); // TODO:RC
    }

    damage(value) {
        // this._mainSprite.damage(value);
        // this.showDamage(value);
    }

    heal(value) {
        // this._mainSprite.health += value;
        // if (this._mainSprite.health > this._stats.maxHealth)
        //     this._mainSprite.health = this._stats.maxHealth;
        // this.showHealing(value);
    }

    setStats(stats) {
        this._stats.maxHealth = stats.maxHealth || stats.health;
        // this._mainSprite.health = stats.health ? stats.health : stats.maxHealth;
        this._stats.speed = stats.speed;
        this._stats.attack = stats.attack;
        this._stats.defense = stats.defense;
        this._stats.weapon = stats.weapon;
        this._stats.weaponStats = Assets.weapons[stats.weapon];
        this._stats.armor = stats.sarmor;
        this._stats.armorStats = Assets.armors[stats.armor];
    }

    getStats() {
        // return {
        //     health: this._mainSprite.health,
        //     maxHealth: this._stats.maxHealth,
        //     speed: this._stats.speed,
        //     attack: this._stats.attack,
        //     defense: this._stats.defense,
        //     weapon: this._stats.weapon,
        //     armor: this._stats.armor
        // };
    }

    attack(target) {
        // TODO: use selected skill to attack;

        // TODO:RC
        // var initialPosition = { x: this.position.x, y: this.position.y };
        // var actor = this._selectedMove ? this._selectedMove : this, characterPosition = this.position, targetPosition = target.position;
        // var tweenTo = this._scene.add.tween(actor).to({ x: targetPosition.x, y: targetPosition.y }, 500, Phaser.Easing.Bounce.Out, true);
        // var tweenBack = this._scene.add.tween(actor).to({ x: initialPosition.x, y: initialPosition.y }, 500, Phaser.Easing.Bounce.Out);
        // tweenTo.onComplete.addOnce(function () {
        //     // ToDo: select proper sound
        //     this.game.utils.soundsets.sword.play();
        //     var attack = this.stats.attack || 0, defense = target.stats.defense || 0, damage = this.game.rnd.integerInRange(1, 6) + attack - this.game.rnd.integerInRange(1, 6) - defense;
        //     if (damage < 0)
        //         damage = 0;
        //     target.damage(damage);
        // }, this);
        // tweenTo.chain(tweenBack);
        // return tweenBack;
    }

    showDamage(amount) {
        // TODO:RC
        // var damageText = this._scene.add.text(this.x, this.y, amount.toString(), { font: '65px ' + this.game.utils.fontFamily, fill: '#ff0000', align: 'center' }, this.damageIndicators);
        // damageText.setOrigin(0.5, 0.5);
        // this.game.add.tween(damageText).to({ alpha: 0, y: this.y - 60 }, 600).start().onComplete.add(damageText.destroy.bind(damageText, false));
    }

    showHealing(amount) {
        // TODO:RC
        // var healingText = this.game.add.text(this.x, this.y, amount.toString(), { font: '65px ' + this.game.utils.fontFamily, fill: '#00ff00', align: 'center' }, this.damageIndicators);
        // healingText.anchor.setTo(0.5, 0.5);
        // this.game.add.tween(healingText).to({ alpha: 0, y: this.y - 60 }, 600).start().onComplete.add(healingText.destroy.bind(healingText, false));
    }

    getEffectiveAttack(modifier?) {
        var attack = this._stats.attack +
            (this._stats.weaponStats ? this._stats.weaponStats.attack : 0) +
            this._status.totalAttackModifier + (modifier || 0);
        return attack > 0 ? attack : 0;
    }

    getEffectiveDefense(modifier?) {
        var defense = this._stats.defense +
            (this._stats.armorStats ? this._stats.armorStats.defense : 0) +
            this._status.totalDefenseModifier + (modifier || 0);
        return defense > 0 ? defense : 0;
    }

    canAct() {
        return !this._status.hasBlockingEffect();
    }

    update() {
        // status is a member of this group, so a group's update method needs to take care of updating it
        this._status.update();
        // update health indicator
        // this._healthIndicator.setText(this._mainSprite.health + '/' + this._stats.maxHealth);
        // var ratio = this._mainSprite.health / this._stats.maxHealth;
        // var healthFont = this._healthIndicator.font;
        // if (this._mainSprite.health === this._stats.maxHealth) {
        //     this._healthIndicator.tint = COLOR.GREEN;
        // }
        // else if ((ratio < 1) && (ratio > 1 / 3)) {
        //     this._healthIndicator.tint = COLOR.YELLOW;
        // }
        // else {
        //     this._healthIndicator.tint = COLOR.RED;
        // }
        // TODO:RC this._healthIndicator.pivot.setTo(this._healthIndicator.width / 2, this._healthIndicator.height / 2);
        // update attack indicator
        var effectiveAttack = this.getEffectiveAttack(), nonModifiedAttack = this._stats.attack + (this._stats.weaponStats ? this._stats.weaponStats.attack : 0);
        this._attackText.setText(effectiveAttack);
        if (effectiveAttack > nonModifiedAttack) {
            this._attackText.tint = COLOR.GREEN;
        }
        else if (effectiveAttack < nonModifiedAttack) {
            this._attackText.tint = COLOR.RED;
        }
        else {
            this._attackText.tint = COLOR.BLACKISH;
        }
        // TODO:RC this._attackText.pivot.setTo(this._attackText.width / 2, this._attackText.height / 2);
        var effectiveDefense = this.getEffectiveDefense(), nonModifiedDefense = this._stats.defense + (this._stats.armorStats ? this._stats.armorStats.defense : 0);
        // update defense indicator
        this._defenseText.setText(effectiveDefense);
        if (effectiveDefense > nonModifiedDefense) {
            this._defenseText.tint = COLOR.GREEN;
        }
        else if (effectiveAttack < nonModifiedAttack) {
            this._defenseText.tint = COLOR.RED;
        }
        else {
            this._defenseText.tint = COLOR.BLACKISH;
        }
        // TODO:RC this._defenseText.pivot.setTo(this._defenseText.width / 2, this._defenseText.height / 2);
    }
}