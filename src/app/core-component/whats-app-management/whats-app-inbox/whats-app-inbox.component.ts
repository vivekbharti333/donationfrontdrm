import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as XLSX from 'xlsx';
import { WhatsAppInboxService } from './whats-app-inbox.service';

@Component({
  selector: 'app-whats-app-inbox',
  templateUrl: './whats-app-inbox.component.html',
  styleUrl: './whats-app-inbox.component.scss'
})
export class WhatsAppInboxComponent implements OnInit, OnDestroy {

  private readonly mediaCacheName = 'whatsapp-inbox-media-v1';

  allMessages: any[] = [];

  contactList: any[] = [];

  selectedWaId: string = '';

  selectedMessages: any[] = [];

  selectedUserName: string = '';
  selectedPhoneNumberId: string = '';
  selectedMediaFile: File | null = null;

  newMessage: string = '';
  messageId: string = '';
  isSending = false;
  sendError = '';
  isLoading = true;
  loadError = '';
  searchTerm = '';

  downloadingMediaIds = new Set<string>();
  mediaDownloadErrors = new Map<string, string>();
  mediaPreviewUrls = new Map<string, string>();
  pdfPreviewUrls = new Map<string, SafeResourceUrl>();
  excelPreviewRows = new Map<string, any[][]>();
  zoomedMediaUrl = '';
  zoomedMediaAlt = '';

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

  constructor(
    private whatsappService: WhatsAppInboxService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.getMessages();
  }

  ngOnDestroy(): void {
    this.mediaPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    this.mediaPreviewUrls.clear();
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

          void this.restoreCachedMedia(this.allMessages);

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
          phoneNumberId: msg.phoneNumberId,
          
        };

      } else {

        if (msg.userName) {
          groupedContacts[msg.waId].userName = msg.userName;
        }

        if (msg.phoneNumberId) {
          groupedContacts[msg.waId].phoneNumberId = msg.phoneNumberId;
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
    this.selectedPhoneNumberId = contact.phoneNumberId || '';
    

    this.selectedMessages = this.allMessages.filter((msg: any) => {
      return msg.waId == contact.waId;
    });

    this.scrollToLatestMessage();

  }

  private scrollToLatestMessage(): void {
    setTimeout(() => {
      const chatBody = document.querySelector<HTMLElement>('.chat-body');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }, 0);
  }

  onMediaSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    input.value = '';
    if (!file) {
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isImage && !isPdf) {
      this.sendError = 'Only images and PDF documents can be sent.';
      return;
    }
    this.selectedMediaFile = file;
    this.sendError = '';
  }

  removeSelectedMedia(): void {
    this.selectedMediaFile = null;
  }

