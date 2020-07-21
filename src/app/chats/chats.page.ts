import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ProfilesService } from '../profiles/profiles.service';
import { Profile } from '../profiles/profile.model';
import { IonItemSliding } from '@ionic/angular';
import { Chat } from './chat.model';
import { ChatsService } from './chats.service';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit, OnDestroy {

  profiles: Profile[];
  chats: Chat[];
  //  chat: Chat;
  isLoading = false;
  private profilesSub: Subscription;
  private chatsSub: Subscription;
  constructor(
    private profilesService: ProfilesService,
    private router: Router,
    private chatsService: ChatsService) { }

  ngOnInit() {

    this.loadChats();
    // this.offers = this.placesService.places;
    // this.profilesSub = this.profilesService.profiles.pipe(
    //   take(1), switchMap(profile => {
    //     this.profiles = profile;
    //     return this.chatsService.chats;
    //   })).subscribe(chat => {
    //     this.chats = chat;
    //   });
      // this.chatsSub = this.chatsService.chats.pipe(
      //   take(1), switchMap(chat => {
      //     this.chats = chat;
      //     return this.profilesService.getProfile(chat);
      //   })).subscribe(chat => {
      //     this.chats = chat;
      //   });
   

    // this.placeSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => {
    //   this.place = place;
    // });
    // this.chatsService.getChatInfo('G6Fh7oNSBsf2i1FDsVGw').subscribe(chat => {
    //   this.chat = chat;
    // });
    // this.chats.forEach(element => {
    //   console.log('Holaaa' + element.name);
    // });

  }

  loadChats(){

    this.chatsSub = this.chatsService.chats.subscribe(chat => {
      this.chats = chat;
});


  }

  ionViewWillEnter() {
    this.isLoading = true;
    // this.profilesService.fetchProfiles().subscribe(() => {
    //   this.isLoading = false;
    // });
    this.chatsService.fetchMatches().subscribe(() => {
      this.isLoading = false;
    });

  }

  onEdit(profileId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    // this.router.navigate(['/', 'places', 'offers', 'edit', offerId]);
    console.log('Editing item', profileId);
  }

  ngOnDestroy() {
    // if (this.profilesSub) {
    //   this.profilesSub.unsubscribe();
    // }
    if (this.chatsSub) {
      this.chatsSub.unsubscribe();
    }
  }

}
