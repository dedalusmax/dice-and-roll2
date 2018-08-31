import { Settings } from "../models/settings";
import { ImageService } from "../services/image.service";
import { TextualService } from "../services/textual.service";
import { Styles, FONT_FAMILY } from "../models/styles";
import { Combatant, CombatantSide, CombatantType } from "../models/combatant";
import { Enemy } from "../models/enemy";
import { Profile } from "../models/profile";
import { Card } from "../models/card";
import { Moves } from "../models/moves";
import { Special, TargetType, ExecutionType, EffectType } from "../models/special";
import { Mana } from "../models/mana";
import { BattleSceneOptions, VictorySceneOptions } from "./scene-options";
import { SceneService } from "../services/scene.service";
import { VictoryScene } from "./victory.scene";
import { DefeatScene } from "./defeat.scene";
import { Weapon } from "../models/weapon";

const ROUND_TEXT_STYLE = { font: '72px ' + FONT_FAMILY, fill: '#990000', align: 'center' };

export class BattleScene extends Phaser.Scene {

    private _options: BattleSceneOptions;
    private _canvas: HTMLCanvasElement;
    private _music: Phaser.Sound.BaseSound;
    
    private _isTurnInProgress: boolean;
    private _turnNumber: number;
    private _roundNumber: number;

    private _combatants: Array<Combatant>;
    private _activeCombatant: number;
    private _activeProfile: Profile;
    private _manaPool: Array<Mana>;

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
        // prepare the scene:

        this.cameras.main.setBackgroundColor(0x360602);

        // check if music is enabled
        if (Settings.sound.musicVolume > 0) {
            // introductory fade in of theme music
            this.sound.stopAll();
            this._music = this.sound.add('battle_' + this._options.terrain);
            this._music.play('', { loop: true });    
        }

        // background image 
        ImageService.stretchAndFitImage('battle_' + this._options.terrain, this);

        // quit battle button (visible only in skirmish mode)
        if (this._options.skirmish) {
            TextualService.createTextButton(this, 'Quit battle', 80, 20, Styles.battle.backButton, a => {
                SceneService.backToMenu(this);
            });
        }
        
        // manas
        this._manaPool = [ 
            new Mana(this, false, 'Enemy mana', this._options.enemyMana),
            new Mana(this, true, 'Party mana', this._options.playerParty.totalMana)
        ];

        // prepare the battle:

        this._turnNumber = 0;
        this._roundNumber = 0;

        this._combatants = [];

        for (var index in this._options.playerParty.members) {
            //var character = new Player(this._options.playerParty[index]);
            var player = this._options.playerParty.members[index];
            this._combatants.push(player);
            this.displayCard(player, +index, this._options.playerParty.members.length);
        };

        for (var index in this._options.enemyParty) {
            var monster = new Enemy(this._options.enemyParty[index]);
            this._combatants.push(monster);
            this.displayCard(monster, +index, this._options.enemyParty.length);
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
            this.induceLingeringEffects();
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

        var turnText = this.add.text(this._canvas.width / 2, this._canvas.height / 2, 'Turn ' + this._turnNumber, ROUND_TEXT_STYLE);
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

        this.sound.add('gong').play('', { volume: Settings.sound.sfxVolume} );

        // remove all killed combatants and reduce turns
        for (var combatant in this._combatants) {
            if (this._combatants[combatant].killed) {
                this._combatants.splice(+combatant, 1);
            }
        }
 
        var roundText = this.add.text(this._canvas.width / 2, this._canvas.height / 2, 'Round ' + this._roundNumber, ROUND_TEXT_STYLE);
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
            this.time.delayedCall(1000, () => {
                if ((numInEnemyTeam === 0)) { // victory
                
                    var options = new VictorySceneOptions();
                    options.skirmish = this._options.skirmish;
                    options.playerParty = this._options.playerParty;

                    SceneService.run(this, new VictoryScene(), false, options);

                } else {
                    SceneService.run(this, new DefeatScene());
                }
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

    private displayCard(combatant: Combatant, index: number, numberOfBeligerents: number) {
        var cardPosition = this.calculateCombatantPosition(combatant.side, combatant.type, 
            index, numberOfBeligerents, this._canvas.width, this._canvas.height);
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
        // pick the next player
        this._activeCombatant++;
        var combatant = this._combatants[this._activeCombatant];

        // decrease duration of his effects for one
        combatant.wearOffEffects();

        // check whether the player is stunned
        if (combatant.canAct()) {

            // show profile
            this._activeProfile = new Profile(this, combatant);
            this._activeProfile.display().then(() => {

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
                        actor.activateRandomMove(this._manaPool[0].amount);
                        this.pickRandomTarget(actor);
                    }, null, this);
                }
            });
        } else {
            this._isTurnInProgress = false;
        }
    }

    private displayMoves(combatant: Combatant) {
        var moves = new Moves(this, combatant.weapon.title, combatant.weapon.description);
        moves.addMoves(combatant.weapon, combatant.specials);
        moves.events.on('moveClicked', (moveIndex) => {
            var manaLeft = this._manaPool[combatant.side == CombatantSide.Friend ? 1 : 0].amount;
            combatant.selectMove(moveIndex, manaLeft);
            // check if mana is already exhausted
            if (moveIndex == 0 || (combatant.activeMove as Special).manaCost <= manaLeft) {
                this.activateTargets(combatant);
            } else {
                this.resetTargetCards();
            }
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
                    effectiveTargets = [...otherTargets];
                }
                break;
            case ExecutionType.allTargets:
                var otherTargets = this.pickAllTargets(target);
                if (otherTargets.length > 0) {
                    effectiveTargets = [...otherTargets];
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
                    this.heal(actor.activeMove as Special, target);
                    break;
                case EffectType.attack:
                case EffectType.defense:
                case EffectType.stun:
                    this.applyDurableEffect(actor.activeMove as Special, target);
                    break;
                case EffectType.lingering:
                    this.applyLingeringEffect(actor.activeMove as Special, target);
                    break;
                default:
                    alert('Not implemented!');
            }
        });

