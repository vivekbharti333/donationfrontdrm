import { Component, OnInit } from '@angular/core';
import { WhatsAppInboxService } from './whats-app-inbox.service';

@Component({
  selector: 'app-whats-app-inbox',
  templateUrl: './whats-app-inbox.component.html',
  styleUrl: './whats-app-inbox.component.scss'
})
export class WhatsAppInboxComponent implements OnInit {

  allMessages: any[] = [];

  contactList: any[] = [];

  selectedWaId: string = '';

  selectedMessages: any[] = [];

  selectedUserName: string = '';

  newMessage: string = '';
  messageId: string = '';
  isSending = false;
  sendError = '';
  isLoading = true;
  loadError = '';
  searchTerm = '';

  get filteredContacts(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.contactList;
    }

    return this.contactList.filter((contact: any) =>
      `${contact.userName} ${contact.waId} ${contact.lastMessage}`
        .toLowerCase()
        .includes(term)
    );
  }

  constructor(private whatsappService: WhatsAppInboxService) { }

  ngOnInit(): void {
    this.getMessages();
  }

  getMessages(): void {
    this.isLoading = true;
    this.loadError = '';

    this.whatsappService.getWhatsAppMessage().subscribe({

      next: (response: any) => {

        if (response.responseCode == 200) {

          this.allMessages = Array.isArray(response.listPayload)
            ? response.listPayload.map((message: any) => this.normalizeMessage(message))
            : [];

          // SORT MESSAGE
          this.allMessages.sort((a: any, b: any) => {
            return a.sortTimestamp - b.sortTimestamp;
          });

          this.prepareContactList();
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.loadError = response.responseMessage || 'Could not load conversations.';
        }

      },

      error: (error) => {
        console.log(error);
        this.isLoading = false;
        this.loadError = 'Could not load conversations. Please try again.';
      }

    });

  }

  prepareContactList(): void {

    const groupedContacts: any = {};

    this.allMessages.forEach((msg: any) => {

      if (!groupedContacts[msg.waId]) {

        groupedContacts[msg.waId] = {
          waId: msg.waId,
          userName: msg.userName || msg.waId,
          lastMessage: this.getMessagePreview(msg),
          lastTime: msg.sortTimestamp,
          
        };

      } else {

        if (msg.userName) {
          groupedContacts[msg.waId].userName = msg.userName;
        }

        if (msg.sortTimestamp >= groupedContacts[msg.waId].lastTime) {

          groupedContacts[msg.waId].lastMessage = this.getMessagePreview(msg);

          groupedContacts[msg.waId].lastTime =
            msg.sortTimestamp;

        }

      }

    });

    this.contactList = Object.values(groupedContacts);

    // SORT CONTACT BY LATEST MESSAGE
    this.contactList.sort((a: any, b: any) => {
      return b.lastTime - a.lastTime;
    });

    // DEFAULT OPEN FIRST CHAT
    if (this.contactList.length > 0 && !this.selectedWaId) {
      this.selectChat(this.contactList[0]);
    }

  }

  selectChat(contact: any): void {

    this.selectedWaId = contact.waId;

    this.selectedUserName = contact.userName;
    

    this.selectedMessages = this.allMessages.filter((msg: any) => {
      return msg.waId == contact.waId;
    });

  }

