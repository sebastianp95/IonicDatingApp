import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlacesPageRoutingModule } from './places-routing.module';

import { PlacesPage } from './places.page';
import { Routes } from '@angular/router';

// const routes: Routes=[
// {
//   path: '',
//   component: PlacesPage
// }
// ];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlacesPageRoutingModule
  ],
  declarations: [PlacesPage]
})
export class PlacesPageModule {}
