export enum TerrainType {
    beach = 1
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
    status: LocationStatus;
}