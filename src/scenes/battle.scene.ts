import { Settings } from "../models/settings";
import { ImageService } from "../services/image.service";
import { TextualService } from "../services/textual.service";
import { Styles } from "../models/styles";
import { Soundsets } from "../models/soundsets";
import { Combatant, CombatantSide, CombatantType } from "../models/combatant";
import { Tweens } from "phaser";
import { Player } from "../models/player";
import { Enemy } from "../models/enemy";
import { Profile } from "../models/profile";
import { Card } from "../models/card";
import { WeaponService } from "../services/weapon.service";
import { Moves } from "../models/moves";
import { SpecialService } from "../services/special.service";
import { Special, TargetType, ExecutionType, EffectType } from "../models/special";
import { Weapon } from "../models/weapon";

export class BattleScene extends Phaser.Scene {

    private _options: any;
    private _canvas: HTMLCanvasElement;
    private _music: Phaser.Sound.BaseSound;
    private _soundRound: Phaser.Sound.BaseSound;
    private _soundClick: Phaser.Sound.BaseSound;
    
    private _isTurnInProgress: boolean;
    private _turnNumber: number;
    private _roundNumber: number;

    private _combatants: Array<Combatant>;
    private _activeCombatant: number;
    private _activeProfile: Profile;

    constructor() {
        super({
            key: "BattleScene"
        });
    }

    init(data): void {
        this._options = data;
        this._isTurnInProgress = false;
        this._canvas = this.textures.game.canvas;
    }

    preload(): void {
    }

    create(): void {
        this.cameras.main.setBackgroundColor(0x360602);

        // check if music is enabled
        if (Settings.sound.musicVolume > 0) {
            // introductory fade in of theme music
            this.sound.stopAll();
            this._music = this.sound.add('battle_' + this._options.terrain);
            this._music.play('', { loop: true });    
        }

        // add sounds

        this._soundRound = this.sound.add('gong');
        this._soundClick = this.sound.add('click');

        this._turnNumber = 0;
        this._roundNumber = 0;

        // background image 
        ImageService.stretchAndFitImage('battle_' + this._options.terrain, this);

        // quit battle button (visible only in skirmish mode)
        if (this._options.skirmish) {
            TextualService.createTextButton(this, 'Quit battle', 80, 20, Styles.battle.backButton, Soundsets.sounds['sword'], a => {
                var options = this._options;
                options.loadScene = 'MainMenuScene';
                this.scene.start('LoadingScene', { loadScene: 'MainMenuScene' });
            });
        }
        
        this._combatants = [];

        for (var index in this._options.playerParty) {
            var character = new Player(this._options.playerParty[index]);
            this._combatants.push(character);
            this.displayCard(character, +index);
        };

        for (var index in this._options.enemyParty) {
            var monster = new Enemy(this._options.enemyParty[index]);
            this._combatants.push(monster);
            this.displayCard(monster, +index);
        };

        this._combatants.sort((left, right) => {
            return (Phaser.Math.RND.between(0, this._combatants.length - 1)) - (Phaser.Math.RND.between(0, this._combatants.length - 1));
        });
    }

    update(): void {
        if (this.sound.volume < Settings.sound.musicVolume) {
            this.sound.volume += 0.005;
        } 

        if (!this._isTurnInProgress) {
            this._isTurnInProgress = true;
            this.initiateTurn();
        }
    }
    
    // starts next turn. activates next combatant and makes combatants clickable if appropriate
    // currently also handles completely random AI for computer team
    private initiateTurn() {

        this.checkIfBattleIsOver();

        if (this._turnNumber == 0 || this._turnNumber >= this._combatants.length) {
            var round = this.initiateRound();
            round.then(() => {
                this.startNextTurn();
            });
        } else {
            this.startNextTurn();
        }
    };
    
    private startNextTurn() {
        this._turnNumber++;

        var turnText = this.add.text(this._canvas.width / 2, this._canvas.height / 2, 'Turn ' + this._turnNumber, Styles.battle.round);
        turnText.setOrigin(0.5, 0.5);
        turnText.alpha = 0;
        turnText.setColor('#008888');

        this.add.tween({
            targets: [turnText],
            ease: 'Linear',
            duration: 600,
            delay: 100,
            alpha: 1,
            yoyo: true,
            onComplete: () => {
                turnText.destroy();
                this.readyCombatant();
            }
        });
    };

