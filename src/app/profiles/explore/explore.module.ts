import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExplorePageRoutingModule } from './explore-routing.module';

import { ExplorePage } from './explore.page';
import {SwipeCardLibModule} from 'ng-swipe-card';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExplorePageRoutingModule,
    SwipeCardLibModule
  ],
  declarations: [ExplorePage]
})
export class ExplorePageModule {}
