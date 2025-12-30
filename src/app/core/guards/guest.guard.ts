import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    const user = this.auth.getCurrentUserSnapshot();

    if (user) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}

