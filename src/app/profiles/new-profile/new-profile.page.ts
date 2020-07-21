import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProfilesService } from '../profiles.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
// import { PlaceLocation } from '../../places/location.model';
import {ProfileLocation} from '../location.model';
import { switchMap } from 'rxjs/operators';

function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

@Component({
  selector: 'app-new-profile',
  templateUrl: './new-profile.page.html',
  styleUrls: ['./new-profile.page.scss'],
})
export class NewProfilePage implements OnInit {

  form: FormGroup;

  constructor(
    private profilesService: ProfilesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      age: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      gender: new FormControl(null, {
        updateOn: 'blur',
          validators: [Validators.required]
      }),
      interestedIn: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      visible: new FormControl(null, {
        updateOn: 'blur'
        // ,
        // validators: [Validators.required]
      }),
      // dateTo: new FormControl(null, {
      //   updateOn: 'blur',
      //   validators: [Validators.required]
      // }),
      location: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null)
    });
  }

  onLocationPicked(location: ProfileLocation) {
    this.form.patchValue({ location: location });
  }

  onImagePicked(imageData: string | File) {
    let imageFile;

    if (typeof imageData === 'string') {
      try {
        if (imageData.includes('image/png')) {
          imageFile = base64toBlob(imageData.replace('data:image/png;base64,', ''), 'image/png');
        } else {
          imageFile = base64toBlob(imageData.replace('data:image/jpeg;base64,', ''), 'image/jpeg');
        }
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      imageFile = imageData;
    }
    this.form.patchValue({ image: imageFile });
  }

  onCreateProfile() {
    if (!this.form.valid || !this.form.get('image').value) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Creating profile...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.profilesService.uploadImage(this.form.get('image').value)
          .pipe(
            switchMap(uploadRes => {
              return this.profilesService.addProfile(
                this.form.value.name,
                +this.form.value.age,
                uploadRes.imageUrl,
                this.form.value.gender,
                this.form.value.interestedIn,
                this.form.value.description,
                this.form.value.visible,
                // new Date(this.form.value.dateFrom),
                // new Date(this.form.value.dateTo),
                this.form.value.location
              );
            })
          ).subscribe(profile => {
            // profile.
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(['/profiles/explore']);
          });
      });
  }



}
