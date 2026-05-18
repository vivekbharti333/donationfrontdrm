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

  constructor(private whatsappService: WhatsAppInboxService) { }

  ngOnInit(): void {
    this.getMessages();
  }

  getMessages(): void {

    this.whatsappService.getWhatsAppMessage().subscribe({

      next: (response: any) => {

        if (response.responseCode == 200) {

          this.allMessages = response.listPayload;

          // SORT MESSAGE
          this.allMessages.sort((a: any, b: any) => {
            return a.messageTimestamp - b.messageTimestamp;
          });

          this.prepareContactList();

        }

      },

      error: (error) => {
        console.log(error);
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
          lastMessage: msg.messageText || 'Unsupported Message',
          lastTime: msg.messageTimestamp,
          
        };

      } else {

        if (msg.messageTimestamp > groupedContacts[msg.waId].lastTime) {

          groupedContacts[msg.waId].lastMessage =
            msg.messageText || 'Unsupported Message';

          groupedContacts[msg.waId].lastTime =
            msg.messageTimestamp;

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

  sendMessage1(): void {

    if (!this.newMessage || this.newMessage.trim() == '') {
      return;
    }

    const newMsg = {
      waId: this.selectedWaId,
      userName: this.selectedUserName,
      direction: 'OUTGOING',
      messageType: 'text',
      messageText: this.newMessage,
      messageTimestamp: Math.floor(Date.now() / 1000),
      messageId: this.messageId
    };

    console.log("Message : "+newMsg.waId+" , "+newMsg.messageText+" , "+newMsg.messageId);

    // ADD INTO MAIN ARRAY
    this.allMessages.push(newMsg);

    // UPDATE CURRENT CHAT
    this.selectedMessages.push(newMsg);

    // REFRESH CONTACT LIST
    this.prepareContactList();

    // REFRESH CURRENT CHAT
    this.selectedMessages = this.allMessages.filter((msg: any) => {
      return msg.waId == this.selectedWaId;
    });

    // CLEAR INPUT
    this.newMessage = '';

    // AUTO SCROLL
    setTimeout(() => {

      const chatBody = document.querySelector('.chat-body');

      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }

    }, 100);

  }

sendMessage(): void {

  if (!this.newMessage || this.newMessage.trim() == '') {
    return;
  }

  // SEND PAYLOAD
  const payload = {

    waId: this.selectedWaId,

    messageText: this.newMessage

  };

  console.log('SEND PAYLOAD => ', payload);

  // CALL SEND API
  this.whatsappService.replyMessage(payload).subscribe({

    next: (response: any) => {

      console.log('SEND RESPONSE => ', response);

      const newMsg = {

        waId: this.selectedWaId,

        userName: this.selectedUserName,

        direction: 'OUTGOING',

        messageType: 'text',

        messageText: this.newMessage,

        messageTimestamp: Math.floor(Date.now() / 1000),

        // REAL WHATSAPP MESSAGE ID
        messageId: response.messageId
      };

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
    }

  });
}

  getMessageTime(timestamp: number): string {

    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp * 1000);

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

  }

}