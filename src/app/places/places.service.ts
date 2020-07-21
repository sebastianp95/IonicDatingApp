import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  //Dummy Places array
  // new Place(
  //   'p1',
  //   'Manhattan Mansion',
  //   'In the heart of New York City',
  //   'https://cdn.vox-cdn.com/thumbor/6wluDMWxVHEzP1gaFG_t1SbVuCM=/0x0:7360x4737/1200x800/filters:focal(3092x1781:4268x2957)/cdn.vox-cdn.com/uploads/chorus_image/image/63751936/shutterstock_1129161986.0.jpg',
  //   155.9,
  //   new Date('2019-01-1'),
  //   new Date('2019-12-31'),
  //   'xyz'
  // ),
  // new Place(
  //   'p2',
  //   'Amour Toujour',
  //   'Romantica place in paris',
  //   'https://149359143.v2.pressablecdn.com/wp-content/uploads/2011/10/Plaza_Athenee_Paris.jpg',
  //   199.9,
  //   new Date('2019-01-1'),
  //   new Date('2019-12-31'),
  //   'abc'
  // ),
  // new Place(
  //   'p3',
  //   'The Foggy Palace',
  //   'Not your average city trip!',
  //   'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
  //   99.99,
  //   new Date('2019-01-1'),
  //   new Date('2019-12-31'),
  //   'abc'
  // )

  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    // return [...this._places];
    return this._places.asObservable();
  }

  // getPlace(id: string) {
  //   return this.places.pipe(
  //     take(1),
  //     map(places => {
  //       return { ...places.find(p => p.id === id) };
  //     })
  //   );
  // }
  getPlace(id: string) {
    return this.authService.token.pipe(take(1), switchMap(token => {
      return this.http
        .get<PlaceData>(
          `https://ionic-project-v2.firebaseio.com/offered-places/${id}.json?auth=${token}`
        );
    }),
      map(placeData => {
        return new Place(
          id,
          placeData.title,
          placeData.description,
          placeData.imageUrl,
          placeData.price,
          new Date(placeData.availableFrom),
          new Date(placeData.availableTo),
          placeData.userId,
          placeData.location
        );
      })
    );
  }

  constructor(private authService: AuthService, private http: HttpClient) { }

  fetchPlaces() {
    return this.authService.token.pipe(take(1), switchMap(token => {

      return this.http
        .get<{ [key: string]: PlaceData }>(
          `https://ionic-project-v2.firebaseio.com/offered-places.json?auth=${token}`
        );
    }),
      map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(
              new Place(
                key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId,
                resData[key].location
              )
            );
          }
        }
        return places;
        // return [];
      }),
      tap(places => {
        this._places.next(places);
      })
    );
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

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
    let generatedId: string;
    let newPlace: Place;
    let fetchedUserId: string;
    return this.authService.userId.pipe(take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1), switchMap(
        token => {
          if (!fetchedUserId) {
            throw new Error('User not found');
          }
          newPlace = new Place(
            Math.random().toString(),
            title,
            description,
            imageUrl,
            price,
            dateFrom,
            dateTo,
            fetchedUserId,
            location
          );

          return this.http
            .post<{ name: string }>(
              `https://ionic-project-v2.firebaseio.com/offered-places.json?auth=${token}`,
              {
                ...newPlace,
                id: null
              }
            );

        }), take(1),
      switchMap(resData => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
    // return this.places.pipe(
    //   take(1),
    //   delay(1000),
    //   tap(places => {

    //     this._places.next(places.concat(newPlace));

    //   }));

  }
  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    let fetchedToken: string;
    return this.authService.token.pipe(take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.places;
      }),
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );
        //note the quotes for a put
        return this.http.put(
          `https://ionic-project-v2.firebaseio.com/offered-places/${placeId}.json?auth=${fetchedToken}`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }

  // updatePlace(placeId: string, title: string, description: string) {
  //   return this.places.pipe(
  //     take(1),
  //     delay(1000),
  //     tap(places => {
  //       const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
  //       const updatedPlaces = [...places];
  //       const oldPlace = updatedPlaces[updatedPlaceIndex];
  //       updatedPlaces[updatedPlaceIndex] = new Place(
  //         oldPlace.id,
  //         title,
  //         description,
  //         oldPlace.imageUrl,
  //         oldPlace.price,
  //         oldPlace.availableFrom,
  //         oldPlace.availableTo,
  //         oldPlace.userId
  //       );
  //       this._places.next(updatedPlaces);
  //     })
  //   );
  // }
}
