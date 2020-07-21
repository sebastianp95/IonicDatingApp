import { ProfileLocation } from './location.model';

export class Profile {
    // Profile attributes
    constructor(
        public id: string,
        public name: string,
        public age: number,
        public imageUrl: string,
        public gender: string,
        public interestedIn: string,
        public description: string,
        public visible: boolean =  true,
        // public availableFrom: Date,
        // public availableTo: Date,
        public userId: string,
        public location: ProfileLocation
    ) { }
}