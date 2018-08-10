import { Settings } from "../models/settings";
import { ImageService } from "../services/image.service";
import { TextualService } from "../services/textual.service";
import { Styles } from "../models/styles";
import { Soundsets } from "../models/soundsets";
import { CharacterService } from "../services/character.service";
import { CreatureService } from "../services/creature.service";
import { Combatant, Team } from "../models/combatant";

export class BattleScene extends Phaser.Scene {

    private _options: any;
    private _canvas: HTMLCanvasElement;
    private _music: Phaser.Sound.BaseSound;
    private _soundRound: Phaser.Sound.BaseSound;
    private _soundClick: Phaser.Sound.BaseSound;
    
    private _isTurnInProgress: boolean;
    private _turnNumber: number;
    private _roundNumber: number;

    private _combatants: Array<Combatant>; //;Phaser.GameObjects.Group;
    private _damageIndicators: Phaser.GameObjects.Group;

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
            TextualService.createTextButton(this, 'Quit battle', 500, 800, Styles.text.backButton, Soundsets.sounds['sword'], a => {
                var options = this._options;
                options.loadScene = 'MainMenuScene';
                this.scene.start('LoadingScene', options);
            });
        }
        
        this._combatants = [];
        // if (this._combatants) this._combatants.destroy(false);
        // this._combatants = this.add.group();
        this._damageIndicators = this.add.group();

        for (var index in this._options.playerParty) {
            var character = this._options.playerParty[index];
            var cardPosition = this.calculateCombatantPosition(Team.Friend, character.type, 
                index, this._options.playerParty.length, this._canvas.width, this._canvas.height);
            var addedCharacter = CharacterService.create(this, character,  cardPosition);
            this._combatants.push(addedCharacter);
            // addedCharacter.customEvents.onActed.add(this.endTurn, this);
        }

        for (var index in this._options.enemyParty) {
            var monster = this._options.enemyParty[index];
            var cardPosition = this.calculateCombatantPosition(Team.Enemy, monster.type, 
                index, this._options.enemyParty.length, this._canvas.width, this._canvas.height);
            var addedMonster = CreatureService.create(this, monster,  cardPosition);
            // addedMonster.customEvents.onActed.add(this.endTurn, this);
            this._combatants.push(addedMonster);
        }

        this._combatants.sort((left, right) => {
            return (Phaser.Math.RND.between(0, 3)) - (Phaser.Math.RND.between(0, 3));
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
            var promise = this.initiateRound();
            this.startNextTurn();
            // promise.onComplete.addOnce(this.startNextTurn, this);
        } else {
            this.startNextTurn();
        }
    };

    private startNextTurn() {
        this._turnNumber++;

        var turnText = this.add.text(this._canvas.width / 2, this._canvas.height / 2, 'Turn ' + this._turnNumber, Styles.battle.round);
        turnText.setOrigin(0.5, 0.5);

        // var turnTweenFadeIn = this.add.tween(turnText).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true);



        //   var turnTweenFadeOut = this.add.tween(turnText).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, false);

        // turnTweenFadeIn.chain(turnTweenFadeOut);

        // turnTweenFadeOut.onComplete.addOnce(function () {
        //     turnText.destroy();
        //     this.activeCombatant = this.combatants.next();
        //     this.activeCombatant.activate(this.activeCombatantClicked);
        // }, this);
    };

    // starts next round. sorts semi-randomizes initiative and sorts combatants in that order
    private initiateRound() { 
        this._turnNumber = 0;
        this._roundNumber++;

        this._soundRound.play('', { volume: Settings.sound.sfxVolume} );

        var roundText = this.add.text(this._canvas.width / 2, this._canvas.height / 2, 'Round ' + this._roundNumber, Styles.battle.round);
        roundText.setOrigin(0.5, 0.5);
        roundText.alpha = 0;
        // var roundTweenFadeIn = this.add.tween(roundText).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true),
        //     roundTweenFadeOut = this.add.tween(roundText).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, false);

        // roundTweenFadeIn.chain(roundTweenFadeOut);

        // roundTweenFadeOut.onComplete.addOnce(roundText.destroy, roundText);
        // return roundTweenFadeOut;
    };

    // determines if all members of a single team are dead and then calles the menu screen (later, there will be a victory/defeat screen
    private checkIfBattleIsOver() {
        var numInPlayerTeam = 0,
            numInEnemyTeam = 0;
        this._combatants.forEach(combatant => {
            if (combatant.team === 1) numInPlayerTeam++;
            else numInEnemyTeam++;
        });

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
        this._combatants.forEach(combatant => {
            // combatant.customEvents.onInputDown.removeAll();
        });
        this._isTurnInProgress = false;
    };

    private calculateCombatantPosition(team: Team, type, slot, totalCount, width, height): Phaser.Geom.Point {
        var SIZE = { X: 163, Y: 220 },
            x, y;

        if (team === Team.Friend) {
            y = height - (SIZE.Y / 2 + ((type === "RANGED") ? 20 : 80));
        } else if (team === Team.Enemy) {
            y = SIZE.Y / 2 + ((type === "RANGED") ? 20 : 80);
        }

        var offsetLeft = (width - ((totalCount * SIZE.X) + ((totalCount - 1) * 20))) / 2;

        x = offsetLeft + (slot * SIZE.X) + (slot > 1 ? (slot - 1) * 20 : 0) + SIZE.X / 2;

        return new Phaser.Geom.Point(x, y);
    }
}