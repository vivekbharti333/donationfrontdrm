import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { routes } from 'src/app/core/helpers/routes';
import { AddWhatsAppTemplatesService } from './add-whats-app-templates.service';

@Component({
  selector: 'app-add-whats-app-templates',
  templateUrl: './add-whats-app-templates.component.html',
  styleUrl: './add-whats-app-templates.component.scss'
})
export class AddWhatsAppTemplatesComponent {
// export class AddWhatsAppTemplatesComponent implements OnInit {

  @ViewChild('bodyTextarea') bodyTextarea?: ElementRef<HTMLTextAreaElement>;

  public addTemplateForm!: FormGroup;

  filePreview: string | null = null;
  selectedFile: File | null = null;
  fileName = '';
  fileError = '';
  formError = '';
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private addWhatsAppTemplatesService: AddWhatsAppTemplatesService,
    private router: Router
  ) {}

  // ================= INIT =================
  ngOnInit() {
    this.createForms();
  }

  // ================= FORM =================
  createForms() {
    this.addTemplateForm = this.fb.group({
      templateName: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
      category: ['MARKETING', Validators.required],
      parameterFormat: ['POSITIONAL'],

      headerFormat: ['TEXT'],
      headerText: ['', Validators.maxLength(60)],
      headerVariable: this.fb.array([]),

      msgBodyText: ['', [Validators.required, Validators.maxLength(1024)]],
      msgBodyVariable: this.fb.array([]),

      footerText: ['', Validators.maxLength(60)],
      language: ['en', Validators.required],

      // dropdown values
      variableType: ['Number'],
      mediaType: ['None']
    });
  }

  // ================= VARIABLES =================
  get variablesArray(): FormArray {
    return this.addTemplateForm?.get('msgBodyVariable') as FormArray;
  }

  get headerVariablesArray(): FormArray {
    return this.addTemplateForm?.get('headerVariable') as FormArray;
  }

  get bodyVariablePositionInvalid(): boolean {
    const body = String(this.addTemplateForm?.get('msgBodyText')?.value || '').trim();
    const variablePattern = this.addTemplateForm?.get('variableType')?.value === 'Name'
      ? '\\{\\{[a-z][a-z0-9_]*\\}\\}'
      : '\\{\\{\\d+\\}\\}';
    return new RegExp(`^${variablePattern}`).test(body) ||
      new RegExp(`${variablePattern}$`).test(body);
  }

  createVariableGroup(key: string, value: string = '') {
    return this.fb.group({
      key: [key],
      value: [value, Validators.required]
    });
  }

  addVariable() {
    const variable = this.getVariableKey(this.variablesArray.length);

    const bodyControl = this.addTemplateForm.get('msgBodyText');
    bodyControl?.setValue(`${bodyControl.value || ''}${bodyControl.value ? ' ' : ''}${variable}`);

    this.detectVariables();
  }

  formatBodyText(marker: '*' | '_' | '~'): void {
    const textarea = this.bodyTextarea?.nativeElement;
    const bodyControl = this.addTemplateForm.get('msgBodyText');
    if (!textarea || !bodyControl) {
      return;
    }

    const value = String(bodyControl.value || '');
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? start;
    const selectedText = value.slice(start, end);
    const formattedText = `${marker}${selectedText}${marker}`;
    const updatedValue = value.slice(0, start) + formattedText + value.slice(end);

    if (updatedValue.length > 1024) {
      return;
    }

    bodyControl.setValue(updatedValue);
    bodyControl.markAsDirty();
    this.detectVariables();

    requestAnimationFrame(() => {
      textarea.focus();
      const selectionStart = start + marker.length;
      textarea.setSelectionRange(
        selectionStart,
        selectedText ? selectionStart + selectedText.length : selectionStart
      );
    });
  }

  addHeaderVariable(): void {
    if (this.headerVariablesArray.length > 0) {
      return;
    }

    const key = this.getHeaderVariableKey();
    const headerControl = this.addTemplateForm.get('headerText');
    headerControl?.setValue(
      `${headerControl.value || ''}${headerControl.value ? ' ' : ''}${key}`
    );
    this.detectHeaderVariables();
  }

  detectHeaderVariables(): void {
    const text = String(this.addTemplateForm.get('headerText')?.value || '');
    const pattern = this.addTemplateForm.get('variableType')?.value === 'Name'
      ? /{{[a-z][a-z0-9_]*}}/g
      : /{{\d+}}/g;
    const matches = [...new Set<string>(text.match(pattern) || [])].slice(0, 1);
    const oldValues = this.headerVariablesArray.getRawValue();
    this.headerVariablesArray.clear();

    matches.forEach(key => {
      const existing = oldValues.find((variable: any) => variable.key === key);
      this.headerVariablesArray.push(this.createVariableGroup(key, existing?.value || ''));
    });
  }

  removeHeaderVariable(): void {
    const variable = this.headerVariablesArray.at(0)?.value;
    if (variable?.key) {
      const header = String(this.addTemplateForm.get('headerText')?.value || '')
        .replaceAll(variable.key, '')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
      this.addTemplateForm.get('headerText')?.setValue(header);
    }
    this.headerVariablesArray.clear();
  }

  detectVariables() {
    const text = this.addTemplateForm.get('msgBodyText')?.value || '';

    const isNamed = this.addTemplateForm.get('variableType')?.value === 'Name';
    const pattern = isNamed ? /{{[a-z][a-z0-9_]*}}/g : /{{\d+}}/g;
    const unique = [...new Set<string>(text.match(pattern) || [])];

    const formArray = this.variablesArray;
    const oldValues = formArray.value;

    formArray.clear();

    unique.forEach((v: string) => {
      const existing = oldValues.find((x: any) => x.key === v);

      formArray.push(this.createVariableGroup(v, existing?.value || ''));
    });
  }

  changeVariableType(type: 'Name' | 'Number'): void {
    const variables = this.variablesArray.getRawValue();
    const headerVariables = this.headerVariablesArray.getRawValue();
    let body = String(this.addTemplateForm.get('msgBodyText')?.value || '');
    let header = String(this.addTemplateForm.get('headerText')?.value || '');

    variables.forEach((variable: any, index: number) => {
      body = body.replaceAll(variable.key, `__WA_FORMAT_VARIABLE_${index}__`);
    });
    headerVariables.forEach((variable: any, index: number) => {
      header = header.replaceAll(variable.key, `__WA_HEADER_VARIABLE_${index}__`);
    });

    this.addTemplateForm.patchValue({
      variableType: type,
      parameterFormat: type === 'Name' ? 'NAMED' : 'POSITIONAL'
    });
    this.variablesArray.clear();
    this.headerVariablesArray.clear();

    variables.forEach((variable: any, index: number) => {
      const newKey = this.getVariableKey(index);
      body = body.replaceAll(`__WA_FORMAT_VARIABLE_${index}__`, newKey);
      this.variablesArray.push(this.createVariableGroup(newKey, variable.value));
    });
    headerVariables.forEach((variable: any, index: number) => {
      const newKey = this.getHeaderVariableKey();
      header = header.replaceAll(`__WA_HEADER_VARIABLE_${index}__`, newKey);
      this.headerVariablesArray.push(this.createVariableGroup(newKey, variable.value));
    });

    this.addTemplateForm.get('msgBodyText')?.setValue(body);
    this.addTemplateForm.get('headerText')?.setValue(header);
  }

  removeVariable(index: number): void {
    const variables = this.variablesArray.getRawValue();
    const variableToRemove = variables[index];
    if (!variableToRemove) {
      return;
    }

    let body = String(this.addTemplateForm.get('msgBodyText')?.value || '')
      .replaceAll(variableToRemove.key, '');
    const remainingVariables = variables.filter((_: any, variableIndex: number) =>
      variableIndex !== index
    );

    remainingVariables.forEach((variable: any, variableIndex: number) => {
      body = body.replaceAll(variable.key, `__WA_VARIABLE_${variableIndex}__`);
    });

    this.variablesArray.clear();
    remainingVariables.forEach((variable: any, variableIndex: number) => {
      const newKey = this.getVariableKey(variableIndex);
      body = body.replaceAll(`__WA_VARIABLE_${variableIndex}__`, newKey);
      this.variablesArray.push(this.createVariableGroup(newKey, variable.value));
    });

    body = body
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/ +([,.!?])/g, '$1')
      .trim();
    this.addTemplateForm.get('msgBodyText')?.setValue(body);
  }

  private getVariableKey(index: number): string {
    if (this.addTemplateForm.get('variableType')?.value === 'Name') {
      return index === 0 ? '{{name}}' : `{{name_${index + 1}}}`;
    }
    return `{{${index + 1}}}`;
  }

  private getHeaderVariableKey(): string {
    return this.addTemplateForm.get('variableType')?.value === 'Name'
      ? '{{header_name}}'
      : '{{1}}';
  }

  // ================= PREVIEW =================
  getPreviewText(): string {
    let text = this.addTemplateForm.get('msgBodyText')?.value || '';

    this.variablesArray.value.forEach((v: any) => {
      text = text.replaceAll(v.key, v.value || v.key);
    });

    return text;
  }

  getPreviewHtml(): string {
    const escapedText = this.escapeHtml(
      this.getPreviewText() || 'Your message preview...'
    );

    return escapedText
      .replace(/\*([^*\r\n]+)\*/g, '<strong>$1</strong>')
      .replace(/_([^_\r\n]+)_/g, '<em>$1</em>')
      .replace(/~([^~\r\n]+)~/g, '<s>$1</s>');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileError = '';
    const mediaType = this.addTemplateForm.get('mediaType')?.value;
    const allowed = mediaType === 'Image'
      ? file.type.startsWith('image/')
      : mediaType === 'Video'
        ? file.type.startsWith('video/')
        : ['application/pdf', 'application/msword',
           'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
          .includes(file.type);

    if (!allowed) {
      this.fileError = `Select a valid ${String(mediaType).toLowerCase()} file.`;
      input.value = '';
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      this.fileError = 'File size must be 16 MB or less.';
      input.value = '';
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = () => this.filePreview = String(reader.result);
    reader.readAsDataURL(file);
  }

  selectMediaType(type: string) {

  this.addTemplateForm.get('mediaType')?.setValue(type);

  this.clearSelectedFile();
  if (type !== 'None') {
    this.removeHeaderVariable();
    this.addTemplateForm.get('headerText')?.setValue('');
  }

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

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.filePreview = null;
    this.fileName = '';
    this.fileError = '';
  }

  // ================= SUBMIT =================
  submitTemplate() {
    this.formError = '';
    this.detectVariables();
    const needsMedia = this.addTemplateForm.get('mediaType')?.value !== 'None';
    if (this.addTemplateForm.invalid || this.bodyVariablePositionInvalid ||
        (needsMedia && !this.selectedFile)) {
      this.addTemplateForm.markAllAsTouched();
      this.formError = this.bodyVariablePositionInvalid
        ? `Variables can't be at the start or end of the message body.`
        : needsMedia && !this.selectedFile
        ? 'Select a valid media sample.'
        : 'Complete all required fields and variable samples.';
      return;
    }

    const form = this.addTemplateForm.getRawValue();

    const payload = {
      payload: {
        templateName: form.templateName,
        language: form.language,
        category: form.category,
        parameterFormat: form.parameterFormat,

        headerAvailable: !!form.headerText || form.headerFormat !== 'TEXT',
        headerFormat: form.headerFormat,
        headerText: form.headerText,

        headerExample: form.headerFormat === 'TEXT'
          ? form.headerVariable.map((variable: any) => variable.value)
          : [],

        headerVariable: form.headerVariable.map((variable: any) => ({
          headerVariable: String(variable.key).replace(/[{}]/g, ''),
          example: variable.value
        })),

        msgBodyText: form.msgBodyText,

        msgBodyVariable: form.msgBodyVariable.map((variable: any) => ({
          bodyVariable: String(variable.key).replace(/[{}]/g, ''),
          example: variable.value
        })),

        bodyExample: [
          this.variablesArray.value.map((v: any) => v.value)
        ],

        footerAvailable: !!form.footerText,
        footerText: form.footerText,

        replyButtonAvailable: false
      }
    };

    this.isSaving = true;
    this.addWhatsAppTemplatesService
      .createTemplate(payload, this.selectedFile, form.mediaType)
      .subscribe({
      next: (res: any) => {
        this.isSaving = false;
        const metaResult = res?.payload;
        if ((res?.responseCode != null && Number(res.responseCode) !== 200) ||
            (metaResult?.respCode != null && Number(metaResult.respCode) !== 200)) {
          this.formError = res?.responseMessage || metaResult?.respMesg || 'Template could not be created.';
          return;
        }
        Swal.fire({
          title: 'Template created',
          text: res?.responseMessage || 'The WhatsApp template was submitted successfully.',
          icon: 'success',
          timer: 1200,
          showConfirmButton: false
        }).then(() => this.router.navigateByUrl(routes.whatsAppTemplates));
      },
      error: (err: any) => {
        this.isSaving = false;
        this.formError = err?.error?.responseMessage || err?.responseMessage || err?.message ||
          'Template could not be created.';
      }
    });
  }

 
}
