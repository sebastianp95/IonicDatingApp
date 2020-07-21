import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { map, take, switchMap, tap } from 'rxjs/operators';
import { Chat } from './chat.model';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';
import { firestore } from 'firebase';
import { HttpClient } from '@angular/common/http';
import { ProfilesService } from '../profiles/profiles.service';



interface ChatData {
  chatId: string;
  currentUserId: string;
  matchedUserId: string;
  // public messageDate: Date,
}

interface MessageData {

  fetchedUserId: string;
  createdAt: Date;
  messages: [];

  // createdAt: number;
  // message: string;
  // fetchedUserId,
  // messagesMap: { userId: '', messages: [] };
}


@Injectable({
  providedIn: 'root'
})
export class ChatsService {



  private _chats = new BehaviorSubject<Chat[]>([]);

  get chats() {
    // return [...this._places];
    return this._chats.asObservable();
  }
  constructor(
    private fireStore: AngularFirestore,
    private authService: AuthService,
    private profilesService: ProfilesService,
    private http: HttpClient,
    private router: Router
  ) { }


  getChat(chatId) {
    console.log(' What??', chatId);
    return this.fireStore
      .collection<any>('chats')
      .doc(chatId)
      .snapshotChanges()
      .pipe(
        map(doc => {

          console.log(' documento data', doc.payload.data());
          return { id: doc.payload.id, ...doc.payload.data() as MessageData };
        })
      );
  }

