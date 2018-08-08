export class Assets {

    public static characters: any;
    public static monsters: any;
    public static campaign: any;
    public static weapons: any;
    public static armors: any;
    public static specials: any;

    constructor(game: Phaser.Game) {
        Assets.characters = JSON.parse(game.cache.text.get('characters'));
        Assets.monsters = JSON.parse(game.cache.text.get('monsters'));
        Assets.campaign = JSON.parse(game.cache.text.get('campaign'));
        Assets.weapons = JSON.parse(game.cache.text.get('weapons'));
        Assets.armors = JSON.parse(game.cache.text.get('armors'));
        Assets.specials = JSON.parse(game.cache.text.get('specials'));
    }
}