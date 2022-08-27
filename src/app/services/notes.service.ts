import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { Note, NoteFilterResponse, NoteListResponse } from '../models/note.model';
import { SimpleResponse } from '../models/genericResponse.model';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private baseUrl: string;
  private api: string = "api/Notes";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getNoteFilters(encryptedUser: string, cLPUserID: number, clpCompanyId: number): Promise<NoteFilterResponse | void> {
    const a = await this.httpClient
      .get<NoteFilterResponse>(`${this.baseUrl}/Note_Get_Filters/${cLPUserID}/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "NotesService", "getNoteFilters"); });
    return a;
  }

  async noteCreate(encryptedUser: string, note: Note): Promise<SimpleResponse | void> {
    const a = await this.httpClient.post<SimpleResponse>(`${this.baseUrl}/Note_Create`, note, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "NotesService", "noteCreate"); });
    return a;
  }

  async noteGetListByOwner(encryptedUser: string, clpCompanyID: number, ownerID: number, ownerType: number, isRecent: boolean): Promise<NoteListResponse | void> {
    const a = await this.httpClient
      .get<NoteListResponse>(`${this.baseUrl}/Note_GetListByOwner/${clpCompanyID}/${ownerID}/${ownerType}/${isRecent}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "NotesService", "noteGetListByOwner"); });
    return a;
  }
}
