import { Location, TerrainType, LocationStatus } from "../models/location";
import { Assets } from "../models/assets";

export class LocationService {

    static getAll(): Array<Location> {
        var result = [];
        Object.keys(Assets.campaign.locations).forEach(key => {
            result.push(this.matchLocation(Assets.campaign.locations[key]))
        });
        return result;
    }

    static get(name: string): Location {
        var data = Assets.campaign.locations.find(l => l.name == name);
        return this.matchLocation(data);
    }

    private static matchLocation(prop: any): Location {
        var result = new Location();
        result.name = prop.name;
        result.title = prop.title;
        result.description = prop.description;
        result.type = prop.type;

        result.terrain = prop.terrain ? TerrainType[prop.terrain as string] : TerrainType.beach;

        result.x = prop.x;
        result.y = prop.y;
        
        result.connectsTo = prop.connectsTo;
        result.status = LocationStatus.unknown;
        result.enemies = prop.enemies ? prop.enemies : [];

        result.enemyMana = prop.enemyMana ? prop.enemyMana : 100;
        result.reward = prop.reward;
        
        return result;
    }
}