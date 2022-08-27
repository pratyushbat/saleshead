import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
//import { DeviceDetectorService } from 'ngx-device-detector/lib/device-detector.service';
import { throwError } from 'rxjs';
import { EmailDetails } from '../../models/email.model';
import { EmailService } from '../email.service';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(private _emailService: EmailService,
    private _router: Router
    //private deviceService: DeviceDetectorService
  ) { }

  // Create a deep copy of object 
  public static clone<T>(a: T): T {
    return JSON.parse(JSON.stringify(a));
  }

  public handleErrorResponse(err: HttpErrorResponse) {
    if (err.status == 401) {
      this._router.navigate(['/unauthorized']);
    } else if (err.status == 403) {
      this._router.navigate(['/access-denied']);
    } else {
      console.error(err);
    }
    console.log(err);
  }
  public getObjectPropertiesInstring(obj: any): string {
    let objectPropertyString = "";
    if (obj == null) {
      return "";
    }
    Object.keys(obj)
      .forEach(key => {
        if (obj.hasOwnProperty(key)) {
          if (Array.isArray(obj[key])) {
            if (obj[key] != null) {
              if (obj[key].length > 0) {
                console.log(obj[key]);
                obj[key].forEach(i => {
                  objectPropertyString = objectPropertyString + this.getObjectPropertiesInstring(i);
                }
                );
              }
              else {
                objectPropertyString = objectPropertyString + key + " - <br>";
              }
            }
          }
          else {
            if (typeof obj[key] == "object") {
              if (obj[key] != null) {
                objectPropertyString = objectPropertyString + this.getObjectPropertiesInstring(obj[key]);
              }
              else {
                objectPropertyString = objectPropertyString + key + " - <br>";
              }
            }
            else {
              objectPropertyString = objectPropertyString + key + " - " + obj[key] + "<br>";
            }
          }
        }
      })
    return objectPropertyString;
  }

  public handleErrors(err: HttpErrorResponse, object: any = null, parameters: string = "", encryptedUser = "", sourceService: string = "", sourceMethodName: string = "") {

    let objectPropertiesInstring: string = "";

    if (object != null) {
      objectPropertiesInstring = this.getObjectPropertiesInstring(object);
      objectPropertiesInstring = objectPropertiesInstring + "<br> Json string" + JSON.stringify(object);
    }
    var stackStrace = err.error ? err.error.StackTraceString : "";
    let msg: string = err.message + "<br>" +
      (err.error && err.error.Message != null ? err.error.Message + "<br><hr>" : "") +
      stackStrace + "<br><hr>" +
      parameters + "<br><hr>" +
      objectPropertiesInstring;

    let email: EmailDetails = {
      subject: "Client - [ENV] - " + sourceService + "." + sourceMethodName,
      message: msg,
      toList: "",
      from: ""
    }
    this._emailService.sndEmailAsync(email);
    return throwError(new HttpErrorResponse({
      error: { error: 'There is a problem with the MYSO Set up service. We are notified & working on it. Please try again later.' },
      headers: err.headers,
      status: err.status,
      statusText: err.statusText,
      url: err.url
    }));
  }

  public handleErrorEmail(subject: string, message?: string) {
    console.error(subject);
    let email: EmailDetails = {
      subject: subject,
      message: message,
      toList: "",
      from: ""
    }
    this._emailService.sndEmailAsync(email);
  }

}
