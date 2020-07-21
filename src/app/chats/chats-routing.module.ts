import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatsPage } from './chats.page';

const routes: Routes = [
  {
    path: '',
    component: ChatsPage
  }
  // ,
  // {
  //   path: 'conversation/:profileId',
  //   loadChildren: () => import('./conversation/conversation.module').then( m => m.ConversationPageModule)
  // }
  ,
  {
    path: 'conversation/:chatId',
    loadChildren: () => import('./conversation/conversation.module').then( m => m.ConversationPageModule)
  }
  // ,
  // {
  //   path: ':profileId',
  //   loadChildren: () => import('./conversation/conversation.module').then( m => m.ConversationPageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatsPageRoutingModule {}
