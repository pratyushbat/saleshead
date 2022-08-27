import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';

import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { eFeatures } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';

import { ContactService } from '../../../services/contact.service';
import { NotificationService } from '../../../services/notification.service';
import { ContactSearchService } from '../../../services/shared/contact-search.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';

@Component({
    selector: 'app-contact-create',
    templateUrl: './contact-create.component.html',
    styleUrls: ['./contact-create.component.css']
})
/** contact-create component*/
export class ContactCreateComponent {
  /** contact-create ctor */
  contactForm = new FormGroup({});
  private encryptedUser: string = '';

  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;

  constructor(private fb: FormBuilder,
    public _contactService: ContactService,
    private _utilityService: UtilityService,
    public _localService: LocalService,
    public _contactSearchService: ContactSearchService,
    public notifyService: NotificationService,
    private _route: ActivatedRoute,
    private _router: Router) {
    this._localService.isMenu = true;
  }

  ngOnInit() {

    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
        
        }
        else
          this._router.navigate(['/unauthorized']);
      })
    }
    else
      this._router.navigate(['/unauthorized']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.ContactCreate)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            this.user = this.userResponse.user;
            if (this.user?.userRole <= 3) {
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              if (this.roleFeaturePermissions?.view == false)
                this._router.navigate(['/unauthorized', true]);
            }

          }
          else
            this._router.navigate(['/unauthorized']);
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  contactFormSubmit() {

  }

}
