import { CanActivateFn } from '@angular/router';
import { LocalStorageService } from '../services/localstorage.service';
import { LoginService } from '../services/login.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { JWTTokenService } from '../services/jwt-token.service';

@Injectable({
  providedIn: 'root'
})

export class AuthorizeGuard implements CanActivate {
  constructor(private loginService: LoginService,
              private localStorageService: LocalStorageService,
              private jwtService: JWTTokenService) {
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if (this.jwtService.getUser()) {
          if (this.jwtService.isTokenExpired()) {
            // Should Redirect Sig-In Page
            return true;
          } else {
            return true;
          }
      } else {
        return new Promise((resolve) => {
          this.loginService.signInCallBack().then((e) => {
             resolve(true);
          }).catch((e) => {
            // Should Redirect Sign-In Page
          });
        });
      }
  }
}
