import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from './models/clpuser.model';
import { GlobalService } from './services/global.service';
import { LocalService } from './services/shared/local.service';
import { UtilityService } from './services/shared/utility.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'app';
  encryptedUser: string; user: CLPUser; userResponse: UserResponse;
  constructor(public _localService: LocalService,
    private titleService: Title,
    private _router: Router,
    private _utilityService: UtilityService,) { }


  ngOnInit() {
    if (localStorage.getItem('title'))
      this.titleService.setTitle(localStorage.getItem('title'));
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user))
          this._localService.changeTheme(this.user.theme ? +this.user.theme : 1);
      })
    }
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
            }
          }
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }
}
