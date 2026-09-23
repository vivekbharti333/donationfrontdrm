import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'primeng/api';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ItemDetailsService, ProductDetails } from './item-details.service';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrl: './item-details.component.scss'
})
export class ItemDetailsComponent implements OnInit, OnDestroy {
  products: ProductDetails[] = [];
  filteredProducts: ProductDetails[] = [];
  searchTerm = '';
  isLoading = false;
  loadError = '';
  productForm!: FormGroup;
  isSaving = false;
  formError = '';
  editingProduct: ProductDetails | null = null;
  unitOptions = [
    { value: 'UNIT', label: 'Unit' },
    { value: 'PIECE', label: 'Piece' },
    { value: 'PCS', label: 'Pieces (PCS)' },
    { value: 'HOUR', label: 'Hour' },
    { value: 'DAY', label: 'Day' },
    { value: 'KG', label: 'Kilogram' },
    { value: 'LITRE', label: 'Litre' }
  ];
  private dialogRef?: MatDialogRef<unknown>;
  private readonly destroyed = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private messageService: MessageService,
    private itemDetailsService: ItemDetailsService
  ) {}

  ngOnInit(): void {
    this.getProductDetails();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
    this.dialogRef?.close();
  }

  openAddProduct(template: TemplateRef<unknown>, product: ProductDetails | null = null): void {
    this.editingProduct = product;
    this.formError = '';
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
      description: [''],
      rate: [null, [Validators.required, Validators.min(0)]],
      quantityType: ['UNIT', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]]
    });
    if (product) {
      const existingUnit = String(product.quantityType || 'UNIT').trim();
      const matchingUnit = this.unitOptions.find(option => option.value.toLowerCase() === existingUnit.toLowerCase());
      if (!matchingUnit && existingUnit) {
        this.unitOptions = [...this.unitOptions, { value: existingUnit, label: existingUnit }];
      }
      this.productForm.patchValue({
        productName: product.productName || '',
        description: product.description || '',
        rate: product.rate,
        quantityType: matchingUnit?.value || existingUnit,
        quantity: product.quantity
      });
    }
    this.dialogRef = this.dialog.open(template, {
      width: '680px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      disableClose: true,
      ariaLabelledBy: 'add-product-title'
    });
  }

  closeAddProduct(): void {
    if (!this.isSaving) this.dialogRef?.close();
  }

  saveProduct(): void {
    // The backend does not expose an update endpoint yet. Do not create a duplicate from edit mode.
    if (this.isSaving || this.editingProduct) return;

    const raw = this.productForm.getRawValue();
    const product = {
      productName: String(raw.productName || '').trim(),
      description: String(raw.description || '').trim(),
      rate: Number(raw.rate),
      quantityType: String(raw.quantityType || '').trim(),
      quantity: Number(raw.quantity)
    };
    this.productForm.patchValue(product);
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) return;

    this.formError = '';
    this.isSaving = true;
    this.itemDetailsService.addProduct(product)
      .pipe(takeUntil(this.destroyed), finalize(() => this.isSaving = false))
      .subscribe({
        next: response => {
          if (Number(response.responseCode) === 200 && Number(response.payload?.respCode) === 200) {
            this.dialogRef?.close();
            this.messageService.add({
              severity: 'success',
              summary: 'Item added',
              detail: response.payload?.respMesg || 'The item was added successfully.'
            });
            this.searchTerm = '';
            this.getProductDetails();
            return;
          }

          this.formError = response.payload?.respMesg || response.responseMessage || 'Unable to add the item.';
        },
        error: error => {
          this.formError = error?.error?.responseMessage || 'Unable to add the item. Please try again.';
        }
      });
  }

  invalid(field: string): boolean {
    const control = this.productForm.get(field);
    return !!control && control.touched && control.invalid;
  }

  getProductDetails(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.loadError = '';
    this.itemDetailsService.getProductDetails()
      .pipe(takeUntil(this.destroyed), finalize(() => this.isLoading = false))
      .subscribe({
        next: response => {
          if (![200, 204].includes(Number(response.responseCode))) {
            this.products = [];
            this.filteredProducts = [];
            this.loadError = response.responseMessage || 'Unable to load products.';
            return;
          }

          this.products = Array.isArray(response.listPayload) ? response.listPayload : [];
          this.filterProducts(this.searchTerm);
        },
        error: error => {
          this.products = [];
          this.filteredProducts = [];
          this.loadError = error?.error?.responseMessage || 'Unable to load products. Please check your connection and try again.';
        }
      });
  }

  filterProducts(value: string): void {
    this.searchTerm = value;
    const query = value.trim().toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      [product.productName, product.description, product.quantityType, product.rate, product.quantity]
        .some(field => String(field ?? '').toLowerCase().includes(query))
    );
  }

}
