import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { CLPUser, SFAResponse } from '../../../../models/clpuser.model';
import { GenericRequest } from '../../../../models/genericRequest.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { keyValue } from '../../../../models/search.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
    selector: 'import-sfa',
    templateUrl: './import-sfa.component.html',
    styleUrls: ['./import-sfa.component.css']
})
/** import-sfa component*/
export class ImportSfaComponent {
  @Input() encryptedUser: string;
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  companyID: number;
  companyName: string;
  userList: keyValue[];
  SfaUserList: keyValue[];
  fname: string;
  showSpinner: boolean = false;
  importSfaForm = new FormGroup({});
    /** import-sfa ctor */
  constructor(public _localService: LocalService, private _notifyService: NotificationService, private _utilityService: UtilityService, private _accountSetupService: AccountSetupService,  private fb: FormBuilder) {

  }

  ngOnInit(): void {
     this._localService.changedCompanyId.subscribe(id => {
       if (id !== this.companyID) {
         this.importSfaForm.reset();
         this.companyID = id;
         this.fname = "user";
        this.importSfaForm = this.prepareImportSfaForm();
        this._localService.getCompanyName().subscribe(name => {
          this.companyName = name;
        });
       }
     });
    this.getUserList(this.fname);
  
  }

  companyIdEvent(e) {
    if (this.importSfaForm.get('clpCompanyID').value == 1){
      this.SfaUserList = null;
    } else
      return;
  }
  async getUserList(fname) {
    this.showSpinner = true;
    await this._accountSetupService.loadUsers(this.encryptedUser, this.companyID)
      .then(async (result: SFAResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          if (this.fname == 'user')
            this.userList = response.filterUser;
          else if (this.fname == 'sfaUser') {
            if (!isNullOrUndefined(response.filterUser)) {
              this.SfaUserList = response.filterUser;
            } else {
              this._notifyService.showError('This company Id has no users', "", 3000);
              this.SfaUserList = null
              this.importSfaForm.controls['clpCompanyID'].setValue(null);
            }
          } else {
            this.SfaUserList = response.filterUser;
            this.importSfaForm.controls['clpCompanyID'].setValue(116);
          }
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
  }

  searchUser(str, e) {
    if (str == 'sfaUser') {
      this.companyID = this.importSfaForm.get('clpCompanyID').value;
      this.fname = "sfaUser"
      this.getUserList(this.fname);
    } else {
      this.companyID = e;
      this.fname = "default"
      this.getUserList(this.fname);
    }
   

  }

  prepareImportSfaForm() {
    return this.fb.group({
      newClpUserID : [],
      clpCompanyID : [''],
      fromUserID : [],
      stitch: [''],
      sfa: [false],
      webform: [false],
      html: [false],
    });
  }

  cancel() {
    this.importSfaForm = this.prepareImportSfaForm();
  }

  onConfirmOperation() {
    this.showSpinner = true;
    this._accountSetupService.update_ImportSfa(this.importSfaForm.controls.newClpUserID.value, this.importSfaForm.controls.clpCompanyID.value, this.importSfaForm.controls.fromUserID.value, true, this.importSfaForm.controls.sfa.value, this.importSfaForm.controls.webform.value, this.importSfaForm.controls.html.value)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this._notifyService.showSuccess(response.messageString ? response.messageString : "Import SFA updated Successfully.", "", 3000);
          this.showSpinner = false;
          this.importSfaForm = this.prepareImportSfaForm();
        }
        else {
          this.showSpinner = false;
          this.importSfaForm = this.prepareImportSfaForm();
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
        this.showSpinner = false;
      });

  }
}
