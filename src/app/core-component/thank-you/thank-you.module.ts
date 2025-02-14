import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThankYouRoutingModule } from './thank-you-routing.module';
import { ThankYouComponent } from './thank-you.component';
import { LetterComponent } from './letter/letter.component';
import { ReceiptComponent } from './receipt/receipt.component';
import { sharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ThankYouComponent,
    LetterComponent,
    ReceiptComponent
  ],
  imports: [
    CommonModule,
    ThankYouRoutingModule,
    sharedModule
  ]
})
export class ThankYouModule { }
