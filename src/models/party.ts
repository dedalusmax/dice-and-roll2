import { Player } from "./player";
import { Location } from "../models/location";

export class Party {

    members: Array<Player>;
    totalMana: number;

    private visitedLocations: Array<Location>;
    activeLocation: Location;
    fightLocation: Location;

    constructor() {
        this.members = [];
        this.totalMana = 100;
        this.visitedLocations = [];
    }

    add(data: any) {
        this.members.push(new Player(data));
    }

    addPlayer(player: Player) {
        this.members.push(player);
    }

    locationVisited(location: Location) {
        if (!this.alreadyThere(location)) {
            this.visitedLocations.push(location);
        }
        this.activeLocation = location;
    }

    alreadyThere(location: Location): boolean {
        return this.visitedLocations.find(l => l.name === location.name) != null;
    }

    startFight(location: Location) {
        this.fightLocation = location;
    }

    doneFighting() {
        this.locationVisited(this.fightLocation);
        this.fightLocation = null;
    }
}