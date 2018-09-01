export class SaveGame {

    members: Array<SaveGamePlayer>;
    totalMana: number;
    visitedLocations: Array<string>;

    constructor() {
        this.members = new Array<SaveGamePlayer>();
        this.totalMana = 0;
        this.visitedLocations = new Array<string>();
    }
}

export class SaveGamePlayer {

    name: string;
    armor: string;
    weapon: string;
    specialsUsed: number;
}