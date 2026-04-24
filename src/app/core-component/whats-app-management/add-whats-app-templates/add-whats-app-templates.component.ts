import { Component, importProvidersFrom, TemplateRef, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormGroup, FormArray, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  DataService,
  pageSelection,
  apiResultFormat,
  SidebarService,
} from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { Constant } from 'src/app/core/constant/constants';
import { DonationDetails, DonationListForExcel } from '../../interface/donation-management';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CustomPaginationComponent } from 'src/app/shared/custom-pagination/custom-pagination.component';
import { AddWhatsAppTemplatesService } from './add-whats-app-templates.service';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-add-whats-app-templates',
  templateUrl: './add-whats-app-templates.component.html',
  styleUrl: './add-whats-app-templates.component.scss'
})
export class AddWhatsAppTemplatesComponent {
// export class AddWhatsAppTemplatesComponent implements OnInit {

  public addTemplateForm!: FormGroup;

  // dropdown flags
  showVarDropdown = false;
  showMediaDropdown = false;

//   selectedFile: File | null = null;
// filePreview: string | null = null;
// fileName: string = '';

filePreview: SafeResourceUrl | null = null;
selectedFile: File | null = null;
fileName: string = '';

  constructor(
    private fb: FormBuilder,
    private addWhatsAppTemplatesService: AddWhatsAppTemplatesService,
  private sanitizer: DomSanitizer
  ) {}

  // ================= INIT =================
  ngOnInit() {
    this.createForms();
  }

  // ================= FORM =================
  createForms() {
    this.addTemplateForm = this.fb.group({
      templateName: [''],
      parameterFormat: ['POSITIONAL'],

      headerFormat: ['TEXT'],
      headerText: [''],

      msgBodyText: [''],
      msgBodyVariable: this.fb.array([]),

      footerText: [''],
      language: ['en'],

      // dropdown values
      variableType: ['Name'],
      mediaType: ['None']
    });
  }

  // ================= VARIABLES =================
  get variablesArray(): FormArray {
    return this.addTemplateForm?.get('msgBodyVariable') as FormArray;
  }

  createVariableGroup(key: string, value: string = '') {
    return this.fb.group({
      key: key,
      value: value
    });
  }

  addVariable() {
    const index = this.variablesArray.length + 1;
    const variable =
      this.addTemplateForm.get('variableType')?.value === 'Name'
        ? `{{name}}`
        : `{{${index}}}`;

    const bodyControl = this.addTemplateForm.get('msgBodyText');
    bodyControl?.setValue((bodyControl.value || '') + ' ' + variable);

    this.detectVariables();
  }

  detectVariables() {
    const text = this.addTemplateForm.get('msgBodyText')?.value || '';

    const matches = text.match(/{{(.*?)}}/g) || [];
    const unique = [...new Set(matches)] as string[];

    const formArray = this.variablesArray;
    const oldValues = formArray.value;

    formArray.clear();

    unique.forEach((v: string) => {
      const existing = oldValues.find((x: any) => x.key === v);

      formArray.push(
        this.fb.group({
          key: v,
          value: existing ? existing.value : ''
        })
      );
    });
  }

  // ================= PREVIEW =================
  getPreviewText(): string {
    let text = this.addTemplateForm.get('msgBodyText')?.value || '';

    this.variablesArray.value.forEach((v: any) => {
      text = text.replaceAll(v.key, v.value || v.key);
    });

    return text;
  }

  // ================= DROPDOWN =================

 toggleVarDropdown(event: Event) {
  event.stopPropagation(); // ✅ VERY IMPORTANT
  this.showVarDropdown = !this.showVarDropdown;
}

  selectVariableType(type: string) {
    this.addTemplateForm.get('variableType')?.setValue(type);
    this.showVarDropdown = false;
  }

  toggleMediaDropdown(event: Event) {
    event.stopPropagation();
    this.showMediaDropdown = !this.showMediaDropdown;
    this.showVarDropdown = false;
  }

  onFileSelect(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  this.selectedFile = file;
  this.fileName = file.name;

  const reader = new FileReader();
  reader.onload = () => {
    this.filePreview = reader.result as string;
  };
  reader.readAsDataURL(file);
}

  selectMediaType(type: string) {

  this.addTemplateForm.get('mediaType')?.setValue(type);

  // reset previous file
  this.selectedFile = null;
  this.filePreview = null;
  this.fileName = '';

  // map to headerFormat
  if (type === 'Image') {
    this.addTemplateForm.get('headerFormat')?.setValue('IMAGE');
  } else if (type === 'Video') {
    this.addTemplateForm.get('headerFormat')?.setValue('VIDEO');
  } else if (type === 'Document') {
    this.addTemplateForm.get('headerFormat')?.setValue('DOCUMENT');
  } else {
    this.addTemplateForm.get('headerFormat')?.setValue('TEXT');
  }
}

  @HostListener('document:click')
  closeDropdown() {
    this.showVarDropdown = false;
    this.showMediaDropdown = false;
  }

  // ================= SUBMIT =================
  submitTemplate() {

    const form = this.addTemplateForm.value;

    const payload = {
      payload: {
        templateName: form.templateName,
        language: form.language,
        category: 'MARKETING',
        parameterFormat: form.parameterFormat,

        headerAvailable: !!form.headerText,
        headerFormat: form.headerFormat,
        headerText: form.headerText,

        headerExample:
          form.headerFormat === 'TEXT'
            ? ['Sample']
            : ['MEDIA_HANDLE_ID'],

        msgBodyText: form.msgBodyText,

        bodyExample: [
          this.variablesArray.value.map((v: any) => v.value || 'sample')
        ],

        footerAvailable: !!form.footerText,
        footerText: form.footerText,

        replyButtonAvailable: false
      }
    };

    console.log('FINAL PAYLOAD:', payload);

    this.addWhatsAppTemplatesService.createTemplate(payload).subscribe({
      next: (res: any) => {
        console.log('SUCCESS', res);
      },
      error: (err: any) => {
        console.error('ERROR', err);
      }
    });
  }

 
}