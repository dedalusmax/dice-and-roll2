export enum TerrainType {
    beach = 1
}

export enum LocationType {
    camp = 0,
    encounter
}

export class Location {

    name: string;
    title: string;
    description: string;
    terrain: TerrainType;
    type: LocationType;
    x: number;
    y: number;
}