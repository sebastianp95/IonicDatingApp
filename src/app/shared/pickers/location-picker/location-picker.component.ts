import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PlaceLocation, Coordinates } from '../../../places/location.model';
import { Capacitor, Plugins } from '@capacitor/core';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;
  selectedLocationImage: string;
  isLoading = false;


  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() { }

  onPickLocation() {

    this.actionSheetCtrl
      .create({
        header: 'Please Choose',
        buttons: [
          {
            text: 'Auto-Locate',
            handler: () => {
              this.locateUser();
            }
          },
          {
            text: 'Pick on Map',
            handler: () => {
              this.openMap();
            }
          },
          { text: 'Cancel', role: 'cancel' }
        ]
      })
      .then(actionSheetEl => {
        actionSheetEl.present();
      });
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }
    this.isLoading = true;
    Plugins.Geolocation.getCurrentPosition()
      .then(geoPosition => {
        const coordinates: Coordinates = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude
        };
        this.createPlace(coordinates.lat, coordinates.lng);
        this.isLoading = false;
      })
      .catch(err => {
        this.isLoading = false;
        this.showErrorAlert();
      });
  }

  private showErrorAlert() {
    this.alertCtrl
      .create({
        header: 'Could not fetch location',
        message: 'Please use the map to pick a location!',
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

  private openMap() {

    this.modalCtrl.create({ component: MapModalComponent }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        const coordinates: Coordinates = {
          lat: modalData.data.lat,
          lng: modalData.data.lng
        };
        this.createPlace(coordinates.lat, coordinates.lng);
      });
      modalEl.present();
    });
  }


  private createPlace(lat: number, lng: number) {

    const pickedLocation: PlaceLocation = {
      // lat: modalData.data.lat,
      // lng: modalData.data.lng,
      lat: lat,
      lng: lng,
      address: null,
      staticMapImageUrl: null
    };
    this.isLoading = true;
    // this.getAddress(modalData.data.lat, modalData.data.lng)
    this.getAddress(lat, lng)
      .pipe(
        switchMap(address => {
          pickedLocation.address = address;
          return of(
            this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14)
          );
        })
      )
      .subscribe(staticMapImageUrl => {
        pickedLocation.staticMapImageUrl = staticMapImageUrl;
        this.selectedLocationImage = staticMapImageUrl;
        this.isLoading = false;
        this.locationPick.emit(pickedLocation);
      });
  }

  private getAddress(lat: number, lng: number) {
    return this.http
      .get<any>(
        // json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
        environment.googleMapsAPIKey}`
      )
      .pipe(
        map(geoData => {
          if (!geoData || !geoData.results || geoData.results.length === 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        })
      );
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}
    &key=${environment.googleMapsAPIKey}`;
  }

  //   https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300&maptype=roadmap
  // &markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318
  // &markers=color:red%7Clabel:C%7C40.718217,-73.998284
  // &key=YOUR_API_KEY
}