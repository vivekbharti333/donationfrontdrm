import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesManagementComponent } from './categories-management.component';
import { CategoriesTypeComponent } from './categories-type/categories-type.component';
import { SuperCategoriesComponent } from './super-categories/super-categories.component';
import { CategoriesComponent } from './categories/categories.component';
import { SubCategoriesComponent } from './sub-categories/sub-categories.component';
import { AuthGuard } from 'src/app/core/core.index';

const routes: Routes = [
  {
    path: '',
    component: CategoriesManagementComponent,
    children: [
      {
        path: 'category-type',
        component: CategoriesTypeComponent,
      },
      {
        path: 'super-category',
        component: SuperCategoriesComponent,
      },
      {
        path: 'category',
        component: CategoriesComponent,
      },
      {
        path: 'sub-category',
        component: SubCategoriesComponent,
      },
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoriesManagementRoutingModule { }
