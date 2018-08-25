import { Assets } from "../models/assets";
import { Player } from "../models/player";
import { FONT_FAMILY, Styles, FONT_FAMILY_BLOCK } from "../models/styles";
import { ArrowsService, ArrowOrientation } from "../services/arrows.service";
import { TextualService } from "../services/textual.service";
import { Settings } from "../models/settings";

export class NewGameScene extends Phaser.Scene {

    private _options: any;
    private _characters: Array<Player>;
    private _activeCharacter: number;
    private _selectedCharacters: Array<Player>;

    private _image: Phaser.GameObjects.Sprite;
    private _title: Phaser.GameObjects.Text;
    private _story: Phaser.GameObjects.Text;
    private _description: Phaser.GameObjects.Text;

    get getObjects(): Array<Phaser.GameObjects.GameObject> {
        return [
            this._image, this._title, this._story, this._description
        ];
    }

    constructor() {
        super({
            key: "NewGameScene"
        });
    }

    init(data): void {
        this._options = data;
        this._characters = [];
        this._activeCharacter = 0;
        this._selectedCharacters = [];
    }

    preload(): void {
    }

    create(): void {
        this.cameras.main.fadeIn(1000);
        this.cameras.main.setBackgroundColor(0x111111);

        var title = this.add.text(this.cameras.main.width / 2, 20, 'Choose your heroes', {
            font: '32px ' + FONT_FAMILY, fill: '#FFFFFF'
        });
        title.setOrigin(0.5, 0.5);
        this.add.tween({
            targets: [ title ],
            ease: 'Sine.easeInOut',
            duration: 700,
            scaleX: '-=.05',
            scaleY: '-=.0',
            alpha: '-=0.5',
            yoyo: true,
            repeat: Infinity
        });

        var exit = TextualService.createTextButton(this, 'Back', 50, 30,
            { font: '32px ' + FONT_FAMILY, fill: '#581B06', align: 'center', stroke: '#000000', strokeThickness: 2 }, a => {
                this.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
                this.scene.start('LoadingScene', { loadScene: 'MainMenuScene' });
            });

        var startGame = TextualService.createTextButton(this, 'Start game', this.cameras.main.width - 100, 30, 
            { font: '32px ' + FONT_FAMILY, fill: '#FF6A00', align: 'center', stroke: '#000000', strokeThickness: 2 }, a => {
                if (this._selectedCharacters.length === 3) {
                    this.scene.start('LoadingScene', { loadScene: 'MainMenuScene' });
                } else {
                    this.sound.add('closed', { volume: Settings.sound.sfxVolume }).play();
                }
            });
        
        for (var character in Assets.characters) {
            this._characters.push(new Player(Assets.characters[character]));
        }

        ArrowsService.createArrow(this, 60, this.cameras.main.height - 100, ArrowOrientation.left, () => {
            if (this._activeCharacter <= 0) {
                this._activeCharacter = this._characters.length - 1;
            } else {
                this._activeCharacter--;
            }
            this.displayCharacter();
        });

        ArrowsService.createArrow(this, this.cameras.main.width - 60, this.cameras.main.height - 80, ArrowOrientation.right, () => {
            if (this._activeCharacter >= this._characters.length - 1) {
                this._activeCharacter = 0;
            } else {
                this._activeCharacter++;
            }
            this.displayCharacter();
        });

        this.createControls();
        this.displayCharacter();
    }

    private createControls() {
        this._image = this.add.sprite(280, this.cameras.main.height - 300, null);
        this._image.setScale(0.8);
        this._image.setOrigin(0.5, 0.5);

        var startX = this.cameras.main.width / 2 - 120;
        
        this._title = this.add.text(startX, 60, '', {
            font: '36px ' + FONT_FAMILY, fill: '#FFEEBC'
        });

        this._story = this.add.text(startX, 120,'', {
            font: '18px ' + FONT_FAMILY, fill: '#FFFFFF', wordWrap: { width: 640 }
        });

        this._description = this.add.text(startX, 200,'', {
            font: '18px ' + FONT_FAMILY, fill: '#DDDDDD', wordWrap: { width: 640 }
        });

        // health
        // defense
        // attack
        // type
        // armors
        // weapons
        // specials

        var hpTitle = this.add.text(startX, 250, 'HP', {
            font: '18px ' + FONT_FAMILY_BLOCK, fill: '#FF0000'
        });
        hpTitle.setShadow(1, 1, '#000', 2, false, true);

        var defenseTitle = this.add.text(startX + 80, 250, 'Defense', {
            font: '18px ' + FONT_FAMILY_BLOCK, fill: '#FF0000'
        });
        defenseTitle.setShadow(1, 1, '#000', 2, false, true);

        var attackTitle = this.add.text(startX + 160, 250, 'Attack', {
            font: '18px ' + FONT_FAMILY_BLOCK, fill: '#FF0000'
        });
        attackTitle.setShadow(1, 1, '#000', 2, false, true);

    }

    private displayCharacter() {

        var player = this._characters[this._activeCharacter];

        this._image.setTexture('characters/' + player.name);
        this._image.setAlpha(0);
        
        this._title.setText(player.title);        
        this._story.setText(player.story);
        this._description.setText(player.description);

        this.add.tween({
            targets: this.getObjects,
            ease: 'Quad.easeIn',
            duration: 800,
            alpha: 1
        });
    }

    update(): void {

    }
}