import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { FeatureAccess } from '../../models/clpuser.model';
import { FeatureAccessService } from '../feature-access.service';
import { UtilityService } from './utility.service';


export class FeatureAccessByRoldIdService implements OnInit {
  private baseUrl: string;
  showSpinner: boolean = false;
  private api: string = "api/eatureAccessByRoldId";
    encryptedUser: string;

  constructor(private httpClient: HttpClient, @Inject('BASE_URL') _baseUrl: string,
    private _utilityService: UtilityService,
    private _router: Router,
    public _featureAccessService: FeatureAccessService,
  ) {
    this.baseUrl = _baseUrl + this.api;
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token")))
      this.encryptedUser = localStorage.getItem("token");
    else
      this._router.navigate(['/unauthorized']);
  }

  getFeatureAccessDetails(roleId, featureId,clpCOmpanyId) {
    this.showSpinner = true;
    return new Observable<FeatureAccess>(observer => {
      this._featureAccessService.getFeatureAccess(this.encryptedUser, roleId, featureId, clpCOmpanyId)
        .then((result: FeatureAccess) => {
          if (result) {
            var response = UtilityService.clone(result);
            observer.next(response);
            this.showSpinner = false;
          }
          else
            this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
          this.showSpinner = false;
        });
    })

  }
}
