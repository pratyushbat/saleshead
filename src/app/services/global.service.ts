import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { utils } from 'protractor';
import { isNull, isNullOrUndefined } from 'util';
import { ConfigDetails } from '../models/appConfig.model';
import { CLPUser } from '../models/clpuser.model';
import { AppconfigService } from './shared/appconfig.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  user: CLPUser;
  private expiration: number = 86400 * 3; //Default to 3 days
  mySoHome: string = "";
/*mobile login*/
  private logging: boolean;
  detailed_log: boolean = true;
  /*mobile login*/
  constructor(private _appConfigService: AppconfigService,) { }

  public setExpiration(days: number) {
    this.expiration = 86400 * days;
  }

  public setValidDevice() {
    window.localStorage.setItem('sc_device_stmp', Date.now().toString());
    window.localStorage.setItem(this.user.cLPUserID.toString(), this.user.currentDeviceId);
  }

  public getValidDevice(): string {
    let deviceWithoutKey = window.localStorage.getItem('sc_device');
    if (!isNullOrUndefined(deviceWithoutKey)) {
      window.localStorage.setItem(this.user.cLPUserID.toString(), deviceWithoutKey);
      window.localStorage.removeItem("sc_device");
    }
    return window.localStorage.getItem(this.user.cLPUserID.toString());
  }

  public removeDevice() {
    window.localStorage.removeItem(this.user.cLPUserID.toString());
  }

  public loadAppConfig(encryptedUser) {
    this._appConfigService.getAppConfigValue(encryptedUser, "MySO_Home")
      .then(async (result: ConfigDetails) => {
        this.mySoHome = result.configValue;
      })
  }

  /*mobile login*/
  public getLoginPref() {
    return window.localStorage.getItem('sc_loginpref');
  }

  public setLoginPref(loginType) {
    window.localStorage.setItem('sc_loginpref', loginType);
  }

  log(source: string, message: string) {
    if (this.logging) {
      if (this.detailed_log == true) {
        console.log('[' + moment(new Date()).format("YYYY-MM-DD HH:mm:ss SSS") + '] ' + source + ': ' + message);
        //this.logs.push(source + ': ' + message);
      }
    }
  }
  /*mobile login*/
}
