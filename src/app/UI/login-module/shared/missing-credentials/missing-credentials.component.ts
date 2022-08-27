import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalService } from '../../../../services/shared/local.service';

@Component({
    selector: 'app-missing-credentials',
    templateUrl: './missing-credentials.component.html',
    styleUrls: ['./missing-credentials.component.css']
})
export class MissingCredentialsComponent implements OnInit {

  //private _appConfig: AppConfig;

  /** missing-credentials ctor */
  constructor(private _localService: LocalService, private _route: ActivatedRoute, private _router: Router) {
    this._localService.isMenu = this._router.getCurrentNavigation().extras.state.isMenu;
    //this._route.paramMap.subscribe(async params => {
    //  if (params.has('isMenu')) {
    //    this._localService.isMenu = Boolean(params.get('isMenu'));
    //  }
    //});
  }
  ngOnInit() {
    //this.redirectToMySO();
  }

  onBackClick() {
    //window.location.replace('https://localhost:44320/');
  }

  private async readConfig() {
    //this._appConfig = UtilityService.AppConfig;
  }

  private async redirectToMySO() {
    await this.readConfig();

    // window.location.href = this._appConfig.portalURL;
  }


}
