import { Assets } from "../models/assets";
import { Player } from "../models/player";
import { FONT_FAMILY, FONT_FAMILY_BLOCK } from "../models/styles";
import { ArrowsService, ArrowOrientation } from "../services/arrows.service";
import { TextualService } from "../services/textual.service";
import { Settings } from "../models/settings";
import { CombatantType } from "../models/combatant";

const TITLE_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#FFEEBC'},
    BACK_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#581B06', align: 'center', stroke: '#000000', strokeThickness: 2 },
    START_GAME_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#FF6A00', align: 'center', stroke: '#000000', strokeThickness: 2 },
    STORY_STYLE = { font: '16px ' + FONT_FAMILY, fill: '#FFFFFF', wordWrap: { width: 640 }},
    DESCRIPTION_STYLE = { font: '16px ' + FONT_FAMILY, fill: '#BBBBBB', wordWrap: { width: 640 }},
    TYPE_STYLE = { font: '16px ' + FONT_FAMILY, fill: '#BBBBBB', wordWrap: { width: 640 }},
    STATS_TITLE_STYLE = { font: '18px ' + FONT_FAMILY_BLOCK, fill: '#FF0000'}, // red technical
    STATS_VALUE_STYLE = { font: '18px ' + FONT_FAMILY_BLOCK, fill: '#CCA600' }, // gold technical
    MOVE_STYLE = { font: '18px ' + FONT_FAMILY, fill: '#FF6A00' }, // orange
    WEAPON_NAME_STYLE = { font: '20px ' + FONT_FAMILY, fill: '#563C24', align: 'center'},
    WEAPON_DESCRIPTION_STYLE = { font: '16px ' + FONT_FAMILY, fill: '#000', wordWrap: { width: 220 }},
    SPECIAL_NAME_STYLE = { font: '20px ' + FONT_FAMILY, fill: '#FFEEBC', align: 'center'},
    SPECIAL_DESCRIPTION_STYLE = { font: '14px ' + FONT_FAMILY_BLOCK, fill: '#BBBBBB', wordWrap: { width: 300 }},
    MANA_COST_STYLE = { font: '16px ' + FONT_FAMILY_BLOCK, fill: '#B770FF', align: 'center'},
    CHOOSE_STYLE = { font: '48px ' + FONT_FAMILY, fill: '#FF6A00', align: 'center', stroke: '#000000', strokeThickness: 2 },
    SELECTED_STYLE = { font: '48px ' + FONT_FAMILY, fill: '#00990F', align: 'center', stroke: '#000000', strokeThickness: 2 };

export class NewGameScene extends Phaser.Scene {

    private _options: any;
    private _characters: Array<Player>;
    private _activeCharacter: number;
    private _selectedCharacters: Array<string>;

    private _image: Phaser.GameObjects.Sprite;
    private _title: Phaser.GameObjects.Text;
    private _story: Phaser.GameObjects.Text;
    private _description: Phaser.GameObjects.Text;
    private _type: Phaser.GameObjects.Text;
    private _health: Phaser.GameObjects.Text;
    private _attack: Phaser.GameObjects.Text;
    private _defense: Phaser.GameObjects.Text;
    private _armor: Phaser.GameObjects.Text;
    private _weapons: Phaser.GameObjects.Group;
    private _weaponsTitles: Phaser.GameObjects.Group;
    private _weaponsDescriptions: Phaser.GameObjects.Group;
    private _specials: Phaser.GameObjects.Group;
    private _specialsTitles: Phaser.GameObjects.Group;
    private _specialsDescriptions: Phaser.GameObjects.Group;
    private _manaCosts: Phaser.GameObjects.Group;

    private _status: Phaser.GameObjects.Text;
    private _selectedText: Phaser.GameObjects.Text;
    private _notSelectedText: Phaser.GameObjects.Text;

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

