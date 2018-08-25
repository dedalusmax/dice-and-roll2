import { Player } from "./player";

export class Party {

    members: Array<Player>;
    totalMana: number;

    private locations: Array<Location>;

    constructor() {
        this.members = [];
        this.totalMana = 100;
        this.locations = [];
    }

    add(data: any) {
        this.members.push(new Player(data));
    }
}