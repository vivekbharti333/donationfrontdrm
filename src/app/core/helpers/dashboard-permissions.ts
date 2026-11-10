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

const defaultDashboardPermissions = new Map<string, string>([
  ['MAINADMIN', 'dashboard'],
  ['SUPERADMIN', 'donation-dashboard'],
  ['ADMIN', 'donation-dashboard'],
  ['TEAM_LEADER', 'donation-dashboard'],
  ['FUNDRAISING_OFFICER', 'donation-dashboard'],
  ['DONOR_EXECUTIVE', 'call-dashboard'],
]);

const mainAdminMenuPermissions = [
  'dashboard', 'call-dashboard', 'donation-dashboard', 'campaign-dashboard', 'school-dashboard',
  'create-user', 'user-list', 'roles-permission', 'add-donation', 'all-donation-list',
  'pay-mode-report', 'fundrising-officer-report', 'payment-mode-master', 'payment-mode', 'program',
  'currency-master', 'currency', 'add-receipt-header', 'receipt-header-list',
  'whats-app-integration', 'whats-app-inbox', 'add-whats-app-templates', 'whats-app-templates',
  'campaign-details', 'send-campaign', 'campaign-report', 'add-student', 'student-list', 'grade',
  'student-academic', 'generate-school-receipt', 'school-receipt-list', 'fee-type', 'fee-structure',
  'fee-assignment', 'generate-invoice', 'invoice-list', 'item-details', 'customer-details',
  'create-lead', 'follow-up', 'followup', 'lead-list', 'info', 'enquiry', 'hot-lead',
  'importaint-lead', 'pending-payment', 'won-lead', 'lost-lead', 'assigned-lead', 'reserved',
  'category-type', 'super-category', 'category', 'sub-category', 'general-setting',
  'company-setting', 'email-setting', 'sms-setting', 'otp-setting', 'payment-mode-report',
  'payment-report', 'attendance-list', 'attendance-mark', 'attendance-report',
];

const menuPermissionAliases = new Map<string, string[]>([
  ['pay-mode-report', ['payment-report', 'payment-mode-report']],
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

export function permissionsWithDashboardFallback(permissions: string[], roleType: unknown): string[] {
  const role = String(roleType || '').trim().toUpperCase();
  const menuPermissions = permissions.filter(permission => !dashboardRoutes.has(permission));
  if (role === 'MAINADMIN' && !menuPermissions.length) return [...mainAdminMenuPermissions];
  if (permittedDashboardRoutes(permissions).length) return permissions;
  const defaultPermission = defaultDashboardPermissions.get(role);
  return defaultPermission ? [...permissions, defaultPermission] : permissions;
}

export function hasMenuPermission(permissions: string[], permission: string): boolean {
  const dashboardRoute = dashboardRoutes.get(permission);
  return dashboardRoute
    ? permittedDashboardRoutes(permissions).includes(dashboardRoute)
    : permissions.includes(permission)
      || (menuPermissionAliases.get(permission)?.some(alias => permissions.includes(alias)) ?? false);
}
