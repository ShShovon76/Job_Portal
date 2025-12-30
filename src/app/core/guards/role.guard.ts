import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot) {

    const requiredRoles = route.data['roles'] as string[];
    const user = this.auth.getCurrentUserSnapshot();

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const hasRole = requiredRoles.includes(user.role!);

    if (!hasRole) {
      this.router.navigate(['/403']);
      return false;
    }

    return true;
  }
}
