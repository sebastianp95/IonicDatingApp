import { Component, OnInit, Input } from '@angular/core';
import { Profile } from '../../profiles/profile.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Chat } from '../chat.model';
import { ProfilesService } from 'src/app/profiles/profiles.service';
import { ChatsService } from '../chats.service';
import { take, switchMap, tap } from 'rxjs/operators';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';




@Component({
  selector: 'app-chat-item',
  templateUrl: './chat-item.component.html',
  styleUrls: ['./chat-item.component.scss'],
})
export class ChatItemComponent implements OnInit {

  // @Input() profile: Profile;
  // Apply one we implement Match table
  @Input() chat: Chat;
  profile: Profile;
  profileId: string;
  profileName: string;
  profileImageUrl: string;
  private chatSub: Subscription;
  chatId: string;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private profilesService: ProfilesService,
    private navCtrl: NavController,
    private chatsService: ChatsService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) { }

  ngOnInit() {

    // this.profile = this.profilesService.getProfile(paramMap.get('profileId'));
      // this.profileId = paramMap.get('profileId');
      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.userId.pipe(take(1), switchMap(useId => {

        if (!useId) {
          throw new Error('User not found');
        }
        fetchedUserId = useId;

        return this.chatsService.getChatInfo(this.chat.id);


      })
        ,
        take(1), switchMap(match => {
          this.profileId = match.matchedUserId;
          this.chatsService.getChat(match.id).subscribe(chat => {
            console.log('CHAT ITEM  message' + chat.messages);
          });
          return this.profilesService
            .getProfile(this.profileId);


        })
      ).subscribe(profile => {


        this.profile = profile;

        this.profileName = profile.name;
        this.profileImageUrl = profile.imageUrl;

        console.log(this.profile.name);
        this.isLoading = false;

      },
        error => {
          this.alertCtrl
            .create({
              header: 'An error occurred!',
              message: 'Chat could not be fetched. Please try again later.',
              buttons: [
                {
                  text: 'Okay',
                  handler: () => {
                    this.router.navigate(['/places/chats']);
                  }
                }
              ]
            })
            .then(alertEl => {
              alertEl.present();
            });
        }
      );
  }

  openChat(chatId: string) {
    this.router.navigate(['/', 'places', 'chats', 'conversation', chatId]);

    console.log('Chat id', chatId);
  }

}
