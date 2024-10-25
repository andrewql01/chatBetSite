import {CanActivateFn, Router} from '@angular/router';
import { LocalStorageService } from '../auth_services/localstorage.service';
import { LoginService } from '../auth_services/login.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { JWTTokenService } from '../auth_services/jwt-token.service';

@Injectable({
  providedIn: 'root'
})

export class AuthorizeGuard implements CanActivate {
  constructor(private loginService: LoginService,
              private jwtService: JWTTokenService,
              private router: Router) {
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if (this.jwtService.getUser()) {
          if (this.jwtService.isTokenExpired()) {
            return this.router.navigate(['/login']);
          } else {
            return true;
          }
      } else {
        return new Promise((resolve) => {
          this.loginService.signInCallBack().then((e) => {
             resolve(true);
          }).catch((e) => {
            return this.router.navigate(['/login']);
          });
        });
      }
  }
}
