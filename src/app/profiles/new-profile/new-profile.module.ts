import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewProfilePageRoutingModule } from './new-profile-routing.module';

import { NewProfilePage } from './new-profile.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    NewProfilePageRoutingModule,
    SharedModule
  ],
  declarations: [NewProfilePage]
})
export class NewProfilePageModule {}
