import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { EmailDetails, EmailResponse } from '../models/email.model';
import { delayedRetryHttp } from './shared/delayedRetry';


@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private baseUrl: string;
  private api: string = "api/Email";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string) {
    this.baseUrl = _baseUrl + this.api;
  }

  private handleErrors(errorResponse: HttpErrorResponse) {
    if (errorResponse.error instanceof ErrorEvent) {
      console.error('Email Service Client Side Error: ', errorResponse.error.message);
    } else {
      throw errorResponse;
    }
  }

  async sndEmailAsync(emailDetails: EmailDetails): Promise<EmailResponse | void> {
    const a = await this.httpClient.post<EmailResponse>(`${this.baseUrl}/SendEmail/}`, emailDetails, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this.handleErrors });
    return a;
  }
}
