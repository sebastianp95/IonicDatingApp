import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatsPageRoutingModule } from './chats-routing.module';
import { ChatItemComponent } from './chat-item/chat-item.component';
import { ChatsPage } from './chats.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatsPageRoutingModule
  ],
  declarations: [ChatsPage, ChatItemComponent],
  // providers: [AngularFirestore],
  exports: [ChatsPage]
})
export class ChatsPageModule {}
