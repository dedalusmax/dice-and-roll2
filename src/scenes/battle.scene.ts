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
import { Special, TargetType } from "../models/special";

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
        var numInPlayerTeam = this._combatants.filter(c => c.side === CombatantSide.Friend).length,
            numInEnemyTeam = this._combatants.filter(c => c.side === CombatantSide.Enemy).length;

        // TODO: Split into victory/defeat
        if (numInEnemyTeam === 0 || numInPlayerTeam === 0) {
            this._options.combatResult = (numInEnemyTeam === 0) ? 'VICTORY' : 'DEFEAT';

            // if (this._options.skirmish) {
            //     this.game.state.start('Preloader', true, false, 'SkirmishEnd', this.options);
            // } else {
            //     this.game.state.start('Preloader', true, false, (numInEnemyTeam === 0) ? 'BattleVictory' : 'BattleDefeat', this.options);
            // }
            this.scene.start('LoadingScene', { loadScene: 'MainMenuScene' });
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
            combatant.card.activate(combatant);
            // show weapon and specials
            this.displayMoves(combatant);
            combatant.activateMove(0);
            this.activateTargets(combatant);
            // show profile
            this._activeProfile = new Profile(this, combatant);
        } else {
            this._isTurnInProgress = false;
        }
    }

    private displayMoves(combatant: Combatant) {
        var moves = new Moves(this, 'cards/emblem-' + combatant.weapon.type.toLowerCase(), combatant.weapon.title, combatant.weapon.description);
        //moves.addMoves(combatant.weapon, combatant.specials);
        var movesCount = 1 + combatant.specials.length;
        moves.addWeapon(combatant.weapon, movesCount);
        moves.addSpecials(combatant.specials, movesCount);
        combatant.addMoves(moves);
    }

    private _activations: Array<Promise<any>>;

    private activateTargets(combatant: Combatant) {
        var myEnemy = combatant.side === CombatantSide.Friend ? CombatantSide.Enemy: CombatantSide.Friend;
        var myFriend = combatant.side === CombatantSide.Friend ? CombatantSide.Friend: CombatantSide.Enemy;

        this._activations = [];

        switch (combatant.activeMove.targetType) {
            case TargetType.self:
                 this._activations.push(combatant.card.activate(combatant, true).then(combatant => {
                    this.executeMove(combatant);
                }));
                break;
            case TargetType.anyEnemy:
                var enemies = this._combatants.filter(e => e.side === myEnemy);
                enemies.forEach(t => {
                    this._activations.push(t.card.activate(t, true).then(combatant => {
                        this.executeMove(combatant);
                    }));
                });
                break;
            case TargetType.anyEnemyInNearestRank: 
                var enemies = this._combatants.filter(e => e.side === myEnemy);
                var melees = enemies.filter(e => e.type === CombatantType.Melee);
                var targets: Array<Combatant>;
                if (melees.length > 0) {
                    targets = melees;
                } else {
                    targets = enemies;
                }
                targets.forEach(t => {
                    this._activations.push(t.card.activate(t, true).then(combatant => {
                        this.executeMove(combatant);
                    }));
                });
                break;
            case TargetType.anyFriend:
                var friends = this._combatants.filter(e => e.side === myFriend);
                friends.forEach(t => {
                    this._activations.push(t.card.activate(t, true).then(combatant => {
                        this.executeMove(combatant);
                    }));
                });
                break;
        }
    } 

    private executeMove(target: Combatant) {

        // DEALING DAMAGE TO OPPONENTS:
        // remove tween for active targets
        // remove tween for active combatant
        this._combatants.forEach(c => {
            c.card.deactivate();
        });

        // deactivate all moves
        var actor = this._combatants[this._activeCombatant];
        actor.moves.resetMoves();

        // add tween for hitting target
        // calculate damage
        var damage = Phaser.Math.RND.between(1, 6) + actor.attack - target.defense;
        if (damage < 0)
            damage = 0;
        target.health = (target.health - damage) < 0 ? 0 : target.health - damage;

        // play damage sound
        Soundsets.sounds['sword'].play();

        // add tween for displaying damage
        // update target's card
        target.card.showDamage(damage, target.health);

        // indicate end of move
        this.endTurn();
    }
}
