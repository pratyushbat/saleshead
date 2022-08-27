import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { SimpleResponse } from '../models/genericResponse.model';
import { AuthenticateService } from '../services/authenticate.service';
import { UtilityService } from '../services/shared/utility.service';

declare var $: any;

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent implements OnInit {
  simpleResponse: SimpleResponse;
  r: string;
  returnURL: string;

  constructor(private _authenticateService: AuthenticateService, private _utilityService: UtilityService, private _router: Router,
    private _route: ActivatedRoute) { }

  ngOnInit(): void {
    this._route.queryParamMap.subscribe(params => {
      if (params.has('r') && params.has('ReturnUrl')) {
        this.r = params.get("r");
        this.returnURL = params.get("ReturnUrl");
        this.app_redirect();
      }
      else
        this._router.navigate(['/login']);
    });

  }

  async app_redirect() {
    await this._authenticateService.app_Redirect(this.r).then(
      (response: SimpleResponse) => {
        if (response) {
          this.simpleResponse = UtilityService.clone(response);
          if (!isNullOrUndefined(this.simpleResponse) && this.simpleResponse.messageBool) {
            $(location).attr('href', response.messageString + "&ReturnUrl=" + encodeURIComponent(this.returnURL));
          }
          else
            this._router.navigate(['/login']);
        }
        else
          this._utilityService.handleErrorEmail('[ENV] AuthenticateComponent.app_redirect - no connection');

      },
      (error) => {
        this._utilityService.handleErrors(error, null, "r= " + this.r, this.r, "AuthenticateService", "app_Redirect");
      }
    );
  }

}
