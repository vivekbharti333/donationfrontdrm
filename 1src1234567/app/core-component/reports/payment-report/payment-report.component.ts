import { Component } from '@angular/core';
import { UserManagementService } from '../../user-management/user-management.service';
import { PaymentReportService } from './payment-report.service';

@Component({
  selector: 'app-payment-report',
  templateUrl: './payment-report.component.html',
  styleUrls: ['./payment-report.component.scss'] // ✅ Fixed this line
})
export class PaymentReportComponent {

  public userList: any
  public PaymentModeCountAmount: any = {};
  public objectKeys = Object.keys;

  constructor(
    private userManagementService: UserManagementService,
    private paymentReportService: PaymentReportService,
  ) {

  }

  ngOnInit() {
    this.getUserList();
    // this.getPaymentReport('');
  }

  public getUserList() {
    this.userManagementService.getUserListToGetDataForCall()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.userList = JSON.parse(JSON.stringify(response['listPayload']));
          } else {
          }
        },
      });
  }

  getPaymentReport(loginId: any ,firstDate: any,lastDate: any) {
    this.PaymentModeCountAmount = {}; // Initialize as an empty object
    this.paymentReportService.getDonationPaymentModeCountAndAmountGroupByPaymentMode(loginId,firstDate,lastDate)
        .subscribe({
            next: (response: any) => {
                const listPayload = response['listPayload'];

                // Grouping data by the first element (payment mode)
                const groupedData = listPayload.reduce((acc: any, row: any[]) => {
                    const key = row[0]; // Extract the payment mode (first element)

                    if (!acc[key]) {
                        acc[key] = []; // Initialize array for this payment mode if it doesn't exist
                    }

                    // Push the remaining data (starting from index 1) to the respective group
                    acc[key].push(row.slice(1));

                    return acc;
                }, {});

                // Now assign the grouped data to PaymentModeCountAmount
                this.PaymentModeCountAmount = groupedData;

                console.log("PaymentModeCountAmount : ", this.PaymentModeCountAmount);
            },
            error: (error: any) => {
                console.error('Server Error', error);
            }
        });
}


}