sendMessage(): void {

  const messageText = this.newMessage?.trim();

  if (!messageText || !this.selectedWaId || this.isSending) {
    return;
  }

  this.isSending = true;
  this.sendError = '';

  // SEND PAYLOAD
  const payload = {

    waId: this.selectedWaId,

    messageText

  };

  console.log('SEND PAYLOAD => ', payload);

  // CALL SEND API
  this.whatsappService.replyMessage(payload).subscribe({

    next: (response: any) => {

      console.log('SEND RESPONSE => ', response);

      if (response?.responseCode != null && response.responseCode != 200) {
        this.isSending = false;
        this.sendError = response.responseMessage || 'Message could not be sent.';
        return;
      }

      const newMsg = this.normalizeMessage({

        waId: this.selectedWaId,

        userName: this.selectedUserName,

        direction: 'OUTGOING',

        messageType: 'text',

        messageText,

        messageTimestamp: Math.floor(Date.now() / 1000),

        // REAL WHATSAPP MESSAGE ID
        messageId: response?.messageId || response?.listPayload?.messageId || null,

        status: response?.status || response?.listPayload?.status || 'SENT',

        createdAt: new Date().toISOString()
      });

      console.log(
        'MessageId => ',
        newMsg.messageId
      );

      // ADD MESSAGE INTO CHAT
      this.allMessages.push(newMsg);

      // UPDATE CURRENT CHAT
      this.selectedMessages.push(newMsg);

      // REFRESH CONTACT LIST
      this.prepareContactList();

      // REFRESH CURRENT CHAT
      this.selectedMessages =
        this.allMessages.filter((msg: any) => {
          return msg.waId == this.selectedWaId;
        });

      // CLEAR INPUT
      this.newMessage = '';
      this.isSending = false;

      // AUTO SCROLL
      setTimeout(() => {

        const chatBody =
          document.querySelector('.chat-body');

        if (chatBody) {
          chatBody.scrollTop =
            chatBody.scrollHeight;
        }

      }, 100);
    },

    error: (error) => {
      console.log(error);
      this.isSending = false;
      this.sendError = error?.error?.responseMessage || 'Message could not be sent. Please try again.';
    }

  });
}

  getMessageTime(timestamp: number): string {

    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp);

    return date.toLocaleString([], {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

  }

  getContactTime(timestamp: number): string {
    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    return isToday
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { day: '2-digit', month: 'short' });
  }

  getInitials(name: string, waId: string): string {
    const displayName = name && name !== waId ? name : '';
    if (!displayName) {
      return (waId || '?').slice(-2);
    }

    return displayName
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  getStatusLabel(status: string | null | undefined): string {
    switch ((status || '').toUpperCase()) {
      case 'READ':
      case 'DELIVERED':
        return '✓✓';
      case 'SENT':
        return '✓';
      case 'FAILED':
      case 'FAILD':
        return '!';
      default:
        return '◷';
    }
  }

  getStatusClass(status: string | null | undefined): string {
    const normalizedStatus = (status || '').toUpperCase();
    if (normalizedStatus === 'READ') {
      return 'status-read';
    }
    if (normalizedStatus === 'FAILED' || normalizedStatus === 'FAILD') {
      return 'status-failed';
    }
    return 'status-pending';
  }

  getMessagePreview(message: any): string {
    switch ((message?.messageType || '').toLowerCase()) {
      case 'image':
        return '📷 Image';
      case 'document':
        return `📄 ${message.fileName || 'Document'}`;
      case 'text':
        return message.messageText || 'Message';
      default:
        return 'Unsupported message';
    }
  }

  getDocumentName(message: any): string {
    return message?.fileName || this.getRawMediaValue(message, 'filename') || 'Document';
  }

  private normalizeMessage(message: any): any {
    const timestamp = Number(message?.messageTimestamp);
    const createdAtTimestamp = this.parseCreatedAt(message?.createdAt);
    const sortTimestamp = Number.isFinite(timestamp) && timestamp > 0
      ? timestamp * 1000
      : createdAtTimestamp;

    return {
      ...message,
      sortTimestamp
    };
  }

  private getRawMediaValue(message: any, property: 'url' | 'filename'): string | null {
    if (!message?.rawJson) {
      return null;
    }

    try {
      const raw = typeof message.rawJson === 'string'
        ? JSON.parse(message.rawJson)
        : message.rawJson;
      const whatsappMessage = raw?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      const media = whatsappMessage?.[message.messageType];
      return media?.[property] || null;
    } catch {
      return null;
    }
  }

  private parseCreatedAt(createdAt: string | null | undefined): number {
    if (!createdAt) {
      return 0;
    }

    const parsedTimestamp = new Date(createdAt.replace(' ', 'T')).getTime();
    return Number.isNaN(parsedTimestamp) ? 0 : parsedTimestamp;
  }

}
