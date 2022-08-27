import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { catchError } from 'rxjs/operators';
import { promise } from 'protractor';
import { Document } from '../models/document'
import { EmailDropDownsResponse, EmailSnippetResponse } from '../models/emailTemplate.model';
import { DocumentResponse } from '../models/document';
import { Note, NoteResponse } from '../models/note.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { LinkEmailFilterResponse } from '../models/link-group.model';

@Injectable({
  providedIn: 'root'
})
export class OutBoundEmailService {

  private baseUrl: string;
  private api: string = "api/OutBoundEmail";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getEmailDropDowns(encryptedUser: string, cLPCompanyID: number, cLPUserID: number, teamCode: number): Promise<EmailDropDownsResponse | void> {
    const a = await this.httpClient
      .get<EmailDropDownsResponse>(`${this.baseUrl}/EmailDropDowns_Get/${cLPCompanyID}/${cLPUserID}/${teamCode}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "OutBoundEmailService", "getEmailDropDowns"); }); //toPromise();
    return a;
  }

  async getDocumentsListByCLPUser(encryptedUser: string, userId: number): Promise<DocumentResponse | void> {
    const a = await this.httpClient
      .get<DocumentResponse>(`${this.baseUrl}/Documents_GetDocumentByCLPUser/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "OutBoundEmailService", "getDocumentsByCLPUser"); }); //toPromise();
    return a;
  }

  async getDocumentsListByOwner(encryptedUser: string, contactId: number): Promise<DocumentResponse | void> {
    const a = await this.httpClient
      .get<DocumentResponse>(`${this.baseUrl}/Documents_GetListByOwner/${contactId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "OutBoundEmailService", "getDocumentsListByOwner"); }); //toPromise();
    return a;
  }

  async documentsSearch(encryptedUser: string, arrString, userId: number): Promise<DocumentResponse | void> {
    const a = await this.httpClient.post<DocumentResponse>(`${this.baseUrl}/Documents_Search/${userId}`, arrString, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "OutBoundEmailService", "documentsSearch"); });
    return a;
  }

  async loadEmailSnippet(encryptedUser: string, emailSnippetID: number): Promise<EmailSnippetResponse | void> {
    const a = await this.httpClient
      .get<EmailSnippetResponse>(`${this.baseUrl}/EmailSnippet_Load/${emailSnippetID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "OutBoundEmailService", "loadEmailSnippet"); }); //toPromise();
    return a;
  }

  async scheduleEmailOrSend(encryptedUser: string, note): Promise<NoteResponse | void> {
    const a = await this.httpClient.post<NoteResponse>(`${this.baseUrl}/ScheduleEmailOrSend`, note, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "OutBoundEmailService", "scheduleEmailOrSend"); });
    return a;
  }

  async sendOutboundMail(encryptedUser: string, note: Note): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/SendOutboundMail`, note, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "OutBoundEmailService", "SendOutboundMail"); });
    return a;
  }

  async downloadDocumentsByDocId(encryptedUser: string, documentID: number): Promise<Document | void> {
    const a = await this.httpClient
      .get<Document>(`${this.baseUrl}/DocumentsDownLoadByDocId/${documentID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "documentID - " + documentID, "OutBoundEmailService", "downloadDocumentsByDocId"); });
    return a;
  }

  async linkOutBoundEmailLoad(encryptedUser: string, linkId: number, clpCompanyID: number, clpuserID: number): Promise<LinkEmailFilterResponse | void> {
    const a = await this.httpClient
      .get<LinkEmailFilterResponse>(`${this.baseUrl}/LinkOutBoundEmail_Load/${linkId}/${clpCompanyID}/${clpuserID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "linkId - " + linkId, "OutBoundEmailService", "linkOutBoundEmailLoad"); });
    return a;
  }

  async linkOutBoundEmailNext(encryptedUser: string, contactID: number, clpCompanyID: number, clpuserID: number, note: Note): Promise<NoteResponse | void> {
    const a = await this.httpClient
      .post<NoteResponse>(`${this.baseUrl}/LinkOutBoundEmail_Next/${contactID}/${clpCompanyID}/${clpuserID}`, note, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "leadId - " + contactID, "OutBoundEmailService", "linkOutBoundEmailNext"); });
    return a;
  }

  async linkOutBoundEmailSendEmail(encryptedUser: string, nt: Note, linkID: number, clpcompanyID: number, clpuserID: number, selectedEmailTemplateID: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/LinkOutBoundEmail_SendEmail/${linkID}/${clpcompanyID}/${clpuserID}/${selectedEmailTemplateID}`, nt, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "OutBoundEmailService", "linkOutBoundEmailSendEmail"); });
    return a;
  }
}
