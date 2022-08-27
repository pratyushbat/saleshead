import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MenuResponse } from '../models/menu.model';
import { delayedRetryHttp } from './shared/delayedRetry';
import { UtilityService } from './shared/utility.service';

@Injectable()
export class MenuService {
  private baseUrl: string;
  private api: string = "api/Menu";
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string, private _utilityService: UtilityService) {
    this.baseUrl = _baseUrl + this.api;
  }

  async getMenu(encryptedUser: string, userId: number): Promise<MenuResponse | void> {
    const a = await this.httpClient
      .get<MenuResponse>(`${this.baseUrl}/Menu_Get/${userId}`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + encryptedUser + ":UA"
        })
      }).pipe(delayedRetryHttp()).toPromise().catch(err => { this._utilityService.handleErrors(err, null, "userId - " + userId, "MenuService", "getMenu"); });

    return a;
  }
}
