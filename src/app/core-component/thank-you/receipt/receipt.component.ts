import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { EMPTY, Subject, catchError, distinctUntilChanged, filter, map, switchMap, take, takeUntil, tap, timeout, timer } from 'rxjs';
import { ThankYouService } from '../thank-you.service';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.scss'
})
export class ReceiptComponent implements OnInit, OnDestroy {
  receiptNo = '';
  successMessageVisible = 'Preparing your receipt...';
  countShow = false;
  countdownValue = 5;
  private readonly destroyed = new Subject<void>();

  constructor(private thankYouService: ThankYouService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      map(params => (params.get('receiptNo') || '').trim()),
      distinctUntilChanged(),
      switchMap(receiptNo => {
        this.receiptNo = receiptNo;
        this.countShow = false;
        if (!receiptNo) {
          this.successMessageVisible = 'No receipt number provided. Please check your receipt link.';
          return EMPTY;
        }
        this.countdownValue = 5;
        this.countShow = true;
        this.successMessageVisible = 'Your download will start in ';
        return timer(0, 1000).pipe(
          take(6),
          tap(elapsed => this.countdownValue = 5 - elapsed),
          filter(elapsed => elapsed === 5),
          switchMap(() => {
            this.countShow = false;
            this.successMessageVisible = 'Downloading your receipt...';
            return this.thankYouService.downloadPdf(receiptNo).pipe(timeout(30000));
          }),
          catchError((error: HttpErrorResponse) => {
            this.countShow = false;
            this.successMessageVisible = error.status === 404
              ? 'Receipt not found. Please check your receipt number.'
              : 'Unable to download your receipt. Please try again or contact the organisation.';
            return EMPTY;
          })
        );
      }),
      takeUntil(this.destroyed)
    ).subscribe(response => {
      if (!response.body || response.body.size === 0 || !response.body.type.toLowerCase().startsWith('application/pdf')) {
        this.successMessageVisible = 'No PDF receipt was returned. Please check your receipt number or contact the organisation.';
        return;
      }
      this.saveFile(response.body, this.getFileNameFromHttpResponse(response));
      this.successMessageVisible = 'Thank you for your kind donation. Your receipt has been downloaded.';
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private saveFile(blob: Blob, fileName: string): void {
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  private getFileNameFromHttpResponse(response: HttpResponse<Blob>): string {
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = /filename="?([^";]+)"?/i.exec(disposition);
    return match?.[1] || 'receipt.pdf';
  }
}
