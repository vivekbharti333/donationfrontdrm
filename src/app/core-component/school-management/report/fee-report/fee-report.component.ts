import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Constant } from 'src/app/core/constant/constants';
import { SchoolManagementService } from '../../school-management.service';

export interface MonthlyFeeReportRow { month: string; feeTypeId?: number; feeType?: string; totalFee: number; dueFee: number; receivedFee: number; }

@Component({
  selector: 'app-fee-report',
  templateUrl: './fee-report.component.html',
  styleUrl: './fee-report.component.scss'
})
export class FeeReportComponent implements OnInit, OnDestroy {
  readonly academicYears = Constant.ACADEMIC_YEAR_OPTIONS;
  sessionName = this.currentSession();
  reportType: 'monthly' | 'feeType' = 'monthly';
  readonly monthColours: Record<string, string> = {
    April: '#edf4ff', May: '#edf8ef', June: '#fff4e6',
    July: '#f3edff', August: '#e8f8f8', September: '#fff0f4',
    October: '#f7f7df', November: '#edf0fa', December: '#fceee5',
    January: '#e8f5f0', February: '#f8edfa', March: '#fff8df'
  };
  rows: MonthlyFeeReportRow[] = [];
  isLoading = false;
  errorMessage = '';
  private readonly destroyed = new Subject<void>();
  private readonly reload = new Subject<void>();

  constructor(private schoolService: SchoolManagementService) {}
  ngOnInit(): void { this.loadReport(); }
  loadReport(): void {
    this.reload.next();
    this.rows = []; this.errorMessage = ''; this.isLoading = true;
    this.schoolService.getMonthlyFeeReport(this.sessionName, this.reportType === 'feeType').pipe(takeUntil(this.reload), takeUntil(this.destroyed)).subscribe({
      next: response => {
        this.isLoading = false;
        if (Number(response?.responseCode) === Constant.NO_CONTENT_CODE) return;
        if (Number(response?.responseCode) !== Constant.SUCCESS_CODE || !Array.isArray(response?.listPayload)) {
          this.errorMessage = response?.responseMessage || 'Unable to load the monthly fee report.';
          return;
        }
        this.rows = response.listPayload;
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = error?.error?.responseMessage || 'Unable to load the monthly fee report. Check that the updated backend is deployed and try again.';
      }
    });
  }
  monthRowSpan(index: number): number {
    if (this.reportType === 'monthly') return 1;
    const month = this.rows[index].month;
    if (index > 0 && this.rows[index - 1].month === month) return 0;
    let end = index + 1;
    while (end < this.rows.length && this.rows[end].month === month) end++;
    return end - index;
  }
  monthColour(month: string): string | null {
    return this.reportType === 'feeType' ? this.monthColours[month.split(' ')[0]] || '#f5f7fa' : null;
  }
  total(field: 'totalFee' | 'dueFee' | 'receivedFee'): number {
    return this.rows.reduce((sum, row) => sum + Math.round(Number(row[field] || 0) * 100), 0) / 100;
  }
  private currentSession(): string {
    const today = new Date(); const year = today.getFullYear() - (today.getMonth() < 3 ? 1 : 0);
    const session = year + '-' + String((year + 1) % 100).padStart(2, '0');
    return this.academicYears.some(option => option.value === session) ? session : this.academicYears[0].value;
  }
  ngOnDestroy(): void { this.destroyed.next(); this.destroyed.complete(); this.reload.complete(); }
}
