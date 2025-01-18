import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThankYouComponent } from './thank-you.component';
import { LetterComponent } from './letter/letter.component';

const routes: Routes = [
  {
    path: '',
    component: ThankYouComponent,
    children: [
      { path: 'letter/:receiptNo', component: LetterComponent },   // http://localhost:4200/#/thank-you/letter/1234w5tY752      https://mydonation.in/#/thank-you/letter/1234w5tY752

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThankYouRoutingModule { }
