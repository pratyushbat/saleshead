import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Folder, FolderListResponse } from '../models/folder.model';
import { SimpleResponse } from '../models/genericResponse.model';
import { ImageDocument, SOImageDocument } from '../models/imageDocument.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable({
  providedIn: 'root'
})
export class ImageBankService {
  private baseUrl: string;
  private api: string = "api/ImageBank";
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getImageBankFolderList(encryptedUser: string, clpCompanyId: number, cLPUserId: number, blnIncludeShared: boolean): Promise<Folder[] | void> {
    const a = await this.httpClient
      .post<Folder[]>(`${this.baseUrl}/Folders_GetList/${clpCompanyId}/${cLPUserId}/${blnIncludeShared}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "clpCompanyId - " + clpCompanyId, "ImageBankService", "getImageBankFolderList"); });
    return a;
  }

  async deleteImageBankFolder(encryptedUser: string, folderID: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/Folder_Delete/${folderID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "folderID - " + folderID, "ImageBankService", "deleteImageBankFolder"); });
    return a;
  }

  async updateImageBankFolder(encryptedUser: string, folder : Folder): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Folder_Update`, folder, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "ImageBankService", "getImageBankFolderList"); });
    return a;
  }

  async getDocumentList(encryptedUser: string, folderID : number): Promise<ImageDocument[] | void> {
    const a = await this.httpClient
      .post<ImageDocument[]>(`${this.baseUrl}/Documents_GetListByFolderID/${folderID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "folderID - " + folderID, "ImageBankService", "getDocumentList"); });
    return a;
  }

  async updateDocumentList(encryptedUser: string, soImageDocument: SOImageDocument): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Document_Update`, soImageDocument, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "soImageDocument - " + soImageDocument, "ImageBankService", "updateDocumentList"); });
    return a;
  }

  async deleteDocument(encryptedUser: string, documentID: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/Document_Delete/${documentID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "documentID  - " + documentID, "ImageBankService", "deleteDocument"); });
    return a;
  }

  async updateDocumentOrder(encryptedUser: string, soImageDocument: SOImageDocument[]): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .post<SimpleResponse>(`${this.baseUrl}/Document_UpdateOrder`, soImageDocument, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "soImageDocument - " + soImageDocument, "ImageBankService", "updateDocumentOrder"); });
    return a;
  }
}
