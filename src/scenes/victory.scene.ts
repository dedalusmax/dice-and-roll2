import { Settings } from "../models/settings";
import { SceneService } from "../services/scene.service";
import { VictorySceneOptions, MapSceneOptions } from "./scene-options";
import { FONT_FAMILY, FONT_FAMILY_BLOCK } from "../models/styles";
import { TextualService } from "../services/textual.service";
import { MapScene } from "./map.scene";
import { Card } from "../models/card";
import { Player } from "../models/player";
import { Armor } from "../models/armor";
import { Weapon } from "../models/weapon";
import { Special } from "../models/special";
import { Mana } from "../models/mana";

const TITLE_TEXT_STYLE = { font: '72px ' + FONT_FAMILY, fill: '#22FF22', align: 'center' },
    BACK_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#581B06', align: 'center', stroke: '#000000', strokeThickness: 2 },
    CHOOSE_TEXT_STYLE = { font: '32px ' + FONT_FAMILY, fill: '#FFEEBC'},
    WEAPON_NAME_STYLE = { font: '20px ' + FONT_FAMILY, fill: '#563C24', align: 'center'},
    WEAPON_DESCRIPTION_STYLE = { font: '16px ' + FONT_FAMILY_BLOCK, fill: '#000', wordWrap: { width: 160 }},
    MANA_TEXT_STYLE = { font: '18px ' + FONT_FAMILY, fill: '#948FAA', align: 'center', wordWrap: { width: 100 }};

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
        this.cameras.main.setBackgroundColor(0x141414);

        // var logo = ImageService.stretchAndFitImage('victory', this);
        // logo.setScale(0.3);
        // logo.setOrigin(0.5, 0.5);   

        if (Settings.sound.musicVolume > 0) {
            this.sound.stopAll();
            var music = this.sound.add('victory');
            music.play('', { loop: true });    
        }

        this.add.text(this.cameras.main.width / 2, 50, 'You are victorious', TITLE_TEXT_STYLE)
            .setOrigin(0.5, 0.5);      

        TextualService.createTextButton(this, 'Close', 40, this.cameras.main.height - 60, BACK_STYLE, a => {
            if (this._options.skirmish) {
                SceneService.backToMenu(this);
            } else {
                this.backToMap();
            }
        });

        // if (this._options.skirmish) {
        //     return;
        // }

        let backgroundPaper = this.add.sprite(this.cameras.main.width / 2, 180, 'paper');
        backgroundPaper.setOrigin(0.5, 0);
        backgroundPaper.setScale(0.7, 0.5);

        if (this._options.reward) {
            // for now, only mana is supported as a reward
            if (this._options.reward.mana) {
                   
                const targetMana = this._options.playerParty.totalMana + this._options.reward.mana;
                const mana = new Mana(this, true, 'Party mana', targetMana);
                mana.update(this._options.reward.mana);
                this.time.delayedCall(1500, () => {

                    this.sound.add('mana', { volume: Settings.sound.sfxVolume }).play();

                    const rewardText = this.add.text(this.cameras.main.width - 80, this.cameras.main.height - 190, 
                        'You gained reward of +' + this._options.reward.mana + ' mana', MANA_TEXT_STYLE)
                        .setOrigin(0.5);

                    this.tweens.add({
                        targets: [rewardText],
                        duration: 600,
                        scaleX: '+=0.2',
                        scaleY: '+=0.2',
                        ease: 'Quad.easeIn',
                        yoyo: true
                    });

                    mana.update(this._options.reward.mana * (-1));

                }, null, this);
            }
        }

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

        this.displayCards();
    }

    private displayCards() {

        for (var index in this._options.playerParty.members) {
            var player = this._options.playerParty.members[index];
            player.health = player.baseHealth; // reset health to party members
            player.effects = []; // clean all effects
            this.displayCard(player, +index, this._options.playerParty.members.length);
        };

        this._options.playerParty.members.forEach(t => {
            // TODO: activate only players which have something to upgrade
            t.card.activate(t).then(target => {
               this.displayUpgrades(target as Player);
            });
        });
    }
    
    private displayCard(combatant: Player, index: number, numberOfCards: number) {
        var cardPosition = this.calculateCardPosition(index, numberOfCards, this.cameras.main.width, 340);
        combatant.addCard(new Card(this, combatant, cardPosition));
    }

    private calculateCardPosition(slot: number, numberOfCards: number, width: number, y: number): Phaser.Geom.Point {
        var SIZE = { X: 140, Y: 150 },
            offsetLeft = (width - (numberOfCards * SIZE.X + 20)) / 2,
            x = offsetLeft + (slot * SIZE.X) + (slot - 1) * 20 + SIZE.X / 2;

        return new Phaser.Geom.Point(x, y);
    }

    private displayUpgrades(player: Player) {
        this.sound.add('click', { volume: Settings.sound.sfxVolume }).play();

        // remove all cards
        this._options.playerParty.members.forEach(t => {
            if (t.name === player.name) {
                this.time.delayedCall(500, () => t.card.remove(), null, this)
            } else {
                t.card.remove();
            }
        });

        this._status.setText('Choose an upgrade for ' + player.title);

        let numberOfUpgrades = 0, armorAvailable = 0, weaponAvailable = 0, specialAvailable = 0;

        let armorLevel = player.definedArmors.findIndex(a => a.name == player.armor.name);
        if (armorLevel < player.definedArmors.length - 1) { // there is still something to upgrade
            numberOfUpgrades++;
            armorAvailable = 1;
        }

        var weaponLevel = player.definedWeapons.findIndex(w => w.name == player.weapon.name);
        if (weaponLevel < player.definedWeapons.length - 1) { // there is still something to upgrade
            numberOfUpgrades++;
            weaponAvailable = 1;
        }

        if (player.specialsUsed < player.definedSpecials.length) { // there is still something to upgrade
            numberOfUpgrades++;
            specialAvailable = 1;
        }

        if (armorAvailable) {
            let cardPosition = this.calculateCardPosition(0, numberOfUpgrades, this.cameras.main.width, 340);
            let newArmor = player.definedArmors[armorLevel + 1];
            this.addArmorUpgrade(player.definedArmors[armorLevel + 1], cardPosition).then(() => {
                player.armor = newArmor;
                this._status.setText('Purchased ' + newArmor.title + ' for ' + player.title);
                this.backToMap();
            });
        }
        if (weaponAvailable) {
            let cardPosition = this.calculateCardPosition(armorAvailable, numberOfUpgrades, this.cameras.main.width, 340);
            let newWeapon = player.definedWeapons[weaponLevel + 1];
            this.addWeaponUpgrade(newWeapon, cardPosition).then(() => {
                player.weapon = newWeapon;
                this._status.setText('Purchased ' + newWeapon.title + ' for ' + player.title);
                this.backToMap();
            });
        }
        if (specialAvailable) {
            let cardPosition = this.calculateCardPosition(armorAvailable + weaponAvailable, numberOfUpgrades, this.cameras.main.width, 340);
            let newSpecial = player.definedSpecials[player.specialsUsed];
            this.addNewSpecial(newSpecial, cardPosition).then(() => {
                player.specialsUsed++;
                player.specials.push(newSpecial);
                this._status.setText('Purchased ' + newSpecial.title + ' for ' + player.title);
                this.backToMap();
            });
        }
    }

    private addArmorUpgrade(armor: Armor, position: Phaser.Geom.Point): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            let sprite = this.add.sprite(position.x, position.y, 'defense');

            this.add.tween({
                targets: [sprite],
                ease: 'Sine.easeInOut',
                duration: 700,
                scaleX: '-=.15',
                scaleY: '-=.15',
                yoyo: true,
                repeat: Infinity
            });

            sprite.setInteractive();
            sprite.on('pointerdown', e => {
                resolve();
            });

            this.add.text(position.x, position.y + 60, armor.title, WEAPON_NAME_STYLE).setOrigin(0.5);
            this.add.text(position.x, position.y + 90, 'Defense +' + armor.defense, WEAPON_DESCRIPTION_STYLE).setOrigin(0.5);
        });
    }

    private addWeaponUpgrade(weapon: Weapon, position: Phaser.Geom.Point): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            let sprite = this.add.sprite(position.x, position.y, 'weapons/' + weapon.name);

            this.add.tween({
                targets: [sprite],
                ease: 'Sine.easeInOut',
                duration: 700,
                scaleX: '-=.15',
                scaleY: '-=.15',
                yoyo: true,
                repeat: Infinity
            });

            sprite.setInteractive();
            sprite.on('pointerdown', e => {
                resolve();
            });

            this.add.text(position.x, position.y + 60, weapon.title, WEAPON_NAME_STYLE).setOrigin(0.5);
            this.add.text(position.x, position.y + 90, 'Attack +' + weapon.modifier, WEAPON_DESCRIPTION_STYLE).setOrigin(0.5);
        });
    }

    private addNewSpecial(special: Special, position: Phaser.Geom.Point): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            let sprite = this.add.sprite(position.x, position.y, 'specials/' + special.name);

            this.add.tween({
                targets: [sprite],
                ease: 'Sine.easeInOut',
                duration: 700,
                scaleX: '-=.15',
                scaleY: '-=.15',
                yoyo: true,
                repeat: Infinity
            });

            sprite.setInteractive();
            sprite.on('pointerdown', e => {
                resolve();
            });

            this.add.text(position.x, position.y + 60, special.title, WEAPON_NAME_STYLE).setOrigin(0.5);
            this.add.text(position.x, position.y + 120, special.description, WEAPON_DESCRIPTION_STYLE).setOrigin(0.5);
        });
    }

    private backToMap() {
        this.sound.add('click', { volume: Settings.sound.sfxVolume }).play();
        this.cameras.main.fadeOut(1000);

        this.time.delayedCall(1000, () => {

            this._options.playerParty.doneFighting();

            let options = new MapSceneOptions();
            options.playerParty = this._options.playerParty;
            options.worldMap = false;
    
            SceneService.run(this, new MapScene(), false, options);

        }, null, this);
    }
}