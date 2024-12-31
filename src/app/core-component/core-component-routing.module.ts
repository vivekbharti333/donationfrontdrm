import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreComponentComponent } from './core-component.component';
import { AuthGuard } from '../core/core.index'; 
const routes: Routes = [
  {
    path: '',
    component: CoreComponentComponent,
    children: [
      {
        path: 'charts',
        loadChildren: () =>
          import('./charts/charts.module').then((m) => m.ChartsModule),
      },
      {
        path: 'icons',
        loadChildren: () =>
          import('./icons/icons.module').then((m) => m.IconsModule),
      },
      {
        path: 'forms',
        loadChildren: () =>
          import('./forms/forms.module').then((m) => m.FormsModule),
      },
      {
        path: 'table',
        loadChildren: () =>
          import('./table/table.module').then((m) => m.TableModule),
      },
      {
        path: 'application',
        loadChildren: () =>
          import('././main/application/application.module').then(
            (m) => m.ApplicationModule
          ),
      },
      {
        path: 'base-ui',
        loadChildren: () =>
          import('./base-ui/base-ui.module').then((m) => m.BaseUiModule),
      },
      {
        path: 'advanced-ui',
        loadChildren: () =>
          import('./advanced-ui/advanced-ui.module').then(
            (m) => m.AdvancedUiModule
          ),
      },
      {
        path: 'hrm',
        loadChildren: () => import('./hrm/hrm.module').then((m) => m.HrmModule),
      },
      {
        path: 'promo',
        loadChildren: () =>
          import('./promo/promo.module').then((m) => m.PromoModule),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('./inventory/inventory.module').then((m) => m.InventoryModule),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('./pages/pages.module').then((m) => m.PagesModule),
      },

      {
        path: 'receipt-management',
        loadChildren: () =>
          import('./receipt-management/receipt-management.module').then((m) => m.ReceiptManagementModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'thank-you',
        loadChildren: () =>
          import('./thank-you/thank-you.module').then((m) => m.ThankYouModule),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./main/dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'user-management',
        loadChildren: () =>
          import('./user-management/user-management.module').then(
            (m) => m.UserManagementModule
          ),
          canActivate: [AuthGuard],
      },
      {
        path: 'donation-management',
        loadChildren: () =>
          import('./donation-management/donation-management.module').then(
            (m) => m.DonationManagementModule
          ),
          canActivate: [AuthGuard],
      },
      {
        path: 'payment-mode-management',
        loadChildren: () =>
          import('./payment-mode-management/payment-mode-management.module').then(
            (m) => m.PaymentModeManagementModule
          ),
          canActivate: [AuthGuard],
      },
      {
        path: 'program-management',
        loadChildren: () =>
          import('./program-management/program-management.module').then(
            (m) => m.ProgramManagementModule
          ),
          canActivate: [AuthGuard],
      },
      {
        path: 'currency-management',
        loadChildren: () =>
          import('./currency-management/currency-management.module').then(
            (m) => m.CurrencyManagementModule
          ),
      },
      // {
      //   path: 'receipt-management',
      //   loadChildren: () =>
      //     import('./receipt-management/receipt-management.module').then(
      //       (m) => m.ReceiptManagementModule
      //     ),
      // },
      {
        path: 'lead-management',
        loadChildren: () =>
          import('./lead-management/lead-management.module').then(
            (m) => m.LeadManagementModule
          ),
          
      },
      {
        path: 'category-management',
        loadChildren: () =>
          import('./categories-management/categories-management.module').then(
            (m) => m.CategoriesManagementModule
          ),
      },
      {
        path: 'sales',
        loadChildren: () =>
          import('./sales/sales.module').then((m) => m.SalesModule),
      },
      {
        path: 'stock',
        loadChildren: () =>
          import('./stock/stock.module').then((m) => m.StockModule),
      },
      {
        path: 'purchase',
        loadChildren: () =>
          import('./purchase/purchase.module').then((m) => m.PurchaseModule),
      },
      {
        path: 'expense',
        loadChildren: () =>
          import('./expense/expense.module').then((m) => m.ExpenseModule),
      },
      {
        path: 'people',
        loadChildren: () =>
          import('./people/people.module').then((m) => m.PeopleModule),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./reports/reports.module').then((m) => m.ReportsModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoreComponentRoutingModule {}
