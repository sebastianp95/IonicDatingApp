import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { take, tap, switchAll, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(private authService: AuthService, private router: Router) { }

  canLoad(
    route: Route,
    segments: UrlSegment[]): boolean | Promise<boolean> | Observable<boolean> {
    return this.authService.userIsAuthenticated
      .pipe(
        take(1),
        switchMap(
          isAthenticated => {

            if (!isAthenticated) {
              return this.authService.autoLogin();
            } else {
              return of(isAthenticated);
            }
          }
        ),
        tap(isAthenticated => {
          if (!isAthenticated) {
            this.router.navigateByUrl('/auth');
          }
        }));
  }


}
