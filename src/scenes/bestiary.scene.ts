import { Enemy } from "../models/enemy";
import { TextualService } from "../services/textual.service";
import { Settings } from "../models/settings";
import { FONT_FAMILY, FONT_FAMILY_BLOCK } from "../models/styles";
import { SceneService } from "../services/scene.service";
import { ArrowsService, ArrowOrientation } from "../services/arrows.service";
import { CombatantType } from "../models/combatant";
import { Assets } from "../models/assets";

const BACK_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#370068', align: 'center' },
    TITLE_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#FFEEBC'},
    STORY_STYLE = { font: '16px ' + FONT_FAMILY, fill: '#FFFFFF', wordWrap: { width: 640 }},
    DESCRIPTION_STYLE = { font: '16px ' + FONT_FAMILY, fill: '#BBBBBB', wordWrap: { width: 640 }},
    TYPE_STYLE = { font: '16px ' + FONT_FAMILY, fill: '#BBBBBB', wordWrap: { width: 640 }},
    STATS_TITLE_STYLE = { font: '18px ' + FONT_FAMILY_BLOCK, fill: '#FF0000'}, // red technical
    STATS_VALUE_STYLE = { font: '18px ' + FONT_FAMILY_BLOCK, fill: '#CCA600' }, // gold technical
    MOVE_STYLE = { font: '18px ' + FONT_FAMILY, fill: '#FF6A00' }, // orange
    WEAPON_NAME_STYLE = { font: '20px ' + FONT_FAMILY, fill: '#563C24', align: 'center'},
    WEAPON_DESCRIPTION_STYLE = { font: '16px ' + FONT_FAMILY, fill: '#000', wordWrap: { width: 120 }},
    SPECIAL_NAME_STYLE = { font: '20px ' + FONT_FAMILY, fill: '#FFEEBC', align: 'center'},
    SPECIAL_DESCRIPTION_STYLE = { font: '14px ' + FONT_FAMILY_BLOCK, fill: '#BBBBBB', wordWrap: { width: 300 }},
    MANA_COST_STYLE = { font: '16px ' + FONT_FAMILY_BLOCK, fill: '#B770FF', align: 'center'};

export class BestiaryScene extends Phaser.Scene {

    private _monsters: Array<Enemy>;
    private _activeMonster: number;

    private _image: Phaser.GameObjects.Sprite;
    private _title: Phaser.GameObjects.Text;
    private _story: Phaser.GameObjects.Text;
    private _description: Phaser.GameObjects.Text;
    private _type: Phaser.GameObjects.Text;
    private _health: Phaser.GameObjects.Text;
    private _attack: Phaser.GameObjects.Text;
    private _defense: Phaser.GameObjects.Text;
    private _weapon: Phaser.GameObjects.Sprite;
    private _weaponTitle: Phaser.GameObjects.Text;
    private _weaponDescription: Phaser.GameObjects.Text;
    private _specials: Phaser.GameObjects.Group;
    private _specialsTitles: Phaser.GameObjects.Group;
    private _specialsDescriptions: Phaser.GameObjects.Group;
    private _manaCosts: Phaser.GameObjects.Group;

    constructor() {
        super({
            key: "BestiaryScene"
        });
    }

    // no init, since no scene parameters passed

    init(): void {
        this._monsters = [];
        this._activeMonster = 0;
    }

    // no init, since no scene parameters passed
    
    create(): void {
        this.cameras.main.fadeIn(1000);
        this.cameras.main.setBackgroundColor(0x0A0011);

        TextualService.createTextButton(this, 'Back', 50, 30, BACK_STYLE, a => {
            this.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
            SceneService.backToMenu(this);
        });

        for (var monster in Assets.monsters) {
            this._monsters.push(new Enemy(Assets.monsters[monster]));
        }

        ArrowsService.createArrow(this, 60, this.cameras.main.height - 100, ArrowOrientation.left, () => {
            if (this._activeMonster <= 0) {
                this._activeMonster = this._monsters.length - 1;
            } else {
                this._activeMonster--;
            }
            this.displayCharacter();
        });

        ArrowsService.createArrow(this, this.cameras.main.width - 60, this.cameras.main.height - 80, ArrowOrientation.right, () => {
            if (this._activeMonster >= this._monsters.length - 1) {
                this._activeMonster = 0;
            } else {
                this._activeMonster++;
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

        // weapon

        var backgroundPaper = this.add.sprite(startX - 40, 220, 'paper');
        backgroundPaper.setOrigin(0, 0);
        backgroundPaper.setScale(0.42, 0.3);

        var weapons = this.add.text(startX, 240, 'Weapon', MOVE_STYLE).setShadow(1, 1, '#000', 2, false, true);

        this._weapon = this.add.sprite(weapons.x + 60, weapons.y + 80, null).setOrigin(0.5, 0.5);

        this._weaponTitle = this.add.text(weapons.x + 140, weapons.y + 40, '', WEAPON_NAME_STYLE);
        this._weaponDescription = this.add.text(weapons.x + 140, weapons.y + 70, '', WEAPON_DESCRIPTION_STYLE);

        // specials

        var specials = this.add.text(startX + 360, 230, 'Specials', MOVE_STYLE).setShadow(1, 1, '#000', 2, false, true);

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
    }

    private displayCharacter() {

        var monster = this._monsters[this._activeMonster];

        this._image.setTexture('monsters/' + monster.name);
        this._image.setAlpha(0);
        
        this._title.setText(monster.title);        
        // this._story.setText(monster.story);
        this._description.setText(monster.description);
        this._type.setText(CombatantType[monster.type]);
        this._health.setText(monster.health.toString());
        this._attack.setText(monster.baseAttack.toString());
        this._defense.setText(monster.baseDefense.toString());

        this._weapon.setTexture('weapons/' + monster.weapon.name);
        this._weaponTitle.setText( monster.weapon.title);
        this._weaponDescription.setText( monster.weapon.description + ' (' +  monster.weapon.modifier + ' Att)');

        for (var i = 0; i < monster.specials.length; i++) { // TODO: this is now fixed to 4 specials per character!
            var special = this._specials.getChildren()[i] as Phaser.GameObjects.Sprite;
            special.setTexture('specials/' + monster.specials[i].name);

            var spTitle = this._specialsTitles.getChildren()[i] as Phaser.GameObjects.Text;
            spTitle.setText(monster.specials[i].title);

            var spDesc = this._specialsDescriptions.getChildren()[i] as Phaser.GameObjects.Text;
            spDesc.setText(monster.specials[i].description);

            var manaCost = this._manaCosts.getChildren()[i] as Phaser.GameObjects.Text;
            manaCost.setText('Mana cost: ' + monster.specials[i].manaCost);
        }

        this.add.tween({
            targets: [ this._image ],
            ease: 'Quad.easeIn',
            duration: 800,
            alpha: 1
        });
    }
}
