import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserManagementService } from '../../user-management/user-management.service';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { UsageLimitConsumption, UsesLimitService } from './uses-limit.service';
interface SuperadminOption { loginId: string; firstName?: string; lastName?: string; }
interface ServiceLimit { id?: number; resourceType?: string; service: string; unit: string; icon: string; color: string; limit: number | null; consumed: number | null; start: string; end: string; cycle: string; active: boolean | null; }
@Component({ selector: 'app-uses-limit', templateUrl: './uses-limit.component.html', styleUrl: './uses-limit.component.scss', providers: [MessageService] })
export class UsesLimitComponent implements OnInit {
  superadminList: SuperadminOption[] = [];
  superadminId = '';
  loadingNgos = false;
  ngoError = '';
  loadingLimits = false;
  savingLimit = false;
  limitsError = '';
  private limitsSubscription?: Subscription;

  constructor(private userManagementService: UserManagementService, private destroyRef: DestroyRef, private usesLimitService: UsesLimitService, private messageService: MessageService) {}

  ngOnInit(): void { this.getSuperadminList(); }

  get ngo(): string {
    const selected = this.superadminList.find(user => user.loginId === this.superadminId);
    return selected ? this.getSuperadminName(selected) : 'Select NGO';
  }

  getSuperadminName(user: SuperadminOption): string {
    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.loginId;
  }

