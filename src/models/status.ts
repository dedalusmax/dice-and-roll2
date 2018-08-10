export class Status {

    private _canAct: boolean;

    private _totalAttackMod : number;
    public get totalAttackModifier() : number {
        return this._totalAttackMod;
    }    
    
    private _totalDefenseMod : number;
    public get totalDefenseModifier() : number {
        return this._totalDefenseMod;
    }

    private _effects = [];

    constructor(private _character) {
        // Phaser.Group.call(this, this.game, this.character, character.name + '_status');

        //this._character.customEvents.onActed.add(this.processTurn, this);

        this._canAct = true;
        this._totalAttackMod = 0;
        this._totalDefenseMod = 0;
    }

    // type is any of the following: ATTACK, DEFENSE, STUN, POISON
    // duration is expressed in turns, default is 1
    // power is the strength of the effect. not applicable for STUN
    addEffect(type, duration, power) {
        var effect;
        switch (type) {
            case 'ATTACK':
                //effect = this.create(0, 0, 'cards/emblem-sword');
                break;
            case 'DEFENSE':
                //effect = this.create(0, 0, 'cards/emblem-shield');
                break;
            case 'STUN':
                //effect = this.create(0, 0, 'cards/emblem-mace');
                break;
            case 'POISON':
            case 'FIRE':
                //effect = this.create(0, 0, 'cards/emblem-potion');
                break;
        }
        effect.duration = duration;
        effect.power = power;
        effect.type = type;
        // if ((power > 0 && (effect.type === 'POISON' || effect.type === 'FIRE')) || (power < 0 && effect.type !== 'POISON') || (effect.type === 'STUN'))
        //     effect.tint = 0xff3333;
        // else
        //     effect.tint = 0x33ff33;
        // effect.scale.setTo(0.5);
        // effect.anchor.setTo(0.5);
        this._effects.push(effect);
    }

    // removes all effects of a certain type
    // intended for use with status healing abilities.
    removeEffectsOfType(type) {
        this._effects.forEach((effect, index) => {
            if (effect.type === type)
            this._effects.splice(index, 1);
        });
    }
    
    processTurn() {
        var totalDamage = 0, expiredEffects = [];
        this._effects.forEach((statusEffect:any) => {
            statusEffect.duration--;
            switch (statusEffect.type) {
                case 'POISON':
                case 'FIRE':
                    totalDamage += statusEffect.power * Phaser.Math.RND.between(1, 6);
                    break;
            }
        });
        if (totalDamage > 0)
            this._character.damage(totalDamage);
    }

    update() {
        // this._effects.forEach((effect: any, index) => {
        //     effect.position.setTo(index * 50, 0);
        //     var alpha = effect.duration * 0.1 + 0.5;
        //     if (alpha > 1)
        //         alpha = 1;
        //     effect.alpha = alpha;
        // });

        var totalAttackMod = 0, totalDefenseMod = 0, expiredEffects = [];
        this._effects.forEach((statusEffect: any) => {
            switch (statusEffect.type) {
                case 'ATTACK':
                    totalAttackMod += statusEffect.power;
                    break;
                case 'DEFENSE':
                    totalDefenseMod += statusEffect.power;
                    break;
            }
            // if (statusEffect.duration <= 0)
            //     expiredEffects.push(statusEffect);
        });

        this._effects.filter(f => f.duration <= 0).forEach((expired, index) => {
            this._effects.splice(index, 1);
        });

        this._totalAttackMod = totalAttackMod;
        this._totalDefenseMod = totalDefenseMod;
    }

    hasBlockingEffect() {
        return this._effects.find(f => f.type === 'STUN');
    }
}