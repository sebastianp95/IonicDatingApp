import { Component, OnInit } from '@angular/core';
import { AuthService, AuthResponseData } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  isLoading = false;
  isLogin = true;

  ngOnInit() {
  }
  authenticate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging in...' })
      .then(loadingEl => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.signup(email, password);
        }
        authObs.subscribe(
          resData => {
            console.log(resData);
            this.isLoading = false;
            loadingEl.dismiss();
            if (!this.isLogin) {
              this.router.navigateByUrl('/profiles/new-profile');
            } else {
              this.router.navigateByUrl('/places/discover');
            }
          },
          errRes => {
            loadingEl.dismiss();
            const code = errRes.error.error.message;
            let message = 'Could not sign you up, please try again.';
            if (code === 'EMAIL_EXISTS') {
              message = 'This email address exists already!';
            } else if (code === 'EMAIL_NOT_FOUND') {
              message = 'E-Mail address could not be found.';
            } else if (code === 'INVALID_PASSWORD') {
              message = 'This password is not correct.';
            }
            this.showAlert(message);
          }
        );
      });
  }
  // onLogin() {
  //   this.isLoading = true;
  //   this.authService.login();
  //   this.loadingCtrl
  //     .create({ keyboardClose: true, message: 'Logging in...' })
  //     .then(loadingEl => {
  //       loadingEl.present();
  //       setTimeout(() => {
  //         this.isLoading = false;
  //         loadingEl.dismiss();
  //         this.router.navigateByUrl('/places/discover');
  //       }, 1500);
  //     });

  // }

  onSwitchAuthMode() {

    this.isLogin = !this.isLogin;
  }

  onQuickEntrance() {
    console.log('hello?');

    this.authenticate('test3@test.com', 'test3test3');
  }
  onQuickEntranceFemale() { 

    this.authenticate('test7@test.com', 'test7test7');
  }

onSubmit(form: NgForm) {
  if (!form.valid) {
    return;
  }
  const email = form.value.email;
  const password = form.value.password;
  // console.log(email, password);


  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //must change
  // !!!!!!!!!!!!!!
  this.authenticate(email, password);

  // this.authenticate('test2@test.com', 'test2test2');

  // if (this.isLogin) {
  //   // Send a request to login servers
  // } else {
  //   this.authService.signup(email, password).subscribe(resData => {
  //     console.log(resData);
  //   });
  // }
}
  private showAlert(message: string) {
  this.alertCtrl
    .create({
      header: 'Authentication failed',
      message: message,
      buttons: ['Okay']
    })
    .then(alertEl => alertEl.present());
}
}
