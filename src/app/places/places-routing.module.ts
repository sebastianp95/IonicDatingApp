import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlacesPage } from './places.page';

const routes: Routes = [
  {
    path: '',
    component: PlacesPage,
    children: [
      {
        path: 'explore',
        loadChildren: () => import('../profiles/explore/explore.module').then(m => m.ExplorePageModule)
      },
      {
        path: 'discover',
        loadChildren: () => import('./discover/discover.module').then(m => m.DiscoverPageModule)
      },
      {
        path: 'offers',
        loadChildren: () => import('./offers/offers.module').then(m => m.OffersPageModule)
      },
      {
        path: 'chats',
        loadChildren: () => import('../chats/chats.module').then(m => m.ChatsPageModule)
      }
    ]
  }
  // ,
  // {
  //   path: 'explore',
  //   loadChildren: () => import('./explore/explore.module').then( m => m.ExplorePageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlacesPageRoutingModule { }
