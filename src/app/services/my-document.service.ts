import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ClpdocDocument, SelectedDocumentId } from '../models/clpDocDocument.model';
import { Document } from '../models/document';
import { SimpleResponse } from '../models/genericResponse.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class MyDocumentService {
  private baseUrl: string;
  private api: string = "api/Document";
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getMyDocumentsList(encryptedUser: string, clpCompanyId: number, cLPUserId: number, documentID: number): Promise<ClpdocDocument[] | void> {
    const a = await this.httpClient
      .post<ClpdocDocument[]>(`${this.baseUrl}/Clpdoc_Document_GetList?documentID=${documentID}&clpCompanyID=${clpCompanyId}&clpUserID=${cLPUserId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "MyDocumentService", "getMyDocumentsList"); });
    return a;
  }

  async deleteDocuments(encryptedUser: string, lstSelectedDocumentId: SelectedDocumentId[]): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Clpdoc_Document_Bulk_Delete`, lstSelectedDocumentId, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        }) 
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "lstSelectedDocumentId - " + lstSelectedDocumentId, "MyDocumentService", "deleteDocuments"); });
    return a;
  }

  async shareDocuments(encryptedUser: string, lstSelectedDocumentId: SelectedDocumentId[]): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Clpdoc_Document_Bulk_Share`, lstSelectedDocumentId, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        }) 
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "lstSelectedDocumentId - " + lstSelectedDocumentId, "MyDocumentService", "shareDocuments"); });
    return a;
  }

  async unShareDocuments(encryptedUser: string, lstSelectedDocumentId: SelectedDocumentId[]): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Clpdoc_Document_Bulk_UnShare`, lstSelectedDocumentId, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "lstSelectedDocumentId - " + lstSelectedDocumentId, "MyDocumentService", "unShareDocuments"); });
    return a;
  }

  async downloadDocuments(encryptedUser: string, documentID: number): Promise<Document[] | void> {
    const a = await this.httpClient
      .get<Document[]>(`${this.baseUrl}/DocumentsDownLoad/${documentID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "documentID - " + documentID, "MyDocumentService", "downloadDocuments"); });
    return a;
  }
}