        // FINISH:

        // reduce mana
        if (actor.activeMove instanceof Special) {
            var manaCost = (actor.activeMove as Special).manaCost;
            this._manaPool[actor.side == CombatantSide.Friend ? 1 : 0].update(manaCost);
        }

        if (actor.activeMove.effectType === EffectType.damage) {
            // remove tween for active combatant
            actor.card.unselect();

            // indicate end of move
            this.endTurn();
        } else {
            actor.moves.removeSpecialMoves();

            if (actor.side === CombatantSide.Friend) {
                actor.selectMove(0);
                this.activateTargets(actor);
            } else {
                // perform action in delay because of AI
                this.time.delayedCall(2000, () => {
                    actor.selectMove(0);
                    this.pickRandomTarget(actor as Enemy);
                }, null, this);
            }
        }
    }

    private pickRandomTargetInRank(originTarget: Combatant): Combatant {
        var allInRankAndSide = this._combatants.filter(c => !c.killed && c.side === originTarget.side && c.type === originTarget.type && originTarget != c); 
        if (allInRankAndSide.length > 0) {
            return Phaser.Math.RND.pick(allInRankAndSide);
        } else {
            return null;
        }
    }

    private pickAllTargetsInRank(originTarget: Combatant): Array<Combatant> {
        return this._combatants.filter(c => !c.killed && c.side === originTarget.side && c.type === originTarget.type); 
    }
    
    private pickAllTargets(originTarget: Combatant): Array<Combatant> {
        return this._combatants.filter(c => !c.killed && c.side === originTarget.side); 
    }

    private dealDamage(actor: Combatant, target: Combatant) {

        // calculate damage: 1d6 + ATT (+ATT MODs) - DEF (+DEF MODs)
        
        var attack = Phaser.Math.RND.between(1, 6) + actor.baseAttack + actor.activeMove.modifier;
        var attMods = actor.effects.filter(e => e.effectType == EffectType.attack);
        attMods.forEach(m => attack += m.modifier);
        
        var defense = target.defense;
        var defMods = target.effects.filter(e => e.effectType == EffectType.defense);
        defMods.forEach(m => defense += m.modifier);

        var damage = attack - defense;
        if (damage < 0) {
            damage = 0;
        }

        target.health = (target.health - damage) < 0 ? 0 : target.health - damage;

        // TODO: add tween for hitting target

        // play damage sound
        if (actor.activeMove instanceof Weapon && actor.side === CombatantSide.Friend) {
            this.sound.add(actor.name, { volume: Settings.sound.sfxVolume }).play();
        } else {
            this.sound.add(actor.activeMove.name, { volume: Settings.sound.sfxVolume }).play();
        }

        // add tween for displaying damage
        // update target's card
        target.card.showDamage(damage, target.health);

        // mark target as killed if HP is now 0
        if (target.health == 0) {
            target.kill();
        }
    }

    private heal(special: Special, target: Combatant) {
        // calculate healing: 1d10 + MOD
        var healing = Phaser.Math.RND.between(1, 10) + special.modifier;

        if (target.health + healing > target.baseHealth) {
            target.health = target.baseHealth;
        } else {
            target.health += healing;
        }

        // TODO: add tween for healing target
        
        // play healing sound
        var sound = this.sound.add(special.name);
        sound.play('', { volume: Settings.sound.sfxVolume} );
        
        // display healing and update card
        target.card.showHealing(healing, target.health);
    }

    private applyDurableEffect(move: Special, target: Combatant) {

        // play the sound
        var sound = this.sound.add(move.name, { volume: Settings.sound.sfxVolume });
        sound.play();

        // add effect to target (or overwrite if existing by type and course)
        target.addEffect(move);
    }

    private applyLingeringEffect(move: Special, target: Combatant) {
        // play the sound
        var sound = this.sound.add(move.name, { volume: Settings.sound.sfxVolume });
        sound.play();

        // add effect to target (or overwrite if existing by type and course)
        target.addLingeringEffect(move);
    }

    private induceLingeringEffects() {
        // this shall happen at the end of the round
        this._combatants.forEach(efectee => {
            if (!efectee.killed) {
                var linger = efectee.effects.find(e => e.effectType === EffectType.lingering);
                if (linger) {
                    this.dealLingeringDamage(linger, efectee);
                }
            }
        });
    }

    private dealLingeringDamage(effect: Special, target: Combatant) {

        // calculate damage: 1d3 + EFFECT - DEF (+DEF MODs)
        
        var attack = Phaser.Math.RND.between(1, 3) + effect.modifier;
        
        var defense = target.defense;
        var defMods = target.effects.filter(e => e.effectType == EffectType.defense);
        defMods.forEach(m => defense += m.modifier);

        var damage = attack - defense;
        if (damage < 0) {
            damage = 0;
        }

        target.health = (target.health - damage) < 0 ? 0 : target.health - damage;

        // TODO: add tween for hitting target

        // play damage sound
        var sound = this.sound.add(effect.name, { volume: Settings.sound.sfxVolume });
        sound.play();

        // add tween for displaying damage
        // update target's card
        target.card.showDamage(damage, target.health);

        // mark target as killed if HP is now 0
        if (target.health == 0) {
            target.kill();
        }
    }
}
