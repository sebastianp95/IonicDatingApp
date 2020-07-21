import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Profile } from './profile.model';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { take, switchMap, map, tap } from 'rxjs/operators';
import { ProfileLocation } from './location.model';


interface ProfileData {
  // availableFrom: string;
  name: string;
  age: number;
  imageUrl: string;
  gender: string;
  interestedIn: string;
  description: string;
  visible: true;
  userId: string;
  location: ProfileLocation;

  // public availableFrom: Date,
  // public availableTo: Date,
  // public userId: string,

}
export var StringConverter = (value: any) => {
  if (value === null || value === undefined || typeof value === 'string') {
    return value;
  }

  return value.toString();
}
export var BooleanConverter = (value: any) => {
  if (value === null || value === undefined || typeof value === 'boolean') {
    return value;
  }

  return value.toString() === 'true';
}

@Injectable({
  providedIn: 'root'
})
export class ProfilesService {

  private _profiles = new BehaviorSubject<Profile[]>([]);

  get profiles() {
    // return [...this._places];
    return this._profiles.asObservable();
  }

  // get interest() {
  //   return this._profiles.asObservable().pipe(
  //     map(profile => {
  //       if (profile) {
  //         return profile.interestedIn;
  //       } else {
  //         return null;
  //       }
  //     })
  //   );
  // }

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  addProfile(
    name: string,
    age: number,
    imageUrl: string,
    gender: string,
    interestedIn: string,
    description: string,
    visible: any,
    location: ProfileLocation
    // dateFrom: Date,
    // dateTo: Date,
  ) {
    let generatedId: string;
    let newProfile: Profile;
    let fetchedUserId: string;
    return this.authService.userId.pipe(take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found');
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1), switchMap(
        token => {
          if (!fetchedUserId) {
            throw new Error('User not found');
          }

          newProfile = new Profile(
            Math.random().toString(),
            // fetchedUserId,
            name,
            age,
            imageUrl,
            gender,
            interestedIn,
            description,
            visible,
            fetchedUserId,
            location
            // dateFrom,
            // dateTo,
          );

          return this.http
            .post<{ name: string }>(
              `https://ionic-project-v2.firebaseio.com/profiles.json?auth=${token}`,
              {
                ...newProfile,
                id: null
              }
            );

        }), take(1),
      switchMap(resData => {
        generatedId = resData.name;
        return this.profiles;
      }),
      take(1),
      tap(profiles => {
        newProfile.id = generatedId;
        this._profiles.next(profiles.concat(newProfile));
      })
    );
  }


  getProfile(id: string) {

    return this.authService.token.pipe(
      take(1), switchMap(token => {
        return this.http
          .get<ProfileData>(
            `https://ionic-project-v2.firebaseio.com/profiles/${id}.json?auth=${token}`
          );
      }),
      map(pData => {


        return new Profile(
          id,
          pData.name,
          pData.age,
          pData.imageUrl,
          pData.gender,
          pData.interestedIn,
          pData.description,
          pData.visible,
          pData.userId,
          pData.location
          // new Date(placeData.availableFrom),
          // new Date(placeData.availableTo),
          // placeData.userId,
        );
      })
    );
  }

  fetchProfiles() {
    return this.authService.token.pipe(take(1), switchMap(token => {

      return this.http
        .get<{ [key: string]: ProfileData }>(
          `https://ionic-project-v2.firebaseio.com/profiles.json?auth=${token}`
        );
    }),
      map(resData => {
        const profiles = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            profiles.push(
              new Profile(
                key,
                resData[key].name,
                resData[key].age,
                resData[key].imageUrl,
                resData[key].gender,
                resData[key].interestedIn,
                resData[key].description,
                resData[key].visible,
                resData[key].userId,
                resData[key].location
                // new Date(resData[key].availableFrom),
                // new Date(resData[key].availableTo),

              )
            );
          }
        }
        return profiles;
        // return [];
      }),
      tap(profiles => {
        this._profiles.next(profiles);
      })
    );
  }

  getProfileByUserId(userId: string) {
    return this.authService.token.pipe(take(1), switchMap(token => {

      return this.http
        .get<{ [key: string]: ProfileData }>(
          `https://ionic-project-v2.firebaseio.com/profiles.json?auth=${token}`
        );
    }),
      map(resData => {
        
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {

            if (resData[key].userId === userId) {

              console.log('userId profile found');

              return new Profile(
                key,
                resData[key].name,
                resData[key].age,
                resData[key].imageUrl,
                resData[key].gender,
                resData[key].interestedIn,
                resData[key].description,
                resData[key].visible,
                resData[key].userId,
                resData[key].location
                // new Date(resData[key].availableFrom),
                // new Date(resData[key].availableTo),
              );

            }

          }
        }
        // return profiles;
        // return [];
      }));
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.authService.token.pipe(take(1), switchMap(token => {

      return this.http.post<{ imageUrl: string, imagePath: string }>(
        'https://us-central1-ionic-project-v2.cloudfunctions.net/storeImage',
        uploadData, { headers: { Authorization: 'Bearer ' + token } }
      );
    }));
  }

}
