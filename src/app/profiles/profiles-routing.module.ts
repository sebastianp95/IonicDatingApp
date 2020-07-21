import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfilesPage } from './profiles.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilesPage
  },
  {
    path: 'new-profile',
    loadChildren: () => import('./new-profile/new-profile.module').then( m => m.NewProfilePageModule)
  }
  ,
  {
    path: 'explore',
    loadChildren: () => import('./explore/explore.module').then(m => m.ExplorePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilesPageRoutingModule {}
