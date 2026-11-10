import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { parsePermissions, permissionsWithDashboardFallback, permittedDashboardRoutes } from '../../helpers/dashboard-permissions';
import { routes } from '../../helpers/routes';

@Injectable({ providedIn: 'root' })
export class DashboardPermissionGuard {
  constructor(private router: Router, private authentication: AuthenticationService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.authentication.getLoginUser()) {
      return this.router.parseUrl(routes.signIn);
    }
    const user = this.authentication.getLoginUser();
    const permissions = permissionsWithDashboardFallback(
      parsePermissions(localStorage.getItem('menuPermission')),
      user?.roleType
    );
    const allowed = permittedDashboardRoutes(permissions);
    const requested = `${routes.dashboard}/${route.routeConfig?.path || ''}`;
    return allowed.includes(requested)
      ? true
      : this.router.parseUrl(allowed[0] || routes.error404);
  }
}
