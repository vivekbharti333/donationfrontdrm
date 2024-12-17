import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThankYouComponent } from './thank-you.component';
import { LetterComponent } from './letter/letter.component';

const routes: Routes = [
  {
    path: '',
    component: ThankYouComponent,
    children: [
      { path: 'letter/:receiptNo', component: LetterComponent },

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThankYouRoutingModule { }
