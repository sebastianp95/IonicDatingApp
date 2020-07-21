import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Profile } from 'src/app/profiles/profile.model';
import { ProfilesService } from '../../profiles/profiles.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { ProfileLocation } from 'src/app/profiles/location.model';
import { AuthService } from 'src/app/auth/auth.service';
import { take, switchMap } from 'rxjs/operators';
import { ChatsService } from '../chats.service';

interface MessagesData {
  id: string;
  fetchedUserId: string;
  createdAt: Date;
  messages: [];

}


@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.page.html',
  styleUrls: ['./conversation.page.scss'],
})
export class ConversationPage implements OnInit, OnDestroy {
  // form: FormGroup;
  profile: Profile;
  profileId: string;
  name: string;
  age: number;
  imageUrl: string;

  messages: [];

  chat$: Observable<any>;
  newMsg: string;
  chatId: string;
  userId: string;


  location: ProfileLocation;
  isLoading = false;
  private profileSub: Subscription;
  // @Input() profilein: Profile;

  isMatchable = false;
  sentbyMe = true;

  constructor(
    private route: ActivatedRoute,
    private profilesService: ProfilesService,
    private chatsService: ChatsService,
    private navCtrl: NavController,
    private router: Router,
    private authService: AuthService,
    // private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('chatId')) {
        this.navCtrl.navigateBack('/places/chats');
        return;
      }
      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.userId.pipe(take(1), switchMap(useId => {

        if (!useId) {
          throw new Error('User not found');
        }
        fetchedUserId = useId;
        this.userId =useId;
        return this.chatsService.getChatInfo(paramMap.get('chatId'));

      })
        ,
        take(1), switchMap(match => {

          this.chatId = match.chatId;
          return this.profilesService
            .getProfile(match.matchedUserId);


        })
        ,
        take(1), switchMap(profile => {

          this.profile = profile;
          this.name = profile.name;
          this.imageUrl = profile.imageUrl;

          this.isLoading = false;
          this.isMatchable = profile.userId !== fetchedUserId;
          // this.incomingMessage = profile.userId !== fetchedUserId;




          return this.chatsService.getChat(this.chatId);

        })
      ).subscribe(chat => {
        // this.chat = chat;


        console.log('messages', chat.messages);
        this.messages = chat.messages;
        console.log('created at', chat.createdAt);


        // this.chat$ = this.joinUsers(chat);

        // chat.messages
        // this.form = new FormGroup({
        //   title: new FormControl(this.place.title, {
        //     updateOn: 'blur',
        //     validators: [Validators.required]
        //   }),
        //   description: new FormControl(this.place.description, {
        //     updateOn: 'blur',
        //     validators: [Validators.required, Validators.maxLength(180)]
        //   })
        // });

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



    });



  }

  submit(chatId) {
    console.log(this.newMsg);
    this.chatsService.sendMessage(chatId, this.newMsg).subscribe();
    this.newMsg = '';
  }

  trackByCreated(i, msg) {
    return msg.createdAt;
  }

  joinUsers(chat$: Observable<any>) {
    let chat;
    const joinKeys = {};

    return chat$.pipe(
      switchMap(c => {
        // Unique User IDs
        chat = c;
        const uids = Array.from(new Set(c.messages.map(v => v.uid)));

        chat.messages = chat.messages.map(v => {
          return { ...v, user: joinKeys[v.uid] };
        });

        return chat;
      })
    );
  }

  // openBookingModal(mode: 'select' | 'random') {
  //   console.log(mode);
  //   this.modalCtrl
  //     .create({
  //       component: CreateBookingComponent,
  //       componentProps: { selectedPlace: this.place, selectedMode: mode }
  //     })
  //     .then(
  //       modalEl => {
  //         modalEl.present();
  //         return modalEl.onDidDismiss();
  //       })
  //     .then(resultData => {
  //       console.log(resultData.data, resultData.role);
  //       if (resultData.role === 'confirm') {
  //         console.log('BOOKED');
  //         this.loadingCtrl
  //           .create({ message: 'Booking place...' })
  //           .then(loadingEl => {
  //             loadingEl.present();
  //             const data = resultData.data.bookingData;
  //             this.bookingService
  //               .addBooking(
  //                 this.place.id,
  //                 this.place.title,
  //                 this.place.imageUrl,
  //                 data.firstName,
  //                 data.lastName,
  //                 data.guestNumber,
  //                 data.startDate,
  //                 data.endDate
  //               )
  //               .subscribe(() => {
  //                 loadingEl.dismiss();
  //               });
  //           });
  //       }
  //     });
  // }

  ngOnDestroy() {
    if (this.profileSub) {
      this.profileSub.unsubscribe();
    }
  }

}
