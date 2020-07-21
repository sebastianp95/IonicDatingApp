import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProfilesService } from '../profiles.service';
import { MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import { Profile } from '../profile.model';
import { take, switchMap } from 'rxjs/operators';
import { ChatsService } from 'src/app/chats/chats.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
})
export class ExplorePage implements OnInit, OnDestroy {

  loadedProfiles: Profile[];
  listedLoadedProfiles: Profile[];
  relevantProfiles: Profile[];
  isLoading = false;
  private profilesSub: Subscription;
  currentIndex: number;
  // private filter = 'all';

  results = [];
  matchs = [];


  constructor(
    private profilesService: ProfilesService,
    private menuCtrl: MenuController,
    private authService: AuthService,
    private chatsService: ChatsService

  ) {
    // this.currentIndex = this.listedLoadedProfiles.length - 1;
    // console.log(this.currentIndex);
  }

  ngOnInit() {
    this.profilesSub = this.profilesService.profiles
      .subscribe(profiles => {

        this.loadedProfiles = profiles;
        this.relevantProfiles = this.loadedProfiles;
        this.filterUser();
        // this.filterInterest();

        this.listedLoadedProfiles = this.relevantProfiles.slice(1);
      });
  }
  filterInterest() {
    let currentUserInterest;
    this.profilesService.profiles
      .subscribe(profiles => {
        profiles.filter(profile => {
          console.log('filter Interest name', profile.name);
          console.log('filter Interest interested in', profile.interestedIn);
          currentUserInterest = profile.interestedIn;
        });
        this.relevantProfiles = this.loadedProfiles.filter(
          profile => profile.gender === currentUserInterest

        );
      });

  }
  filterUser() {



    this.authService.userId.pipe(take(1)).subscribe(userId => {

      this.relevantProfiles = this.loadedProfiles.filter(
        profile => profile.userId !== userId
      );
    });

  }

  // preference() {

  //   let userId: string;

  //   this.authService.userId.pipe(take(1), switchMap(userId => {

  //     userId = userId;

  //     this.relevantProfiles = this.loadedProfiles.filter(
  //       profile => profile.userId !== userId
  //     );
  //   }));

  //   this.profilesService.


  //   this.authService.userId.pipe(take(1)).subscribe(userId => {

  //     userId = userId;

  //     this.relevantProfiles = this.loadedProfiles.filter(
  //       profile => profile.userId !== userId
  //     );
  //   });

  // }
  ionViewWillEnter() {
    this.isLoading = true;
    this.profilesService.fetchProfiles().subscribe(() => {
      this.isLoading = false;
    });
  }
  swiped(event: any, index: number) {
    console.log(this.relevantProfiles[index].name + ' swiped ' + event);
    this.relevantProfiles[index].visible = false;
    this.results.push(this.relevantProfiles[index].name + ' swiped ' + event);
    if (event) {
      // console.log(this.relevantProfiles[index].userId);


      this.matchs.push(this.relevantProfiles[index].userId);
      this.chatsService.match(this.relevantProfiles[index].id).subscribe();
    }
    this.currentIndex--;
  }

  swipeleft() {
    this.listedLoadedProfiles[this.currentIndex].visible = false;
    this.results.push(this.listedLoadedProfiles[this.currentIndex].name + ' swiped false');
    this.currentIndex--;
  }

  swiperight() {
    this.listedLoadedProfiles[this.currentIndex].visible = false;
    this.results.push(this.listedLoadedProfiles[this.currentIndex].name + ' swiped true');
    this.currentIndex--;
    // console.log('profile id ', this.listedLoadedProfiles[this.currentIndex].id);
    // this.chatsService.match(this.listedLoadedProfiles[this.currentIndex].id);
  }
  ngOnDestroy() {
    if (this.profilesSub) {
      this.profilesSub.unsubscribe();
    }
  }
}
