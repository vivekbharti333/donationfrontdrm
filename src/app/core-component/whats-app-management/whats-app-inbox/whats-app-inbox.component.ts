import { Component } from '@angular/core';

@Component({
  selector: 'app-whats-app-inbox',
  templateUrl: './whats-app-inbox.component.html',
  styleUrl: './whats-app-inbox.component.scss'
})
export class WhatsAppInboxComponent {

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
    },
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
    },{
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
    },{
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
    },
    
  ];

  selectedLead: any = null;

  newMessage: string = '';

  // 🔥 IMPORTANT: dynamic messages getter
  get messages() {
    return this.selectedLead?.messages || [];
  }

  selectLead(lead: any) {
    this.selectedLead = lead;

    // optional: auto scroll
    setTimeout(() => {
      const el = document.querySelector('.chat-body');
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  sendMessage() {
    if (!this.newMessage || !this.selectedLead) return;

    const msg = {
      text: this.newMessage,
      direction: 'OUTGOING',
      time: this.getCurrentTime()
    };

    // 🔥 push into selected lead
    this.selectedLead.messages.push(msg);

    // 🔥 update last message in sidebar
    this.selectedLead.lastMessage = this.newMessage;

    this.newMessage = '';

    // auto scroll
    setTimeout(() => {
      const el = document.querySelector('.chat-body');
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  // 🔥 helper function
  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}