  getSuperadminList(): void {
    this.loadingNgos = true;
    this.ngoError = '';
    this.userManagementService.getUserDetailsList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.loadingNgos = false;
          if (String(response?.responseCode) === '200' && Array.isArray(response.listPayload)) {
            this.superadminList = response.listPayload.map((user: SuperadminOption) => ({ ...user, loginId: String(user.loginId) }));
            this.superadminId = this.superadminList[0]?.loginId || '';
            this.loadUsageLimits();
          } else {
            this.ngoError = 'Unable to load the NGO list.';
          }
        },
        error: error => {
          this.loadingNgos = false;
          this.ngoError = 'Unable to load the NGO list. Please try again.';
        }
      });
  }
  loadUsageLimits(): void {
    this.limitsSubscription?.unsubscribe();
    this.limits = this.createEmptyLimits();
    this.limitsError = '';
    this.message = '';
    this.showDetails = false;
    this.loadingLimits = false;
    if (!this.superadminId) { return; }
    this.loadingLimits = true;
    this.limitsSubscription = this.usesLimitService.getUsageLimitConsumptionListBySuperadmin(this.superadminId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.loadingLimits = false;
          if (!response) {
            return;
          }
          if (String(response.responseCode) === '200') {
            if (Array.isArray(response.listPayload)) {
              response.listPayload.filter(Boolean).forEach(record => {
                const values = this.mapUsageLimit(record);
                const row = this.limits.find(item => item.service === values.service);
                if (row) { Object.assign(row, values); }
              });
            }
          } else if (!['204', '404'].includes(String(response?.responseCode))) {
            this.limitsError = 'Unable to load service limits.';
          }
        },
        error: error => {
          this.loadingLimits = false;
          if (error.status !== 404) { this.limitsError = 'Unable to load service limits. Please try again.'; }
        }
      });
  }

  private mapUsageLimit(row: UsageLimitConsumption): ServiceLimit {
    const resource = String(row.resourceType || '').toUpperCase().replace(/[\s-]+/g, '_');
    const names: Record<string, string> = { CREATE_USER: 'User Creation', USER_CREATION: 'User Creation', DONATION_RECEIPT: 'Donation Receipt', WHATSAPP_MESSAGE: 'WhatsApp Message', SMS_MESSAGE: 'SMS Message', EMAIL_MESSAGE: 'Email Message', CONTACT_STORAGE: 'Contact Storage' };
    const service = this.services.find(item => item.service === (names[resource] || row.resourceType));
    return {
      id: row.id, resourceType: row.resourceType,
      service: service?.service || row.resourceType || 'Unknown service',
      unit: service?.unit || '', icon: service?.icon || 'fas fa-layer-group', color: service?.color || 'orange',
      limit: Number(row.limit) || 0, consumed: Number(row.consume) || 0,
      start: this.toInputDate(row.startDate), end: this.toInputDate(row.endDate),
      cycle: row.consumptionType || '', active: String(row.status || '').toUpperCase() === 'ACTIVE'
    };
  }

  private toInputDate(value: string | number | null): string {
    if (value === null || value === '') { return ''; }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) { return ''; }
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) { return value.slice(0, 10); }
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }
  showDetails = false;
  message = '';
  services = [
    { service: 'User Creation', unit: 'Users', icon: 'fas fa-user-plus', color: 'orange' },
    { service: 'Donation Receipt', unit: 'Receipts', icon: 'fas fa-file-invoice', color: 'orange' },
    { service: 'WhatsApp Message', unit: 'Messages', icon: 'fab fa-whatsapp', color: 'green' },
    { service: 'SMS Message', unit: 'Messages', icon: 'fas fa-comment-dots', color: 'blue' },
    { service: 'Email Message', unit: 'Emails', icon: 'fas fa-envelope', color: 'purple' },
    { service: 'Contact Storage', unit: 'Contacts', icon: 'fas fa-address-book', color: 'pink' }
  ];
  limits: ServiceLimit[] = this.createEmptyLimits();

  private createEmptyLimits(): ServiceLimit[] {
    return this.services.map(service => ({ ...service, limit: null, consumed: null, start: '', end: '', cycle: '', active: null }));
  }

  getRemaining(row: ServiceLimit): number | null {
    return row.limit !== null && row.consumed !== null ? row.limit - row.consumed : null;
  }
  selectedService = 'Donation Receipt';
  limit: number | null = 5000;
  start = '2026-10-01';
  end = '2027-09-30';
  cycle = 'Yearly';
  get selectedUnit(): string { return this.services.find(item => item.service === this.selectedService)?.unit || ''; }
  get selectedIcon(): string { return this.services.find(item => item.service === this.selectedService)?.icon || ''; }
  editLimit(row: ServiceLimit): void { this.selectedService = row.service; this.limit = row.limit; this.start = row.start; this.end = row.end; this.cycle = row.cycle; this.message = ''; }
  resetForm(): void { this.selectedService = 'Donation Receipt'; this.limit = 5000; this.start = '2026-10-01'; this.end = '2027-09-30'; this.cycle = 'Yearly'; this.message = ''; }
  addLimit(): void { this.resetForm(); this.limit = null; }
  saveLimit(): void {
    if (this.savingLimit || this.loadingLimits) { return; }
    if (!this.superadminId) { this.message = 'Please select an NGO.'; return; }
    const row = this.limits.find(item => item.service === this.selectedService);
    if (this.limit === null || !Number.isInteger(this.limit) || this.limit < (row?.consumed || 0) || !this.start || !this.end || this.end < this.start) { this.message = 'Enter a valid period and a whole number limit at least equal to consumed usage.'; return; }
    const resourceTypes: Record<string, string> = {
      'User Creation': 'CREATE_USER', 'Donation Receipt': 'DONATION_RECEIPT',
      'WhatsApp Message': 'WHATSAPP_MESSAGE', 'SMS Message': 'SMS_MESSAGE',
      'Email Message': 'EMAIL_MESSAGE', 'Contact Storage': 'CONTACT_STORAGE'
    };
    const resourceType = row?.resourceType || resourceTypes[this.selectedService];
    if (!resourceType || !this.cycle) { this.message = 'Please select a service and billing cycle.'; return; }
    const superadminId = this.superadminId;
    this.savingLimit = true;
    this.message = '';
    this.usesLimitService.addUpdateUsageLimitConsumption({
      ...(row?.id != null ? { id: row.id } : {}),
      resourceType, consumptionType: this.cycle, limit: this.limit,
      consume: row?.consumed ?? 0, status: row?.active === false ? 'INACTIVE' : 'ACTIVE',
      startDate: this.start, endDate: this.end, superadminId
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.savingLimit = false;
        if (this.superadminId !== superadminId) { return; }
        if (String(response?.responseCode) === '200' &&
            (response.payload?.respCode == null || String(response.payload.respCode) === '200')) {
          this.loadUsageLimits();
          this.messageService.add({ severity: 'success', summary: String(response.payload?.respCode ?? response.responseCode), detail: response.payload?.respMesg || response.responseMessage || 'Service limit saved successfully.' });
        } else {
          this.messageService.add({ severity: 'error', summary: String(String(response?.responseCode) === '200' ? (response.payload?.respCode ?? response.responseCode) : (response?.responseCode ?? '500')), detail: (String(response?.responseCode) === '200' ? response.payload?.respMesg : '') || response?.responseMessage || 'Unable to save the service limit.', styleClass: 'danger-light-popover' });
        }
      },
      error: error => {
        this.savingLimit = false;
        if (this.superadminId === superadminId) { this.messageService.add({ severity: 'error', summary: String(error.error?.payload?.respCode ?? error.error?.responseCode ?? (error.status || '500')), detail: error.error?.payload?.respMesg || error.error?.responseMessage || 'Unable to save the service limit. Please try again.', styleClass: 'danger-light-popover' }); }
      }
    });
  }
}

