import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';
import { TaskListResponse, Task, TaskResponse, TaskDocListResponse } from '../models/task.model';
import { SimpleResponse } from '../models/genericResponse.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private baseUrl: string;
  private api: string = "api/Task";

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async taskGetList(encryptedUser: string, ecat: number, cLPUserID: number, clpCompanyId: number, strStart: string, strEnd: string, ownerId: number, taskStatus): Promise<TaskListResponse | void> {
    const a = await this.httpClient
      .get<TaskListResponse>(`${this.baseUrl}/Task_GetList/${ecat}/${cLPUserID}/${clpCompanyId}/${strStart}/${strEnd}/${ownerId}/${taskStatus}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "TaskService", "getTaskList"); });
    return a;
  }

  async taskUpdate(encryptedUser: string, task: Task, userId: number): Promise<TaskResponse | void> {
    const a = await this.httpClient.post<TaskResponse>(`${this.baseUrl}/Task_Update/${userId}`, task, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + encryptedUser
      })
    }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "TaskService", "taskUpdate"); });
    return a;
  }

  async taskDelete(encryptedUser: string, taskID: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/Task_Delete/${taskID}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "TaskService", "taskDelete"); });
    return a;
  }

  async getTaskDocuments(encryptedUser: string, taskID: number, ownerId: number, userId: number, clpCompanyId: number): Promise<TaskDocListResponse | void> {
    const a = await this.httpClient
      .get<TaskDocListResponse>(`${this.baseUrl}/TaskDoc_LoadDocuments/${taskID}/${ownerId}/${userId}/${clpCompanyId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "TaskService", "getTaskDocuments"); });
    return a;
  }

  async taskDocDelete(encryptedUser: string, docId: number): Promise<SimpleResponse | void> {
    const a = await this.httpClient
      .get<SimpleResponse>(`${this.baseUrl}/TaskDoc_Delete/${docId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "", "TaskService", "taskDocDelete"); });
    return a;
  }

}
