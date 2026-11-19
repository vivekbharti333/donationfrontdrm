import { Component } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';
import { UserManagementService } from '../../user-management/user-management.service';
import { CurrencyMasterService } from '../currency-master/currency-master.service';
import { CurrencyService } from './currency.service';

interface SuperadminOption {
  loginId: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrl: './currency.component.scss'
})
export class CurrencyComponent {
  readonly isMainAdmin: boolean;
  superadminList: SuperadminOption[] = [];
  selectedSuperadminId?: string;
  currencyMasterList: { id: number; currencyName: string; unicode: string }[] = [];
  selectedIds: number[] = [];
  loading = false;
  saving = false;
  selectionLoaded = false;
  superadminError = '';
  catalogStatus = 'Loading currencies…';
  currencyError = '';

  constructor(
    authenticationService: AuthenticationService,
    private userManagementService: UserManagementService,
    private currencyMasterService: CurrencyMasterService,
    private currencyService: CurrencyService,
  ) {
    this.isMainAdmin = authenticationService.getLoginUser()?.roleType === Constant.mainAdmin;
  }

  ngOnInit(): void {
    this.currencyMasterService.getCurrencyMasterList().subscribe({
      next: response => {
        if (Number(response?.responseCode) === 200 && Array.isArray(response?.listPayload)) {
          this.currencyMasterList = response.listPayload;
        }
        this.catalogStatus = [200, 204].includes(Number(response?.responseCode))
          ? 'No currencies available.'
          : 'Unable to load available currencies.';
      },
      error: () => this.catalogStatus = 'Unable to load available currencies.',
    });

    if (this.isMainAdmin) {
      this.userManagementService.getUserDetailsList().subscribe({
        next: response => {
          if (Number(response?.responseCode) === 200 && Array.isArray(response?.listPayload)) {
            this.superadminList = response.listPayload;
          } else if (Number(response?.responseCode) !== 204) {
            this.superadminError = 'Unable to load Superadmins.';
          }
        },
        error: () => this.superadminError = 'Unable to load Superadmins.',
      });
    } else {
      this.getCurrencyDetailBySuperadmin();
    }
  }

  getCurrencyDetailBySuperadmin(superadminId?: string): void {
    if (this.loading || this.saving || (this.isMainAdmin && !superadminId)) return;

    this.selectedSuperadminId = superadminId;
    this.selectedIds = [];
    this.selectionLoaded = false;
    this.currencyError = '';
    this.loading = true;

    this.currencyService.getCurrencyDetailBySuperadmin(superadminId).pipe(
      finalize(() => this.loading = false),
    ).subscribe({
      next: response => {
        const code = Number(response?.responseCode);
        if (code === 200 && Array.isArray(response?.listPayload)) {
          this.selectedIds = response.listPayload.map((currency: { id: number }) => currency.id);
          this.selectionLoaded = true;
        } else if (code === 204) {
          this.selectionLoaded = true;
        } else {
          this.currencyError = 'Unable to load currency selections.';
        }
      },
      error: () => this.currencyError = 'Unable to load currency selections.',
    });
  }

  isChecked(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  toggleSelection(id: number): void {
    if (!this.selectionLoaded || this.loading || this.saving) return;

    const previousIds = this.selectedIds;
    this.selectedIds = this.isChecked(id)
      ? previousIds.filter(selectedId => selectedId !== id)
      : [...previousIds, id];
    this.currencyError = '';
    this.saving = true;

    this.currencyService.addUpdateCurrencyBySuperadmin(this.selectedIds.join(','), this.selectedSuperadminId).pipe(
      finalize(() => this.saving = false),
    ).subscribe({
      next: response => {
        if (Number(response?.responseCode) !== 200 || Number(response?.payload?.respCode) !== 200) {
          this.restoreSelection(previousIds);
        }
      },
      error: () => this.restoreSelection(previousIds),
    });
  }

  private restoreSelection(previousIds: number[]): void {
    this.selectedIds = previousIds;
    this.currencyError = 'Unable to save currency selections.';
  }
}
