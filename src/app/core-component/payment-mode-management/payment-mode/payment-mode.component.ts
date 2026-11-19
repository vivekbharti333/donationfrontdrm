import { Component } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Constant } from 'src/app/core/constant/constants';
import { UserManagementService } from '../../user-management/user-management.service';
import { PaymentModeManagementService } from '../payment-mode-management.service';

interface PaymentMode {
  id: number;
  paymentMode: string;
  status: string;
  createdAt: number;
}

@Component({
  selector: 'app-payment-mode',
  templateUrl: './payment-mode.component.html',
  styleUrl: './payment-mode.component.scss'
})
export class PaymentModeComponent {

  readonly isMainAdmin: boolean;
  superadminList: { loginId: string; firstName: string; lastName: string }[] = [];
  selectedSuperadminId?: string;
  masterPaymentModeList: PaymentMode[] = [];
  selectedIds: number[] = [];
  isLoading = true;
  loadingSelection = false;
  selectionLoaded = false;
  savingId: number | null = null;
  superadminError = '';
  selectionError = '';

  constructor(
    authenticationService: AuthenticationService,
    private userManagementService: UserManagementService,
    private paymentModeManagementService: PaymentModeManagementService,
  ) {
    this.isMainAdmin = authenticationService.getLoginUser()?.roleType === Constant.mainAdmin;
  }

  ngOnInit(): void {
    this.getMasterPaymentModeList();
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
      this.getPaymentModeListBySuperadminId();
    }
  }

  isChecked(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  getPaymentModeIcon(paymentMode: string): string {
    const mode = (paymentMode || '').toLowerCase();

    if (mode.includes('cash')) return 'icon-inbox';
    if (mode.includes('card') || mode.includes('credit') || mode.includes('debit')) return 'icon-credit-card';
    if (mode.includes('upi') || mode.includes('phone') || mode.includes('mobile')) return 'icon-smartphone';
    if (mode.includes('bank') || mode.includes('transfer') || mode.includes('neft') || mode.includes('rtgs')) return 'icon-home';
    if (mode.includes('cheque') || mode.includes('check')) return 'icon-file-text';
    if (mode.includes('wallet')) return 'icon-briefcase';
    if (mode.includes('online') || mode.includes('gateway')) return 'icon-globe';
    if (mode.includes('qr')) return 'icon-grid';

    return 'icon-credit-card';
  }

  toggleSelection(id: number): void {
    if (!this.selectionLoaded || this.savingId !== null) return;
    const previousIds = this.selectedIds;
    this.selectedIds = this.isChecked(id)
      ? previousIds.filter(selectedId => selectedId !== id)
      : [...previousIds, id];
    this.savingId = id;
    this.selectionError = '';

    this.paymentModeManagementService.addUpdatePaymentModeBySuperadmin(
      this.selectedIds.join(','), this.selectedSuperadminId,
    ).pipe(finalize(() => this.savingId = null)).subscribe({
      next: response => {
        if (Number(response?.responseCode) !== 200 || Number(response?.payload?.respCode) !== 200) {
          this.restoreSelection(previousIds);
        }
      },
      error: () => this.restoreSelection(previousIds),
    });
  }

  private getMasterPaymentModeList(): void {
    this.paymentModeManagementService.getMasterPaymentModeList().pipe(
      finalize(() => this.isLoading = false),
    ).subscribe({
      next: response => {
        if (Number(response?.responseCode) === 200 && Array.isArray(response?.listPayload)) {
          this.masterPaymentModeList = response.listPayload;
        }
      },
      error: () => this.selectionError = 'Unable to load available payment modes.',
    });
  }

  getPaymentModeListBySuperadminId(superadminId?: string): void {
    if (this.loadingSelection || this.savingId !== null || (this.isMainAdmin && !superadminId)) return;
    this.selectedSuperadminId = superadminId;
    this.selectedIds = [];
    this.selectionLoaded = false;
    this.selectionError = '';
    this.loadingSelection = true;

    this.paymentModeManagementService.getPaymentModeListBySuperadminId(superadminId).pipe(
      finalize(() => this.loadingSelection = false),
    ).subscribe({
      next: response => {
        const code = Number(response?.responseCode);
        if (code === 200 && Array.isArray(response?.listPayload)) {
          this.selectedIds = response.listPayload.map((mode: PaymentMode) => mode.id);
          this.selectionLoaded = true;
        } else if (code === 204) {
          this.selectionLoaded = true;
        } else {
          this.selectionError = 'Unable to load payment mode selections.';
        }
      },
      error: () => this.selectionError = 'Unable to load payment mode selections.',
    });
  }

  private restoreSelection(previousIds: number[]): void {
    this.selectedIds = previousIds;
    this.selectionError = 'Unable to save payment mode selections.';
  }
}
