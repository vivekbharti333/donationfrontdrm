import { routes } from './routes';
import { hasMenuPermission, parsePermissions, permissionsWithDashboardFallback, permittedDashboardRoutes } from './dashboard-permissions';

describe('dashboard permissions', () => {
  it('uses the MAINADMIN default dashboard when no dashboard permission is assigned', () => {
    const permissions = permissionsWithDashboardFallback(parsePermissions(null), 'MAINADMIN');

    expect(permittedDashboardRoutes(permissions)).toEqual([routes.salesDashboard]);
    expect(permissions).toContain('create-user');
    expect(permissions).toContain('fee-assignment');
  });

  it('fills MAINADMIN menu defaults when only a dashboard permission is stored', () => {
    const permissions = permissionsWithDashboardFallback(['dashboard'], 'MAINADMIN');

    expect(permissions).toContain('user-list');
    expect(permissions).toContain('school-dashboard');
  });

  it('preserves an explicitly assigned dashboard permission', () => {
    const permissions = permissionsWithDashboardFallback(['donation-dashboard'], 'MAINADMIN');

    expect(permittedDashboardRoutes(permissions)).toEqual([routes.donationDashboard]);
  });

  it('uses the call dashboard default for donor executives with no dashboard permission', () => {
    const permissions = permissionsWithDashboardFallback([], 'DONOR_EXECUTIVE');

    expect(permittedDashboardRoutes(permissions)).toEqual([routes.adminDashboard]);
  });

  it('matches the donation report picker permission to its sidebar key', () => {
    expect(hasMenuPermission(['payment-report'], 'pay-mode-report')).toBeTrue();
  });
});