import { ImageService } from "../services/image.service";
import { Settings } from "../models/settings";
import { SceneService } from "../services/scene.service";
import { VictorySceneOptions, MapSceneOptions } from "./scene-options";
import { FONT_FAMILY } from "../models/styles";
import { TextualService } from "../services/textual.service";
import { MapScene } from "./map.scene";
import { Card } from "../models/card";
import { Player } from "../models/player";

const TITLE_TEXT_STYLE = { font: '72px ' + FONT_FAMILY, fill: '#22FF22', align: 'center' },
    BACK_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#581B06', align: 'center', stroke: '#000000', strokeThickness: 2 },
    CHOOSE_TEXT_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#FFEEBC'};

export class VictoryScene extends Phaser.Scene {

    private _options: VictorySceneOptions;

    private _status: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: "VictoryScene"
        });
    }

    init(data): void {
        this._options = data;
    }

    create() {
        this.cameras.main.fadeIn(1000);
        this.cameras.main.setBackgroundColor(0x360602);

        // var logo = ImageService.stretchAndFitImage('victory', this);
        // logo.setScale(0.3);
        // logo.setOrigin(0.5, 0.5);   

        if (Settings.sound.musicVolume > 0) {
            this.sound.stopAll();
            var music = this.sound.add('victory');
            music.play('', { loop: true });    
        }

        this.add.text(this.cameras.main.width / 2, 50, 'Victory', TITLE_TEXT_STYLE)
            .setOrigin(0.5, 0.5);      

        var backgroundPaper = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2 - 90, 'paper');
        backgroundPaper.setOrigin(0.5);
        backgroundPaper.setScale(0.7, 0.5);

        this._status = this.add.text(this.cameras.main.width / 2, 120, 'Choose character to upgrade', CHOOSE_TEXT_STYLE);
        this._status.setOrigin(0.5, 0.5);
        this.add.tween({
            targets: [ this._status ],
            ease: 'Sine.easeInOut',
            duration: 700,
            scaleX: '-=.05',
            scaleY: '-=.0',
            alpha: '-=0.5',
            yoyo: true,
            repeat: Infinity
        });

        TextualService.createTextButton(this, 'Close', this.cameras.main.width / 2, this.cameras.main.height - 100, BACK_STYLE, a => {
            if (this._options.skirmish) {
                SceneService.backToMenu(this);
            } else {
                var options = new MapSceneOptions();
                options.worldMap = false;
                options.playerParty = this._options.playerParty;
                SceneService.run(this, new MapScene(), false, options);
            }
        });

        this.displayCards();
    }

    private displayCards() {

        //var cardedPlayers = this._options.playerParty.members.slice();

        for (var index in this._options.playerParty.members) {
            var player = this._options.playerParty.members[index];
            this.displayCard(player, +index, this._options.playerParty.members.length);
        };

        this._options.playerParty.members.forEach(t => {
            t.card.activate(t).then(target => {
               this.displayUpgrades(target as Player);
            });
        });
    }
    
    private displayCard(combatant: Player, index: number, numberOfCards: number) {
        var cardPosition = this.calculateCombatantPosition(index, numberOfCards, this.cameras.main.width, this.cameras.main.height / 2 - 90);
        combatant.addCard(new Card(this, combatant, cardPosition));
    }

    private calculateCombatantPosition(slot: number, numberOfCards: number, width: number, y: number): Phaser.Geom.Point {
        var SIZE = { X: 110, Y: 150 },
            offsetLeft = (width - (numberOfCards * SIZE.X + 20)) / 2,
            x = offsetLeft + (slot * SIZE.X) + (slot - 1) * 20 + SIZE.X / 2;

        return new Phaser.Geom.Point(x, y);
    }

    private displayUpgrades(player: Player) {
        this._status.setText('Choose an upgrade for ' + player.title);
    }
}