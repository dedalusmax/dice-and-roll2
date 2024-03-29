export enum TerrainType {
    start = 0,
    beach = 1,
    hills, 
    swamp,
    forest,
    ruins,
    city,
    fort
}

export enum LocationType {
    camp = 0,
    encounter,
    end
}

export enum LocationStatus {
    unknown = 0,
    available,
    visited,
    end
}

export class LocationReward {
    mana?: number;
}

export class Location {

    name: string;
    title: string;
    description: string;
    terrain: TerrainType;
    type: LocationType;
    x: number;
    y: number;
    connectsTo: Array<string>;
    enemies?: Array<string>;
    enemyMana?: number;
    status: LocationStatus;
    reward?: LocationReward;
}