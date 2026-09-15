import { routes } from './routes';

const dashboardRoutes = new Map<string, string>([
  ['dashboard', routes.salesDashboard],
  ['sales-dashboard', routes.salesDashboard],
  ['sale-dashboard', routes.donationDashboard],
  ['donation-dashboard', routes.donationDashboard],
  ['admin-dashboard', routes.adminDashboard],
  ['call-dashboard', routes.adminDashboard],
  ['campaign-dashboard', routes.campaignDashboard],
  ['school-dashboard', routes.schoolDashboard],
]);

export function parsePermissions(value: unknown): string[] {
  // Accept API arrays, serialized arrays, and older double-encoded sessions.
  for (let depth = 0; typeof value === 'string' && depth < 3; depth++) {
    try {
      try {
        value = JSON.parse(value);
      } catch {
        value = JSON.parse((value as string).replace(/'/g, '"'));
      }
    } catch {
      return [];
    }
  }
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === 'string')
        .map(item => item.trim().toLowerCase()).filter(Boolean))]
    : [];
}

export function permittedDashboardRoutes(permissions: string[]): string[] {
  return [...new Set(permissions.flatMap(permission => {
    const route = dashboardRoutes.get(permission);
    return route ? [route] : [];
  }))];
}

export function hasMenuPermission(permissions: string[], permission: string): boolean {
  const dashboardRoute = dashboardRoutes.get(permission);
  return dashboardRoute
    ? permittedDashboardRoutes(permissions).includes(dashboardRoute)
    : permissions.includes(permission);
}
