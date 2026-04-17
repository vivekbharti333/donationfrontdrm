import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-whats-app-templates',
  templateUrl: './whats-app-templates.component.html',
  styleUrls: ['./whats-app-templates.component.scss']
})
export class WhatsAppTemplatesComponent {

  /* ================= TEMPLATE ================= */
  template = {
    name: '',
    language: 'English',
    header: '',
    body: '',
    footer: ''
  };

  variables: string[] = [];
  variableValues: Record<string, string> = {};

  selectedVariableType: any = 'Name';
  showVarDropdown = false;

  selectedMediaType: any = 'None';
  showMediaDropdown = false;

  /* ================= CHAT DATA ================= */

  leads = [
    {
      id: 1,
      name: 'Rahul Sharma',
      lastMessage: 'Yes interested',
      messages: [
        { text: 'Hello', direction: 'OUTGOING', time: '12:30 PM' },
        { text: 'Yes interested', direction: 'INCOMING', time: '12:31 PM' }
      ]
    },
    {
      id: 2,
      name: 'NGO XYZ',
      lastMessage: 'Hello',
      messages: [
        { text: 'Hi', direction: 'OUTGOING', time: '10:00 AM' },
        { text: 'Hello', direction: 'INCOMING', time: '10:01 AM' }
      ]
    }
  ];

  selectedLead: any = null;
  messages: any[] = [];
  newMessage: string = '';

  /* ================= CHAT LOGIC ================= */

  selectLead(lead: any) {
    this.selectedLead = lead;
    this.messages = lead.messages;
  }

  sendMessage() {
    if (!this.newMessage) return;

    this.messages.push({
      text: this.newMessage,
      direction: 'OUTGOING',
      time: 'Now'
    });

    this.newMessage = '';
  }

  /* ================= TEMPLATE LOGIC ================= */

  onBodyChange() {
    this.detectVariables();
  }

  detectVariables() {
    const text = this.template.body || '';
    const matches = text.match(/{{(.*?)}}/g);

    if (!matches) {
      this.variables = [];
      return;
    }

    const unique = [...new Set(matches)];
    this.variables = unique;

    unique.forEach(v => {
      if (!this.variableValues[v]) {
        this.variableValues[v] = '';
      }
    });
  }

  getPreviewText() {
    let text = this.template.body || '';

    this.variables.forEach(v => {
      const value = this.variableValues[v] || v;
      text = text.replaceAll(v, value);
    });

    return text;
  }

  addVariable() {
    const variable =
      this.selectedVariableType === 'Number' ? '{{1}}' : '{{name}}';

    this.template.body += ' ' + variable;
    this.detectVariables();
  }

  /* ================= DROPDOWN ================= */

  toggleVarDropdown() {
    this.showVarDropdown = !this.showVarDropdown;
    this.showMediaDropdown = false;
  }

  selectVariableType(type: any) {
    this.selectedVariableType = type;
    this.showVarDropdown = false;
  }

  toggleMediaDropdown() {
    this.showMediaDropdown = !this.showMediaDropdown;
    this.showVarDropdown = false;
  }

  selectMediaType(type: any) {
    this.selectedMediaType = type;
    this.showMediaDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: any) {
    if (!event.target.closest('.dropdown')) {
      this.showVarDropdown = false;
      this.showMediaDropdown = false;
    }
  }

  submitTemplate() {
    console.log('FINAL DATA:', {
      ...this.template,
      variables: this.variableValues
    });
  }
}