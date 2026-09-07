import { Component, HostListener, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import Swal from 'sweetalert2';
import { SidebarService } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { WhatsAppTemplatesService } from './whats-app-templates.service';

@Component({
  selector: 'app-whats-app-templates',
  templateUrl: './whats-app-templates.component.html',
  styleUrls: ['./whats-app-templates.component.scss']
})
export class WhatsAppTemplatesComponent {
  public routes = routes;
  public editTemplateDialog: any;
  public editTemplateForm!: FormGroup;
  public fullData: any[] = [];
  public filteredData: any[] = [];
  public tableData: any[] = [];
  public searchDataValue = '';
  public pageSize = 10;
  public currentPage = 1;
  public totalData = 0;
  public isCollapsed = false;
  public isLoading = false;
  public isSaving = false;
  public loadError = '';
  public formError = '';
  public headerFile: File | null = null;
  public headerPreview = '';
  public headerMediaError = '';
  public headerPreviewFailed = false;
  public showAllPreviewButtons = false;
  private existingHeaderPreview = '';
  private existingHeaderFormat = '';

  get headerMediaAccept(): string {
    const format = this.editTemplateForm.get('headerFormat')?.value;
    return format === 'IMAGE' ? 'image/jpeg,image/png' : format === 'VIDEO' ? 'video/mp4' : 'application/pdf';
  }

  onHeaderFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const maxMb = this.editTemplateForm.get('headerFormat')?.value === 'IMAGE' ? 5 : 16;
    if (!this.headerMediaAccept.split(',').includes(file.type) || file.size > maxMb * 1024 * 1024) {
      this.headerMediaError = `Select ${this.headerMediaAccept} up to ${maxMb} MB.`;
      input.value = '';
      return;
    }
    this.headerFile = file;
    input.value = '';
    this.headerMediaError = '';
    this.headerPreviewFailed = false;
    const reader = new FileReader();
    reader.onload = () => {
      if (this.headerFile === file) this.headerPreview = String(reader.result);
    };
    reader.readAsDataURL(file);
  }
  public showVarDropdown = false;
  public showMediaDropdown = false;
  private activeSort: Sort = { active: '', direction: '' };
  private editRequestId = 0;

  constructor(
    private fb: FormBuilder,
    private sidebar: SidebarService,
    private dialog: MatDialog,
    private whatsAppTemplatesService: WhatsAppTemplatesService
  ) {}

  ngOnInit(): void {
    this.getWhatsAppTemplate();
  }

  get buttonsArray(): FormArray {
    return this.editTemplateForm.get('buttons') as FormArray;
  }

  readonly buttonOptions = [
    { value: 'QUICK_REPLY', label: 'Quick reply' },
    { value: 'URL', label: 'Visit website' },
    { value: 'WHATSAPP_CALL', label: 'Call on WhatsApp' },
    { value: 'PHONE_NUMBER', label: 'Call Phone Number' },
    { value: 'FLOW', label: 'Complete flow' },
    { value: 'COPY_CODE', label: 'Copy offer code' }
  ];

  private createButton(type: string): FormGroup {
    const label = this.buttonOptions.find(option => option.value === type)?.label || '';
    return this.fb.group({
      type: [type],
      text: [type === 'FLOW' ? 'View flow' : label, [Validators.required, Validators.pattern(/\S/), Validators.maxLength(25)]],
      urlType: ['STATIC'], url: [''], urlSample: [''], trackConversions: [false],
      activeFor: ['7'], country: ['+1'], phone_number: [''],
      icon: ['DEFAULT'], flowMode: ['EXISTING'], flowName: [''], flowId: [''], navigateScreen: [''], flowAction: ['navigate'], offerCode: ['']
    });
  }

  addButton(type: string): void {
    if (!this.buttonOptions.some(option => option.value === type) || this.buttonsArray.length >= 10) return;
    this.buttonsArray.push(this.createButton(type));
    this.buttonsArray.markAsDirty();
  }

  changeButtonType(index: number, type: string): void {
    this.buttonsArray.setControl(index, this.createButton(type));
    this.buttonsArray.markAsDirty();
  }

  moveButton(index: number, offset: number): void {
    const destination = index + offset;
    if (destination < 0 || destination >= this.buttonsArray.length) return;
    const button = this.buttonsArray.at(index);
    this.buttonsArray.removeAt(index);
    this.buttonsArray.insert(destination, button);
    this.buttonsArray.markAsDirty();
  }

  removeButton(index: number): void {
    this.buttonsArray.removeAt(index);
    this.buttonsArray.markAsDirty();
  }

  private loadButtons(data: any): void {
    const componentButtons = Array.isArray(data.components)
      ? data.components.filter((component: any) => component.type?.toUpperCase() === 'BUTTONS')
          .flatMap((component: any) => Array.isArray(component.buttons) ? component.buttons : []) : [];
    const source = [data.buttonVariable, data.buttons, componentButtons]
      .find(buttons => Array.isArray(buttons) && buttons.length > 0) || [];
    this.buttonsArray.clear();
    source.forEach((button: any) => {
      const type = String(button.type || '').toUpperCase();
      const group = this.createButton(type === 'VOICE_CALL' ? 'WHATSAPP_CALL' : type);
      const url = button.url ?? (type === 'URL' ? button.value : '') ?? '';
      const phone = String(button.phone_number ?? (type === 'PHONE_NUMBER' ? button.value : '') ?? '');
      const country = ['+971', '+91', '+44', '+61', '+1'].find(prefix => phone.startsWith(prefix)) || '';
      group.patchValue({
        text: button.text || (type === 'COPY_CODE' ? 'Copy offer code' : group.value.text),
        url, urlType: button.urlType || (url.includes('{{1}}') ? 'DYNAMIC' : 'STATIC'),
        urlSample: button.urlSample || (type === 'URL' ? button.example?.[0] : '') || '',
        country: country || '+1',
        phone_number: country ? phone.slice(country.length) : phone,
        activeFor: String(button.activeFor || (button.ttl_minutes ? button.ttl_minutes / 1440 : 7)),
        flowId: button.flowId || button.flow_id || '',
        flowAction: button.flowAction || button.flow_action || 'navigate',
        navigateScreen: button.navigateScreen || button.navigate_screen || '',
        offerCode: button.offerCode || (type === 'COPY_CODE' ? (Array.isArray(button.example) ? button.example[0] : button.example) : '') || ''
      });
      this.buttonsArray.push(group);
    });
  }

  get variablesArray(): FormArray {
    return this.editTemplateForm.get('msgBodyVariable') as FormArray;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalData / this.pageSize));
  }

  get pageStart(): number {
    return this.totalData ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalData);
  }

  createForms(): void {
    this.editTemplateForm = this.fb.group({
      requestFor: ['UPDATE'],
      templateId: [null],
      templateName: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
      parameterFormat: ['POSITIONAL'],
      headerFormat: ['TEXT'],
      headerText: ['', Validators.maxLength(60)],
      msgBodyText: ['', [Validators.required, Validators.maxLength(1024)]],
      msgBodyVariable: this.fb.array([]),
      footerText: ['', Validators.maxLength(60)],
      buttons: this.fb.array([]),
      language: ['en', Validators.required],
      status: [null],
      category: ['MARKETING', Validators.required],
      sub_category: [null],
      toWhatsAppNumber: [null],
      variableType: ['Number'],
      mediaType: ['None']
    });
  }

  createVariableGroup(key: string, value = '', type = 'contactName'): FormGroup {
    return this.fb.group({
      key: [key],
      value: [value, Validators.required],
      type: [type]
    });
  }

  getWhatsAppTemplate(): void {
    this.isLoading = true;
    this.loadError = '';
    this.whatsAppTemplatesService.getWhatsAppTemplate().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (Number(response?.responseCode) !== 200) {
          this.loadError = response?.responseMessage || 'Could not load templates.';
          return;
        }

        this.fullData = Array.isArray(response.listPayload) ? response.listPayload : [];
        this.currentPage = 1;
        this.applyFilters();
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Could not load templates. Please try again.';
      }
    });
  }

  searchData(value: string): void {
    this.searchDataValue = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  sortData(sort: Sort): void {
    this.activeSort = sort;
    this.currentPage = 1;
    this.applyFilters();
  }

  changePageSize(value: string | number): void {
    this.pageSize = Number(value);
    this.currentPage = 1;
    this.updatePage();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePage();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePage();
    }
  }

  private applyFilters(): void {
    const term = this.searchDataValue.trim().toLowerCase();
    let data = !term
      ? [...this.fullData]
      : this.fullData.filter(template =>
          ['templateId', 'templateName', 'language', 'category', 'status']
            .some(key => String(template?.[key] ?? '').toLowerCase().includes(term))
        );

    if (this.activeSort.active && this.activeSort.direction) {
      const direction = this.activeSort.direction === 'asc' ? 1 : -1;
      const key = this.activeSort.active;
      data = data.sort((a, b) =>
        String(a?.[key] ?? '').localeCompare(String(b?.[key] ?? ''), undefined, {
          numeric: true,
          sensitivity: 'base'
        }) * direction
      );
    }

    this.filteredData = data;
    this.totalData = data.length;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.updatePage();
  }

  private updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.tableData = this.filteredData.slice(start, start + this.pageSize);
  }

  toggleCollapse(): void {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

  addVariable(): void {
    const bodyControl = this.editTemplateForm.get('msgBodyText');
    const nextIndex = this.getNextVariableIndex();
    const variable = `{{${nextIndex}}}`;
    bodyControl?.setValue(`${bodyControl.value || ''}${bodyControl.value ? ' ' : ''}${variable}`);
    this.detectVariables();
  }

  onBodyChange(): void {
    this.detectVariables();
  }

  detectVariables(): void {
    const text = this.editTemplateForm.get('msgBodyText')?.value || '';
    const matches = [...new Set<string>(text.match(/{{\d+}}/g) || [])];
    const oldValues = this.variablesArray.value;

    this.variablesArray.clear();
    matches.forEach(key => {
      const existing = oldValues.find((item: any) => item.key === key);
      this.variablesArray.push(this.createVariableGroup(key, existing?.value || '', existing?.type || 'contactName'));
    });
  }

  getPreviewText(): string {
    let text = this.editTemplateForm?.get('msgBodyText')?.value || '';
    (this.variablesArray?.value || []).forEach((variable: any) => {
      text = text.replaceAll(variable.key, variable.value || variable.key);
    });
    return text;
  }

  toggleVarDropdown(event: Event): void {
    event.stopPropagation();
    this.showVarDropdown = !this.showVarDropdown;
    this.showMediaDropdown = false;
  }

  selectVariableType(type: string): void {
    this.editTemplateForm.get('variableType')?.setValue(type);
    this.showVarDropdown = false;
  }

  toggleMediaDropdown(event: Event): void {
    event.stopPropagation();
    this.showMediaDropdown = !this.showMediaDropdown;
    this.showVarDropdown = false;
  }

  selectMediaType(type: string): void {
    this.headerFile = null;
    this.headerMediaError = '';
    this.headerPreviewFailed = false;
    this.headerPreview = type.toUpperCase() === this.existingHeaderFormat ? this.existingHeaderPreview : '';
    this.editTemplateForm.get('mediaType')?.setValue(type);
    this.editTemplateForm.get('headerFormat')?.setValue(
      type === 'None' ? 'TEXT' : type.toUpperCase()
    );
    this.showMediaDropdown = false;
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.showVarDropdown = false;
    this.showMediaDropdown = false;
  }

  openEditModal(templateRef: TemplateRef<any>, data: any): void {
    const requestId = ++this.editRequestId;
    this.whatsAppTemplatesService.getTemplateForEdit(data.templateId).subscribe({
      next: (response: any) => {
        if (requestId !== this.editRequestId) return;
        const details = response?.listPayload?.find((template: any) =>
          String(template.templateId) === String(data.templateId)) || response?.payload;
        if (Number(response?.responseCode) !== 200 || !details ||
            String(details.templateId) !== String(data.templateId)) {
          Swal.fire('Could not load template', response?.responseMessage || 'Please refresh and try again.', 'error');
          return;
        }
        this.showEditModal(templateRef, { ...data, ...details });
      },
      error: () => {
        if (requestId !== this.editRequestId) return;
        Swal.fire('Could not load template', 'Could not load the message and its buttons. Please try again.', 'error');
      }
    });
  }

  private showEditModal(templateRef: TemplateRef<any>, data: any): void {
    this.showAllPreviewButtons = false;
    this.createForms();
    this.formError = '';

    const variables = this.normalizeVariables(data);
    this.headerFile = null;
    this.headerMediaError = '';
    this.headerPreviewFailed = false;
    this.existingHeaderFormat = String(data.headerFormat || '').toUpperCase();
    this.existingHeaderPreview = (data.headerExample || []).find((value: string) => /^https:\/\//i.test(value)) || '';
    this.headerPreview = this.existingHeaderPreview;
    const mediaType = this.mediaTypeFromHeader(data.headerFormat);
    this.editTemplateForm.patchValue({
      requestFor: 'UPDATE',
      templateId: data.templateId,
      templateName: data.templateName,
      parameterFormat: data.parameterFormat || 'POSITIONAL',
      headerFormat: data.headerFormat || 'TEXT',
      headerText: data.headerText || '',
      msgBodyText: data.msgBodyText || '',
      footerText: data.footerText || '',
      language: data.language || 'en',
      status: data.status,
      category: data.category || 'MARKETING',
      sub_category: data.sub_category,
      toWhatsAppNumber: data.toWhatsAppNumber,
      variableType: 'Number',
      mediaType
    });

    this.loadButtons(data);

    variables.forEach(variable =>
      this.variablesArray.push(this.createVariableGroup(variable.key, variable.value, variable.type || 'contactName'))
    );
    this.detectVariables();

    this.editTemplateDialog = this.dialog.open(templateRef, {
      width: '1100px',
      maxWidth: '96vw',
      maxHeight: '96vh',
      disableClose: true,
      panelClass: 'custom-modal'
    });
  }

  submitTemplate(): void {
    if (this.isSaving) return;
    this.formError = '';
    if (this.editTemplateForm.get('headerFormat')?.value !== 'TEXT' && !this.headerFile) {
      this.formError = 'Select a header media file to upload as the sample for this update.';
      return;
    }
    this.detectVariables();
    if (this.editTemplateForm.invalid) {
      this.editTemplateForm.markAllAsTouched();
      this.formError = 'Complete all required fields and variable samples.';
      return;
    }

    const { buttons, ...form } = this.editTemplateForm.getRawValue();
    const payload = {
      ...form,
      headerAvailable: !!form.headerText || form.headerFormat !== 'TEXT',
      headerExample: form.headerFormat === 'TEXT' ? [form.headerText || 'Sample'] : [],
      msgBodyVariable: form.msgBodyVariable.map((variable: any) => ({
        bodyVariable: String(variable.key).replace(/[{}]/g, ''),
        example: variable.value,
        variableType: variable.type
      })),
      bodyExample: [form.msgBodyVariable.map((variable: any) => variable.value)],
      footerAvailable: !!form.footerText,
        replyButtonAvailable: buttons.length > 0,
        buttonVariable: buttons.map((button: any) => ({
          type: button.type,
          text: button.text,
          value: button.type === 'URL' ? button.url : button.type === 'PHONE_NUMBER'
            ? (String(button.phone_number).trim().startsWith('+') ? String(button.phone_number).trim()
              : button.country + String(button.phone_number).replace(/[\s()-]/g, '')) : undefined,
          urlType: button.urlType,
          urlSample: button.urlSample,
          activeFor: Number(button.activeFor),
          flowId: button.flowId,
          flowAction: button.flowAction,
          navigateScreen: button.navigateScreen,
          offerCode: button.offerCode,
          trackConversions: button.trackConversions
        }))
    };

    this.isSaving = true;
    this.whatsAppTemplatesService.updateWhatsAppTemplate(payload, this.headerFile).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        if (Number(response?.responseCode) !== 200 || (response?.payload?.respCode != null && Number(response.payload.respCode) !== 200)) {
          this.formError = response?.payload?.respMesg || response?.responseMessage || 'Template could not be updated.';
          return;
        }

        this.editTemplateDialog?.close();
        Swal.fire('Updated', response?.responseMessage || 'Template updated successfully.', 'success');
        this.getWhatsAppTemplate();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.formError = error?.error?.responseMessage || error?.message || 'Template could not be updated.';
      }
    });
  }

  async deleteTemplateByName(templateName: string, templateId?: string | number): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete template?',
      text: `"${templateName}" will be permanently deleted.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Delete'
    });
    if (!result.isConfirmed) {
      return;
    }

    this.whatsAppTemplatesService.deleteWhatsAppTemplateByName(templateName, templateId).subscribe({
      next: (response: any) => {
        if (Number(response?.responseCode) === 200) {
          Swal.fire('Deleted', response?.responseMessage || 'Template deleted.', 'success');
          this.getWhatsAppTemplate();
        } else {
          Swal.fire('Delete failed', response?.responseMessage || 'Template could not be deleted.', 'error');
        }
      },
      error: (error: any) =>
        Swal.fire('Delete failed', error?.error?.responseMessage || 'Template could not be deleted.', 'error')
    });
  }

  statusClass(status: string): string {
    return `status-${String(status || 'unknown').toLowerCase()}`;
  }

  private getNextVariableIndex(): number {
    const keys = this.variablesArray.value.map((variable: any) =>
      Number(String(variable.key).replace(/\D/g, ''))
    );
    return Math.max(0, ...keys.filter(Number.isFinite)) + 1;
  }

  private normalizeVariables(data: any): Array<{ key: string; value: string; type: string }> {
    const source = Array.isArray(data?.msgBodyVariable) ? data.msgBodyVariable : [];
    const placeholders = [...new Set(String(data?.msgBodyText || '').match(/{{\d+}}/g) || [])];
    if (source.length) {
      return source.map((variable: any, index: number) => ({
        key: variable.key || placeholders[index] || `{{${index + 1}}}`,
        value: variable.value || variable.example || variable.bodyVariable || '',
        type: variable.type || variable.variableType || 'contactName'
      }));
    }

    return placeholders.map(key => ({ key, value: '', type: 'contactName' }));
  }

  private mediaTypeFromHeader(headerFormat: string): string {
    const format = String(headerFormat || '').toUpperCase();
    return ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(format)
      ? format.charAt(0) + format.slice(1).toLowerCase()
      : 'None';
  }
}
