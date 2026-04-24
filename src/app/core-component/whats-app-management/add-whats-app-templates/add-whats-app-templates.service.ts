import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddWhatsAppTemplatesService {

   constructor(private http: HttpClient) {}

  createTemplate(payload: any) {
    return this.http.post(
      'http://localhost:8080/check2.0/addTemplates',
      payload
    );
  }
}

