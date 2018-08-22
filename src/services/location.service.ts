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

    private static matchLocation(prop: any): Location {
        var result = new Location();
        result.name = prop.name;
        result.title = prop.title;
        result.description = prop.desc;
        result.type = prop.type;

        result.terrain = prop.terrain ? TerrainType[prop.terrain as string] : TerrainType.beach;

        result.x = prop.x;
        result.y = prop.y;
        
        result.connectsTo = prop.connectsTo;
        result.status = LocationStatus.unknown;

        return result;
    }
}