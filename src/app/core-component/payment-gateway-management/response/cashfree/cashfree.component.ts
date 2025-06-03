import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentGatewayManagementService } from '../../payment-gateway-management.service';

@Component({
  selector: 'app-cashfree',
  templateUrl: './cashfree.component.html',
  styleUrls: ['./cashfree.component.scss']  // ✅ fixed "styleUrl" typo
})
export class CashfreeComponent implements OnInit {

  linkId: string | null = null;
  linkStatus: string | null = null;
  amountPaid: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private paymentGatewayManagementService: PaymentGatewayManagementService,
  ) {

  }

  ngOnInit(): void {
    // Read query parameters from the URL
    this.linkId = this.route.snapshot.queryParamMap.get('link_id');
    this.linkStatus = this.route.snapshot.queryParamMap.get('link_status');
    this.amountPaid = this.route.snapshot.queryParamMap.get('link_amount_paid');

    this.sendPaymentResponse();
  }

  message: any;
  sendPaymentResponse() {
    this.message = "Please wait your payment in process. Do not refres page";
    this.paymentGatewayManagementService.sendcashfreePaymentResponse(this.linkId, this.linkStatus, this.amountPaid)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {

              this.message = "PAYMENT IS SUCCESSFULLY DONE";

            } else {
              this.message = "Somthing went wrong"; 

            }
          } else {


          }
        },

      });
  }
}
