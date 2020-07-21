export interface Coordinates {
    lat: number;
    lng: number;
}

export interface ProfileLocation extends Coordinates {
    address: string;
    staticMapImageUrl: string;
}