    // starts next round. sorts semi-randomizes initiative and sorts combatants in that order
    private initiateRound(): Promise<Phaser.Tweens.Tween> { 
        this._turnNumber = 0;
        this._activeCombatant = -1;
        this._roundNumber++;

        this._soundRound.play('', { volume: Settings.sound.sfxVolume} );

        // remove all killed combatants and reduce turns
        for (var combatant in this._combatants) {
            if (this._combatants[combatant].killed) {
                this._combatants.splice(+combatant, 1);
            }
        }
 
        var roundText = this.add.text(this._canvas.width / 2, this._canvas.height / 2, 'Round ' + this._roundNumber, Styles.battle.round);
        roundText.setOrigin(0.5, 0.5);
        roundText.alpha = 0;

        var promise = new Promise<Phaser.Tweens.Tween>((resolve, reject) => {
            var roundTweenFadeIn = this.add.tween({
                targets: [roundText],
                ease: 'Linear',
                duration: 600,
                delay: 100,
                alpha: 1,
                yoyo: true,
                onComplete: () => {
                    roundText.destroy();
                    resolve(roundTweenFadeIn);
                }
            });
        });

        return promise;
    };

    // determines if all members of a single team are dead and then calles the menu screen (later, there will be a victory/defeat screen
    private checkIfBattleIsOver() {
        var numInPlayerTeam = this._combatants.filter(c => c.side === CombatantSide.Friend && !c.killed).length,
            numInEnemyTeam = this._combatants.filter(c => c.side === CombatantSide.Enemy && !c.killed).length;

        if (numInEnemyTeam === 0 || numInPlayerTeam === 0) {
            // this._options.combatResult = (numInEnemyTeam === 0) ? 'VICTORY' : 'DEFEAT';
            this.time.delayedCall(1000, () => {
                this.scene.start('LoadingScene', { loadScene: (numInEnemyTeam === 0) ? 'VictoryScene' : 'DefeatScene', skirmish: this._options.skirmish });
            }, null, this);
        }
    };

    private endTurn() {
        // remove active profile
        this._activeProfile.remove();

        // remove moves
        var combatant = this._combatants[this._activeCombatant];
        combatant.moves.close();

        this._isTurnInProgress = false;
    };

    private displayCard(combatant: Combatant, index: number) {
        var cardPosition = this.calculateCombatantPosition(combatant.side, combatant.type, 
            index, this._options.playerParty.length, this._canvas.width, this._canvas.height);
        combatant.addCard(new Card(this, combatant, cardPosition));
    }

    private calculateCombatantPosition(side: CombatantSide, type: CombatantType, slot, totalCount, width, height): Phaser.Geom.Point {
        var SIZE = { X: 110, Y: 150 },
            x, y;

        if (side === CombatantSide.Friend) {
            y = height - (SIZE.Y / 2 + ((type === CombatantType.Melee) ? 70 : 20));
        } else if (side === CombatantSide.Enemy) {
            y = SIZE.Y / 2 + ((type === CombatantType.Ranged) ? 20 : 70);
        }

        var offsetLeft = (width - (totalCount * SIZE.X + 20)) / 2;

        x = offsetLeft + (slot * SIZE.X) + (slot - 1) * 20 + SIZE.X / 2;

        return new Phaser.Geom.Point(x, y);
    }

    private readyCombatant() {
        this._activeCombatant++;
        var combatant = this._combatants[this._activeCombatant];
        if (combatant.canAct()) {
            // activate card
            combatant.card.select();
            // show weapon and specials
            this.displayMoves(combatant);

            // select first move, or automatically select and activate random one, if AI
            if (combatant.side === CombatantSide.Friend) {
                combatant.selectMove(0);
                this.activateTargets(combatant);
            } else {
                // perform action in delay because of AI
                this.time.delayedCall(2000, () => {
                    var actor = combatant as Enemy;
                    actor.activateRandomMove();
                    this.pickRandomTarget(actor);
                }, null, this);
            }
            
            // show profile
            this._activeProfile = new Profile(this, combatant);
        } else {
            this._isTurnInProgress = false;
        }
    }

    private displayMoves(combatant: Combatant) {
        var moves = new Moves(this, 'cards/emblem-' + combatant.weapon.type.toLowerCase(), combatant.weapon.title, combatant.weapon.description);
        moves.addMoves(combatant.weapon, combatant.specials);
        moves.events.on('moveClicked', (moveIndex) => {
            combatant.selectMove(moveIndex);
            this.activateTargets(combatant);
        });
        combatant.addMoves(moves);
    }