  match(
    matchedProfileId: string
    // dateFrom: Date, dateTo: Date,
  ) {
    let fetchedUserId: string;
    let myProfileId: string;
    let newChat: Chat;

    return this.authService.userId.pipe(
      take(1), switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found');
        }
        fetchedUserId = userId;
        // return this.router.navigate(['chats', docRe f.id]);
        return this.profilesService.getProfileByUserId(userId);

      }), take(1), switchMap(myProfile => {

        myProfileId = myProfile.id;

        return this.authService.token;
      }
      ), take(1), switchMap(
        token => {
          if (!token) {
            throw new Error('Token not found');
          }

          return this.http
            .get<{ [key: string]: ChatData }>(
              `https://ionic-project-v2.firebaseio.com/matches.json?auth=${token}`
            );

        }),
      map(resData => {
        // const chats = [];
        let hasFoundIt = false;
        for (const key in resData) {

          if (resData.hasOwnProperty(key)) {
            if (resData[key].currentUserId === matchedProfileId
              && resData[key].matchedUserId === myProfileId) {

              hasFoundIt = true;
              console.log('This person has liked you');

              // then put in chats options (chatItemOtion)

              newChat = new Chat(
                key,
                resData[key].chatId,
                resData[key].currentUserId,
                resData[key].matchedUserId);

            }
          }
        }

        if (!hasFoundIt) {
          this.createMatch(myProfileId, matchedProfileId).subscribe();
        } else {

          return newChat;
        }

      }));
  }

  createMatch(myProfileId: string, matchedprofileId: string) {
    let newChat: Chat;
    let chatId: string;
    let token: string;
    let generatedId: string;
    return this.authService.token.pipe(take(1), switchMap(fetchedToken => {

      token = fetchedToken;
      const data = {
        createdAt: Date.now()
      };

      return this.fireStore.collection('chats').add(data);

    }), take(1), switchMap(docRef => {

      chatId = docRef.id;

      newChat = new Chat(
        Math.random().toString(),
        chatId,
        myProfileId,
        matchedprofileId
      );

      return this.http
        .post<{ name: string }>(
          `https://ionic-project-v2.firebaseio.com/matches.json?auth=${token}`,
          {
            ...newChat,
            id: null
          }
        );
    }), take(1), switchMap(resData => {
      generatedId = resData.name;
      return this.chats;
    }), take(1), tap(chats => {
      newChat.id = generatedId;
      this._chats.next(chats.concat(newChat));
    })
    );
  }





  // createChat(
  //   matchedProfileId: string
  //   // dateFrom: Date, dateTo: Date,
  // ) {
  //   let generatedId: string;
  //   let newChat: Chat;
  //   let fetchedUserId: string;
  //   let myProfileId: string;
  //   let chatId: string;

  //   return this.authService.userId.pipe(
  //     take(1), switchMap(userId => {
  //       if (!userId) {
  //         throw new Error('No user id found');
  //       }
  //       fetchedUserId = userId;
  //       // return this.router.navigate(['chats', docRe f.id]);
  //       return this.profilesService.getProfileByUserId(userId);

  //     }), take(1), switchMap(myProfile => {

  //       myProfileId = myProfile.id;
  //       const data = {
  //         fetchedUserId,
  //         createdAt: Date.now()
  //       };

  //       return this.fireStore.collection('chats').add(data);

  //     }
  //     ), take(1), switchMap(docRef => {

  //       if (docRef !== null) {
  //         chatId = docRef.id;
  //       }

  //       // console.log(chatId);
  //       return this.authService.token;
  //     }), take(1), switchMap(
  //       token => {
  //         if (!fetchedUserId) {
  //           throw new Error('User not found');
  //         }

  //         newChat = new Chat(
  //           Math.random().toString(),
  //           chatId,
  //           myProfileId,
  //           matchedProfileId
  //           // dateFrom,
  //           // dateTo,
  //         );

  //         return this.http
  //           .post<{ name: string }>(
  //             `https://ionic-project-v2.firebaseio.com/matches.json?auth=${token}`,
  //             {
  //               ...newChat,
  //               id: null
  //             }
  //           );

  //       }), take(1), switchMap(resData => {
  //         generatedId = resData.name;
  //         return this.chats;
  //       }), take(1), tap(chats => {
  //         newChat.id = generatedId;
  //         this._chats.next(chats.concat(newChat));
  //       })
  //   );
  // }


  getChatInfo(id: string) {
    return this.authService.token.pipe(take(1), switchMap(token => {
      return this.http
        .get<ChatData>(
          `https://ionic-project-v2.firebaseio.com/matches/${id}.json?auth=${token}`
        );
    }),
      map(pData => {
        return new Chat(
          id,
          pData.chatId,
          pData.currentUserId,
          pData.matchedUserId
          // new Date(placeData.availableFrom),
          // new Date(placeData.availableTo),
          // placeData.userId,
        );
      })
    );
  }

  fetchMatches() {
    return this.authService.token.pipe(take(1), switchMap(token => {

      return this.http
        .get<{ [key: string]: ChatData }>(
          `https://ionic-project-v2.firebaseio.com/matches.json?auth=${token}`
        );
    }),
      map(resData => {
        const chats = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            chats.push(
              new Chat(
                key,
                resData[key].chatId,
                resData[key].currentUserId,
                resData[key].matchedUserId
                // new Date(resData[key].availableFrom),
                // new Date(resData[key].availableTo),

              )
            );
          }
        }
        return chats;
        // return [];
      }),
      tap(chats => {
        this._chats.next(chats);
      })
    );
  }




  sendMessage(chatId, message) {


    let fetchedUserId: string;
    return this.authService.userId.pipe(take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found');
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1), switchMap(
        token => {
          if (!fetchedUserId) {
            throw new Error('User not found');
          }

          const data = {
            fetchedUserId,
            message,
            createdAt: Date.now(),
          };

          // console.log('chat id ', chatId, 'mensage ', message);

          const ref = this.fireStore.collection('chats').doc(chatId);
          return ref.update({
            messages: firestore.FieldValue.arrayUnion(data)
          });

        })
      //   , take(1),
      // switchMap(resData => {
      //   generatedId = resData.name;
      //   return this.profiles;
      // }),
      // take(1),
      // tap(profiles => {
      //   newProfile.id = generatedId;
      //   this._profiles.next(profiles.concat(newProfile));
      // })
    );
  }

}