sendMessage(): void {

  const messageText = this.newMessage?.trim();

  if ((!messageText && !this.selectedMediaFile) || !this.selectedWaId || this.isSending) {
    return;
  }

  this.isSending = true;
  this.sendError = '';

  // SEND PAYLOAD
  const payload = {

    waId: this.selectedWaId,

    messageText,
    phoneNumberId: this.selectedPhoneNumberId

  };

  console.log('SEND PAYLOAD => ', payload);

  // CALL SEND API
  const mediaFile = this.selectedMediaFile;
  this.whatsappService.sendReply(payload, mediaFile).subscribe({

    next: (result: any) => {

      const response = result?.response;
      const media = result?.media;

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

        messageType: media?.messageType || 'text',

        messageText,

        mediaId: media?.mediaId || null,
        mimeType: media?.mimeType || null,
        fileName: media?.fileName || null,
        phoneNumberId: this.selectedPhoneNumberId,

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

      if (mediaFile && media?.mediaId) {
        const objectUrl = URL.createObjectURL(mediaFile);
        this.mediaPreviewUrls.set(media.mediaId, objectUrl);
        void this.cacheMedia(media.mediaId, mediaFile);
        void this.prepareDocumentPreview(newMsg, media.mediaId, mediaFile, objectUrl);
      }

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
      this.selectedMediaFile = null;
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

  downloadMedia(message: any): void {
    const mediaId = this.getMediaId(message);
    if (!mediaId || this.downloadingMediaIds.has(mediaId)) {
      return;
    }

    this.downloadingMediaIds.add(mediaId);
    this.mediaDownloadErrors.delete(mediaId);

    this.whatsappService.downloadMedia(mediaId, message?.messageType, message?.phoneNumberId).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.mediaPreviewUrls.set(mediaId, objectUrl);
        void this.prepareDocumentPreview(message, mediaId, blob, objectUrl);
        void this.cacheMedia(mediaId, blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = this.getMediaFileName(message, blob.type, mediaId);
        document.body.appendChild(link);
        link.click();
        link.remove();
        this.downloadingMediaIds.delete(mediaId);
      },
      error: (error: any) => {
        this.downloadingMediaIds.delete(mediaId);
        const errorMessage = error?.name === 'TimeoutError'
          ? 'Download timed out. Check the backend and its connection to Meta.'
          : `Download failed${error?.status ? ' (HTTP ' + error.status + ')' : ''}. Please try again.`;
        this.mediaDownloadErrors.set(mediaId, errorMessage);
      }
    });
  }

  isMediaDownloading(message: any): boolean {
    const mediaId = this.getMediaId(message);
    return !!mediaId && this.downloadingMediaIds.has(mediaId);
  }

  getMediaDownloadError(message: any): string {
    const mediaId = this.getMediaId(message);
    return mediaId ? this.mediaDownloadErrors.get(mediaId) || '' : '';
  }

  canDownloadMedia(message: any): boolean {
    return !!this.getMediaId(message);
  }

  getMediaPreviewUrl(message: any): string {
    const mediaId = this.getMediaId(message);
    return mediaId ? this.mediaPreviewUrls.get(mediaId) || '' : '';
  }

  isMediaDownloaded(message: any): boolean {
    return !!this.getMediaPreviewUrl(message);
  }

  getDocumentKind(message: any): 'pdf' | 'excel' | 'document' {
    const fileName = this.getDocumentName(message).toLowerCase();
    const mimeType = String(message?.mimeType || '').toLowerCase();

    if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
      return 'pdf';
    }

    if (mimeType.includes('spreadsheet') ||
        mimeType.includes('excel') ||
        fileName.endsWith('.xls') ||
        fileName.endsWith('.xlsx') ||
        fileName.endsWith('.csv')) {
      return 'excel';
    }

    return 'document';
  }

  getDocumentIconLabel(message: any): string {
    const kind = this.getDocumentKind(message);
    return kind === 'pdf' ? 'PDF' : kind === 'excel' ? 'XLS' : 'FILE';
  }

  openDownloadedDocument(message: any): void {
    const previewUrl = this.getMediaPreviewUrl(message);
    if (!previewUrl) {
      return;
    }

    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  }

  getPdfPreviewUrl(message: any): SafeResourceUrl | null {
    const mediaId = this.getMediaId(message);
    return mediaId ? this.pdfPreviewUrls.get(mediaId) || null : null;
  }

  getExcelPreviewRows(message: any): any[][] {
    const mediaId = this.getMediaId(message);
    return mediaId ? this.excelPreviewRows.get(mediaId) || [] : [];
  }

  openImagePreview(message: any): void {
    const previewUrl = this.getMediaPreviewUrl(message);
    if (!previewUrl) {
      return;
    }

    this.zoomedMediaUrl = previewUrl;
    this.zoomedMediaAlt = message?.messageText || 'WhatsApp image';
  }

  closeImagePreview(): void {
    this.zoomedMediaUrl = '';
    this.zoomedMediaAlt = '';
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeImagePreview();
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

  private getMediaId(message: any): string | null {
    if (message?.mediaId) {
      return String(message.mediaId);
    }

    if (!message?.rawJson) {
      return null;
    }

    try {
      const raw = typeof message.rawJson === 'string'
        ? JSON.parse(message.rawJson)
        : message.rawJson;
      const whatsappMessage = raw?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      return whatsappMessage?.[message.messageType]?.id || null;
    } catch {
      return null;
    }
  }

  private getMediaFileName(message: any, blobMimeType: string, mediaId: string): string {
    if ((message?.messageType || '').toLowerCase() === 'document') {
      return this.getDocumentName(message);
    }

    const mimeType = blobMimeType || message?.mimeType || '';
    const extension = mimeType.split('/')[1]?.split(';')[0]?.replace('jpeg', 'jpg');
    return `whatsapp-${message?.messageType || 'media'}-${mediaId}${extension ? '.' + extension : ''}`;
  }

  private async cacheMedia(mediaId: string, blob: Blob): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open(this.mediaCacheName);
      await cache.put(this.getMediaCacheRequest(mediaId), new Response(blob, {
        headers: { 'Content-Type': blob.type || 'application/octet-stream' }
      }));
    } catch (error) {
      console.warn('Could not cache WhatsApp media', error);
    }
  }

  private async restoreCachedMedia(messages: any[]): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open(this.mediaCacheName);
      await Promise.all(messages.map(async (message: any) => {
        const mediaId = this.getMediaId(message);
        if (!mediaId || this.mediaPreviewUrls.has(mediaId)) {
          return;
        }

        const response = await cache.match(this.getMediaCacheRequest(mediaId));
        if (!response) {
          return;
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        this.mediaPreviewUrls.set(mediaId, objectUrl);
        await this.prepareDocumentPreview(message, mediaId, blob, objectUrl);
      }));
      this.scrollToLatestMessage();
    } catch (error) {
      console.warn('Could not restore cached WhatsApp media', error);
    }
  }

  private getMediaCacheRequest(mediaId: string): Request {
    const cacheUrl = new URL(`/whatsapp-inbox-media-cache/${encodeURIComponent(mediaId)}`, window.location.origin);
    return new Request(cacheUrl.toString());
  }

  private async prepareDocumentPreview(
    message: any,
    mediaId: string,
    blob: Blob,
    objectUrl: string
  ): Promise<void> {
    const documentKind = this.getDocumentKind(message);

    if (documentKind === 'pdf') {
      this.pdfPreviewUrls.set(
        mediaId,
        this.sanitizer.bypassSecurityTrustResourceUrl(`${objectUrl}#page=1&toolbar=0&navpanes=0`)
      );
      return;
    }

    if (documentKind !== 'excel') {
      return;
    }

    try {
      const workbook = XLSX.read(await blob.arrayBuffer(), { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        return;
      }

      const rows = XLSX.utils.sheet_to_json<any[]>(workbook.Sheets[firstSheetName], {
        header: 1,
        blankrows: false,
        defval: ''
      });
      this.excelPreviewRows.set(mediaId, rows.slice(0, 7).map(row => row.slice(0, 6)));
    } catch (error) {
      console.warn('Could not create Excel preview', error);
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