    private activateTargets(actor: Combatant) {
        this.resetTargetCards();

        var myEnemy = actor.side === CombatantSide.Friend ? CombatantSide.Enemy: CombatantSide.Friend;
        var myFriend = actor.side === CombatantSide.Friend ? CombatantSide.Friend: CombatantSide.Enemy;

        switch (actor.activeMove.targetType) {
            case TargetType.self:
                actor.card.activate(actor).then(target => {
                    this.executeMove(actor, target);
                });
                break;
            case TargetType.anyEnemy:
                var enemies = this._combatants.filter(e => e.side === myEnemy && !e.killed);
                enemies.forEach(t => {
                    t.card.activate(t).then(target => {
                        this.executeMove(actor, target);
                    });
                });
                break;
            case TargetType.anyEnemyInNearestRank: 
                var enemies = this._combatants.filter(e => e.side === myEnemy && !e.killed);
                var melees = enemies.filter(e => e.type === CombatantType.Melee);
                var targets: Array<Combatant>;
                if (melees.length > 0) {
                    targets = melees;
                } else {
                    targets = enemies;
                }
                targets.forEach(t => {
                    t.card.activate(t).then(target => {
                        this.executeMove(actor, target);
                    });
                });
                break;
            case TargetType.anyFriend:
                var friends = this._combatants.filter(e => e.side === myFriend && !e.killed);
                friends.forEach(t => {
                    t.card.activate(t).then(target => {
                        this.executeMove(actor, target);
                    });
                });
                break;
        }
    } 

    private resetTargetCards() {
        this._combatants.forEach(c => {
            if (!c.killed) {
                c.card.deactivate();
            }
        });
    }

    private pickRandomTarget(actor: Enemy) {

        switch (actor.activeMove.targetType) {
            case TargetType.self:
                this.executeMove(actor, actor);
                break;
            case TargetType.anyEnemy:
                var targets = this._combatants.filter(e => e.side === CombatantSide.Friend && !e.killed);
                var randomTarget = Phaser.Math.RND.pick(targets);
                this.executeMove(actor, randomTarget);
                break;
            case TargetType.anyEnemyInNearestRank: 
                var enemies = this._combatants.filter(e => e.side === CombatantSide.Friend && !e.killed);
                var melees = enemies.filter(e => e.type === CombatantType.Melee);
                var targets: Array<Combatant>;
                if (melees.length > 0) {
                    targets = melees;
                } else {
                    targets = enemies;
                }
                var randomTarget = Phaser.Math.RND.pick(targets);
                this.executeMove(actor, randomTarget);
                break;
            case TargetType.anyFriend:
                var targets = this._combatants.filter(e => e.side === CombatantSide.Enemy && !e.killed);
                var randomTarget = Phaser.Math.RND.pick(targets);
                this.executeMove(actor, randomTarget);
                break;
        }
    }

    private executeMove(actor: Combatant, target: Combatant) {
        
        // PREPARE:

        // remove tween for active targets
        this._combatants.filter(c => !c.killed).forEach(c => {
            c.card.deactivate();
        });

        // deactivate all moves
        var actor = this._combatants[this._activeCombatant];
        actor.moves.resetMoves();

        // ACT:

        // determine all effective targets (in cases of multiple target effects)
        var effectiveTargets: Array<Combatant> = [];
        switch (actor.activeMove.executionType) {
            case ExecutionType.singleTarget:
                effectiveTargets.push(target);
                break;
            case ExecutionType.twoTargets:
                effectiveTargets.push(target);
                var secondTarget = this.pickRandomTargetInRank(target);
                if (secondTarget) {
                    effectiveTargets.push(secondTarget);
                }
                break;
            case ExecutionType.allTargetsInRank:
                var otherTargets = this.pickAllTargetsInRank(target);
                if (otherTargets.length > 0) {
                    effectiveTargets.push(...otherTargets);
                }
                break;
            case ExecutionType.allTargets:
                var otherTargets = this.pickAllTargets(target);
                if (otherTargets.length > 0) {
                    effectiveTargets.push(...otherTargets);
                }
                break;
            default:
                alert('Not implemented!');
        }

        // execute action by type
        effectiveTargets.forEach(target => {
            switch (actor.activeMove.effectType) {
                case EffectType.damage:
                    this.dealDamage(actor, target);
                    break;
                case EffectType.heal:
                    break;
                default:
                    alert('Not implemented!');
            }
        });

        // FINISH:

        // remove tween for active combatant
        actor.card.unselect();

         // indicate end of move
        this.endTurn();
    }

    private pickRandomTargetInRank(originTarget: Combatant): Combatant {
        return null;
    }

    private pickAllTargetsInRank(originTarget: Combatant): Array<Combatant> {
        return null;
    }
    
    private pickAllTargets(originTarget: Combatant): Array<Combatant> {
        return null;
    }

    private dealDamage(actor: Combatant, target: Combatant) {
        // calculate damage: 1d6 + ATT - DEF
        var damage = Phaser.Math.RND.between(1, 6) + actor.attack - target.defense;
        if (damage < 0) {
            damage = 0;
        }
        target.health = (target.health - damage) < 0 ? 0 : target.health - damage;

        // TODO: add tween for hitting target

        // play damage sound
        Soundsets.sounds['sword'].play();

        // add tween for displaying damage
        // update target's card
        target.card.showDamage(damage, target.health);
    }
}