    create(): void {
        this.cameras.main.fadeIn(1000);
        this.cameras.main.setBackgroundColor(0x141414);

        this._status = this.add.text(this.cameras.main.width / 2, 20, '', TITLE_STYLE);
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

        var exit = TextualService.createTextButton(this, 'Back', 50, 30, BACK_STYLE, a => {
                this.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
                this.scene.start('LoadingScene', { loadScene: 'MainMenuScene' });
            });

        var startGame = TextualService.createTextButton(this, 'Start game', this.cameras.main.width - 100, 30, START_GAME_STYLE, a => {
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
        this.updateStatus();
    }

    private createControls() {
        this._image = this.add.sprite(280, this.cameras.main.height - 300, null);
        this._image.setScale(0.8);
        this._image.setOrigin(0.5, 0.5);

        var startX = this.cameras.main.width / 2 - 120;
        
        // texts

        this._title = this.add.text(startX, 60, '', TITLE_STYLE);
        this._story = this.add.text(startX, 110,'', STORY_STYLE);
        this._description = this.add.text(startX, 170,'', DESCRIPTION_STYLE);
        this._type = this.add.text(this.cameras.main.width - 240, 80,'', TYPE_STYLE);

        // stats

        var hpTitle = this.add.text(startX, 200, 'HP', STATS_TITLE_STYLE);
        hpTitle.setShadow(1, 1, '#000', 2, false, true);

        this._health = this.add.text(hpTitle.x + hpTitle.width + 5, hpTitle.y, '', STATS_VALUE_STYLE);

        var attackTitle = this.add.text(startX + 90, 200, 'Attack', STATS_TITLE_STYLE);
        attackTitle.setShadow(1, 1, '#000', 2, false, true);

        this._attack = this.add.text(attackTitle.x + attackTitle.width + 5, attackTitle.y, '', STATS_VALUE_STYLE);

        var defenseTitle = this.add.text(startX + 210, 200, 'Defense', STATS_TITLE_STYLE);
        defenseTitle.setShadow(1, 1, '#000', 2, false, true);

        this._defense = this.add.text(defenseTitle.x + defenseTitle.width + 5, defenseTitle.y, '', STATS_VALUE_STYLE);

        var armorTitle = this.add.text(startX + 320, 200, 'Armor', STATS_TITLE_STYLE);
        armorTitle.setShadow(1, 1, '#000', 2, false, true);

        this._armor = this.add.text(armorTitle.x + armorTitle.width + 5, armorTitle.y, '', STATS_VALUE_STYLE);

        // weapons

        var backgroundPaper = this.add.sprite(startX - 40, 220, 'paper');
        backgroundPaper.setOrigin(0, 0);
        backgroundPaper.setScale(0.42, 0.45);

        var weapons = this.add.text(startX, 240, 'Weapons', MOVE_STYLE);
        weapons.setShadow(1, 1, '#000', 2, false, true);

        this._weapons = this.add.group();
        for (var i = 0; i < 4; i++) { // TODO: this is now fixed to 4 weapons per character!
            var weapon = this.add.sprite(weapons.x + 40, weapons.y + 80 + 80 * i, null);
            weapon.setScale(0.7);
            weapon.setOrigin(0.5, 0.5);
            this._weapons.add(weapon, true);
        }
        this._weaponsTitles = this.add.group();
        for (var i = 0; i < 4; i++) { // TODO: this is now fixed to 4 weapons per character!
            var weaponText = this.add.text(weapons.x + 90, weapons.y + 40 + 80 * i, '', WEAPON_NAME_STYLE);
            this._weaponsTitles.add(weaponText, true);
        }
        this._weaponsDescriptions = this.add.group();
        for (var i = 0; i < 4; i++) { // TODO: this is now fixed to 4 weapons per character!
            var weaponDesc = this.add.text(weapons.x + 90, weapons.y + 60 + 80 * i, '', WEAPON_DESCRIPTION_STYLE);
            this._weaponsDescriptions.add(weaponDesc, true);
        }

        // specials

        var specials = this.add.text(startX + 360, 230, 'Specials', MOVE_STYLE);
        specials.setShadow(1, 1, '#000', 2, false, true);

        this._specials = this.add.group();
        for (var i = 0; i < 4; i++) { // TODO: this is now fixed to 4 specials per character!
            var card = this.add.sprite(specials.x + 30, specials.y + 60 + 90 * i, 'special-card');
            card.setScale(0.8);
            var special = this.add.sprite(specials.x + 30, specials.y + 60 + 90 * i, null);
            special.setScale(0.8);
            this._specials.add(special, true);
        }
        this._specialsTitles = this.add.group();
        for (var i = 0; i < 4; i++) { // TODO: this is now fixed to 4 specials per character!
            var spText = this.add.text(specials.x + 80, specials.y + 25 + 90 * i, '', SPECIAL_NAME_STYLE);
            this._specialsTitles.add(spText, true);
        }
        this._specialsDescriptions = this.add.group();
        for (var i = 0; i < 4; i++) { // TODO: this is now fixed to 4 specials per character!
            var spDesc = this.add.text(specials.x + 80, specials.y + 45 + 90 * i, '', SPECIAL_DESCRIPTION_STYLE);
            this._specialsDescriptions.add(spDesc, true);
        }
        this._manaCosts = this.add.group();
        for (var i = 0; i < 4; i++) { // TODO: this is now fixed to 4 specials per character!
            var manaCost = this.add.text(specials.x + 80, specials.y + 75 + 90 * i, '', MANA_COST_STYLE);
            this._manaCosts.add(manaCost, true);
        }

        // selection

        this._selectedText = this.add.text(240, this.cameras.main.height / 2, 'Selected', SELECTED_STYLE);
        this._selectedText.setOrigin(0.5, 0.5);
        this._selectedText.setAngle(-30);
        this._selectedText.setInteractive();
        this._selectedText.on('pointerdown', this.unselect.bind(this));

        this._notSelectedText = this.add.text(240, this.cameras.main.height / 2, 'Choose', CHOOSE_STYLE);
        this._notSelectedText.setOrigin(0.5, 0.5);
        this._notSelectedText.setAngle(-30);
        this._notSelectedText.setInteractive();
        this._notSelectedText.on('pointerdown', this.select.bind(this));
    }

    private displayCharacter() {

        var player = this._characters[this._activeCharacter];

        this._image.setTexture('characters/' + player.name);
        this._image.setAlpha(0);
        
        this._title.setText(player.title);        
        this._story.setText(player.story);
        this._description.setText(player.description);
        this._type.setText(CombatantType[player.type]);
        this._health.setText(player.health.toString());
        this._attack.setText(player.baseAttack.toString());
        this._defense.setText(player.baseDefense.toString());
        this._armor.setText(player.armor.title + ' (+' + player.armor.defense + ')');

        for (var i = 0; i < 4; i++) { // TODO: this is now fixed to 4 weapons per character!
            var weapon = this._weapons.getChildren()[i] as Phaser.GameObjects.Sprite;
            weapon.setTexture('weapons/' + player.definedWeapons[i].name);

            var weaponTitle = this._weaponsTitles.getChildren()[i] as Phaser.GameObjects.Text;
            weaponTitle.setText(player.definedWeapons[i].title);

            var weaponDesc = this._weaponsDescriptions.getChildren()[i] as Phaser.GameObjects.Text;
            weaponDesc.setText(player.definedWeapons[i].description + ' (' + player.definedWeapons[i].modifier + ' Att)');
        }

        for (var i = 0; i < 4; i++) { // TODO: this is now fixed to 4 specials per character!
            var special = this._specials.getChildren()[i] as Phaser.GameObjects.Sprite;
            special.setTexture('specials/' + player.definedSpecials[i].name);

            var spTitle = this._specialsTitles.getChildren()[i] as Phaser.GameObjects.Text;
            spTitle.setText(player.definedSpecials[i].title);

            var spDesc = this._specialsDescriptions.getChildren()[i] as Phaser.GameObjects.Text;
            spDesc.setText(player.definedSpecials[i].description);

            var manaCost = this._manaCosts.getChildren()[i] as Phaser.GameObjects.Text;
            manaCost.setText('Mana cost: ' + player.definedSpecials[i].manaCost);
        }

        this.add.tween({
            targets: [ this._image ],
            ease: 'Quad.easeIn',
            duration: 800,
            alpha: 1
        });

        var selected = this._selectedCharacters.find(s => s === player.name);
        this._selectedText.setVisible(selected != null);
        this._notSelectedText.setVisible(selected == null);
    }

    private select() {
        var player = this._characters[this._activeCharacter];
        if (this._selectedCharacters.length < 3) {
            this.sound.add('card', { volume: Settings.sound.sfxVolume }).play();
            this.add.tween({
                targets: [ this._selectedText ],
                ease: 'Quad.easeIn',
                duration: 500,
                scaleX: '+=.3',
                scaleY: '+=.3',
                yoyo: true
            });
            this._selectedCharacters.push(this._characters[this._activeCharacter].name);
            this.setSelectedLabel(player);
            this.updateStatus();    
        }
    }

    private unselect() {
        var player = this._characters[this._activeCharacter];
        var selectedIndex = this._selectedCharacters.findIndex(s => s === player.name);
        if (selectedIndex > -1) {
            this.sound.add('card', { volume: Settings.sound.sfxVolume }).play();
            this._selectedCharacters.splice(selectedIndex, 1);
            this.setSelectedLabel(player);
            this.updateStatus();
        }
    }

    setSelectedLabel(player) {
        var selected = this._selectedCharacters.find(s => s === player.name);
        this._selectedText.setVisible(selected != null);
        this._notSelectedText.setVisible(selected == null);
    }

    private updateStatus() {
        var slotsLeft = 3 - this._selectedCharacters.length;
        this._status.setText('Choose your heroes (' + slotsLeft + ' slots left)');
    }
}