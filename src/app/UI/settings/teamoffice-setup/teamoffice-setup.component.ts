import { HttpErrorResponse } from '@angular/common/http';
import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, OfficeCodeResponseIEnumerable, OfficeCodes, TeamCode, TeamCodeResponseIEnumerable, TeamCodes, TeamOfficeSetting, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { NotificationService } from '../../../services/notification.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { TeamOfficeSetupService } from '../../../services/teamoffice.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { OfficeSetupService } from '../../../services/officeCode.service';
import { PageChangeEvent } from '@progress/kendo-angular-pager';

@Component({
  selector: 'teamoffice-setup',
  templateUrl: './teamoffice-setup.component.html',
  styleUrls: ['./teamoffice-setup.component.css']
})
export class TeamofficeSetupComponent implements OnInit, AfterContentChecked {

  showSpinner: boolean = false;
  private encryptedUser: string = '';
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;

  teamOfficeForm: FormGroup;
  teamCodes: TeamCodes[];
  reloadTeamCodes: boolean = true;
  reloadOfficeCodes: boolean = true;
  originalTeamCodes: any;
  isExpandedTeam: boolean = false;
  teamCodeEdit: number = 0;
  skipSize: number;
  skipOfficeSize: number;
  originalteamOfficeFormcontrols: any;
  teamCodeData: string = "New Item 1 \nNew Item 2 \nNew Item 3";
  showTeam: boolean = false;
  teamItemIndexDelete: any;
  teamCodeDisplay: any;
  sortTeamMode: boolean = false;
  sortOfficeMode: boolean = false;

  teamOfficeSetupForm(): FormGroup {
    return new FormGroup({
      teamConfigs: this.fb.array([this.fb.group({
        order: ['', Validators.required],
        display: ['', Validators.required],
        code: ''
      })
      ]
      ),
    });
  }
  officeForm: FormGroup;
  officeCodes: OfficeCodes[];
  originalOfficeCodes: any;
  isExpandedOffice: boolean = false;
  officeCodeEdit: number = 0;
  originalOfficeFormcontrols: any;
  officeCodeData: string = "New Item 1 \nNew Item 2 \nNew Item 3";
  showOffice: boolean = false;
  officeItemIndexDelete: any;
  officeCodeDisplay: any;
  officeSetupForm(): FormGroup {
    return new FormGroup({
      officeConfigs: this.fb.array([this.fb.group({
        sOrder: ['', Validators.required],
        display: ['', Validators.required],
        officeCode: ''
      })
      ]
      ),
    });
  }
  editRowIndexTeam: number = -1;
  editRowIndexOffice: number = -1;
  pageSize: number = 10;
  pageSizeOffice: number = 10;
  constructor(private cdRef: ChangeDetectorRef, private fb: FormBuilder, private _teamofficeSrvc: TeamOfficeSetupService, private _officeSrvc: OfficeSetupService, public _localService: LocalService, private _router: Router, private _utilityService: UtilityService, private _notifyService: NotificationService) {
    this._localService.isMenu = true;
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.teamOfficeForm = this.teamOfficeSetupForm();
    this.officeForm = this.officeSetupForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getTeamOfficeSetting();

        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);

  }

  async getTeamOfficeSetting() {
    this.showSpinner = true;
    await this._teamofficeSrvc.teamOfficeSetting_Get(this.encryptedUser, this.user.cLPCompanyID)
      .then((result: TeamOfficeSetting) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.showTeam = response.showTeamDD;
          this.showOffice = response.showOfficeDD;
          if (this.showTeam)
            this.getTeamOfficeData();
          if (this.showOffice)
            this.getOfficeData();
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }

  updateTeamCheck() {
    this.showSpinner = true;
    var originalTeam = this.showTeam;
    this.showTeam = !this.showTeam;
    this._teamofficeSrvc.teamOfficeSetting_Update(this.encryptedUser, this.user.cLPCompanyID, 2, this.showTeam)
      .then((result: TeamOfficeSetting) => {
        if (result) {
          this.showSpinner = false;
          this.getTeamOfficeSetting();
        }
        else {
          this.showSpinner = false;
          this.showTeam = originalTeam;
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this.showTeam = originalTeam;
      });
  }

  updateOfficeCheck() {
    this.showSpinner = true;
    var originalOffice = this.showOffice;
    this.showOffice = !this.showOffice;
    this._teamofficeSrvc.teamOfficeSetting_Update(this.encryptedUser, this.user.cLPCompanyID, 1, this.showOffice)
      .then((result: TeamOfficeSetting) => {
        if (result) {
          this.showSpinner = false;
          this.getTeamOfficeSetting();
        }
        else {
          this.showOffice = originalOffice;
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showOffice = originalOffice;
      });
  }

  async getTeamOfficeData() {
    await this._teamofficeSrvc.teamCode_GetList(this.encryptedUser, this.user.cLPCompanyID)
      .then((result: TeamCodeResponseIEnumerable) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.teamFormCtls.controls = [];
          this.teamCodes = response.teamCodes;
          this.teamFormCtls.removeAt(0);
          this.reloadTeam();
          this.teamCodes.forEach((element, index) => {
            this.teamFormCtls.push(
              this.fb.group({
                order: element.sOrder,
                display: element.display,
                code: element.teamCode
              })
            );
          });
          this.skipSize = 0;
          this.originalTeamCodes = this.teamFormCtls.controls.slice();
          this.teamFormCtls.controls = this.originalTeamCodes.slice(
            0,
            0 + this.pageSize
          );
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
      });
  }

  dropTeam(event: CdkDragDrop<string[]>) {
    if (this.teamFormCtls.controls.length > 1) {
      this.sortTeamMode = true;
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }
    }
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.TeamOfficeSetup)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            if (!isNullOrUndefined(this.userResponse?.user)) {
              this.user = this.userResponse.user;
              this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
              if (this.user?.userRole <= eUserRole.Administrator) {
                if (this.roleFeaturePermissions?.view == false)
                  this._router.navigate(['/unauthorized'], { state: { isMenu: true } });
              }
              this.showSpinner = false;
            }
          }
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  get teamFormCtls() {
    return this.teamOfficeForm.get('teamConfigs') as FormArray;
  }

  sortAlphaTeamCode() {
    this.sortTeamMode = true;
    this.teamFormCtls.controls.sort((a, b) => a.value.display.localeCompare(b.value.display));
    this.teamCodeEdit = 1;
  }

  editTeamCodes() {
    this.editRowIndexTeam = -1;
    this.teamCodeEdit = 1;
  }
  reloadTeam() {
    this.reloadTeamCodes = false;
    setTimeout(() => {
      this.reloadTeamCodes = true;
    }, 0);
  }
  cancelTeamCode() {
    this.originalTeamControls();
    this.teamCodeEdit = 0;
    this.reloadTeam();
    this.editRowIndexTeam = -1;
    this.sortTeamMode = false;
  }
  originalTeamControls() {
    this.teamFormCtls.controls = [];
    this.teamCodes.forEach((element, index) => {
      this.teamFormCtls.push(
        this.fb.group({
          order: element.sOrder,
          display: element.display,
          code: element.teamCode
        })
      );
    });
    this.skipSize = 0;
    this.originalTeamCodes = this.teamFormCtls.controls.slice();
    this.teamFormCtls.controls = this.originalTeamCodes.slice(
      0,
      0 + this.pageSize
    );
  }

  addTeamItems() {
    this.teamCodeEdit = 2;
  }

  teamItemtoDelete(index) {
    this.teamItemIndexDelete = index;
    this.teamCodeDisplay = this.teamFormCtls.controls[index].value.display;
  }

  async deleteTeamItems() {
    var index = this.teamItemIndexDelete;
    this.showSpinner = true;
    var teamCodeDelete = this.teamFormCtls.controls[index].value.code;
    await this._teamofficeSrvc.teamCode_Delete(this.encryptedUser, teamCodeDelete)
      .then((result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.teamFormCtls.controls.splice(index, 1);
          this.originalteamOfficeFormcontrols = this.teamFormCtls.controls.slice();
          this.showSpinner = false;
          this._notifyService.showSuccess("Team Code deleted successfully", "", 3000);
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log('Error in deleting team code' + err);
      });

  }

  async saveTeamItems() {
    this.showSpinner = true;
    this.teamCodes = [];
    this.teamFormCtls.controls.forEach((row, index) => {
      var teamCode = <TeamCodes>{
        teamCode: row.value.code,
        display: row.value.display,
        sOrder: index + 1,
        cLPCompanyID: this.user.cLPCompanyID
      }
      this.teamCodes.push(teamCode);
    });
    await this._teamofficeSrvc.teamCode_List_Save(this.encryptedUser, this.teamCodes)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.teamCodeEdit = 0;
          this.sortTeamMode = false;
          await this.getTeamOfficeData();
          this.showSpinner = false;
          this.teamCodeData = "New Item 1 \nNew Item 2 \nNew Item 3";
          this._notifyService.showSuccess("Team Code saved successfully", "", 3000);
          this.editRowIndexTeam = -1;
        }
        else {
          this.sortTeamMode = false;
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        this.sortTeamMode = false;
        console.log('error in saving team code' + err);
      });

  }

  async saveBulkTeams() {
    this.showSpinner = true;
    let teamCodeDataArray = this.teamCodeData.split('\n');
    teamCodeDataArray = teamCodeDataArray.filter(item => item.trim().length > 0);
    teamCodeDataArray.forEach((value, index) => {
      let lastindex = this.teamFormCtls.length;
      this.teamFormCtls.push(
        this.fb.group({
          order: lastindex,
          display: value,
          code: 0
        })
      )
    });
    await this.saveTeamItems();
    this.showSpinner = false;

  }

  identifyTeam(index, item) {
    return item.value.code;
  }
  /*office*/
  dropOffice(event: CdkDragDrop<string[]>) {
    if (this.officeFormCtls.controls.length > 1) {
      this.sortOfficeMode = true;
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }
    }
  }


  async getOfficeData() {
    this.showSpinner = true;
    await this._officeSrvc.OfficeCode_GetList(this.encryptedUser, this.user.cLPCompanyID)
      .then((result: OfficeCodeResponseIEnumerable) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.officeFormCtls.controls = [];
          this.officeCodes = response.officeCodes;
          this.reloadOffice();
          this.officeFormCtls.removeAt(0);
          this.officeCodes.forEach((element, index) => {
            this.officeFormCtls.push(
              this.fb.group({
                sOrder: element.sOrder,
                display: element.display,
                officeCode: element.officeCode
              })
            )
          });
          this.skipOfficeSize = 0;
          this.originalOfficeCodes = this.officeFormCtls.controls.slice();
          this.showSpinner = false;
          this.officeFormCtls.controls = this.originalOfficeCodes.slice(
            0,
            0 + this.pageSizeOffice
          );
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
      });
  }


  get officeFormCtls() {
    return this.officeForm.get('officeConfigs') as FormArray;
  }

  sortAlphaOfficeCode() {
    this.sortOfficeMode = true;
    this.officeFormCtls.controls.sort((a, b) => a.value.display.localeCompare(b.value.display));
    this.officeCodeEdit = 1;
  }

  editOfficeCodes() {
    this.officeCodeEdit = 1;
    this.editRowIndexOffice = -1;
  }
  reloadOffice() {
    this.reloadOfficeCodes = false;
    setTimeout(() => {
      this.reloadOfficeCodes = true;
    }, 0);
  }

  cancelOfficeCode() {
    this.originalOfficeControls();
    this.reloadOffice();
    this.officeCodeEdit = 0;
    this.sortOfficeMode = false;
    this.editRowIndexOffice = -1;
  }

  originalOfficeControls() {
    this.officeFormCtls.controls = [];
    this.officeCodes.forEach((element, index) => {
      this.officeFormCtls.push(
        this.fb.group({
          sOrder: element.sOrder,
          display: element.display,
          officeCode: element.officeCode
        })
      )
    });
    this.skipOfficeSize = 0;
    this.originalOfficeCodes = this.officeFormCtls.controls.slice();
    this.officeFormCtls.controls = this.originalOfficeCodes.slice(
      0,
      0 + this.pageSizeOffice
    );
  }

  addOfficeItems() {
    this.officeCodeEdit = 2;
  }

  officeItemtoDelete(index) {
    this.officeItemIndexDelete = index;
    this.officeCodeDisplay = this.officeFormCtls.controls[index].value.display;
  }

  async deleteOfficeItems() {
    var index = this.officeItemIndexDelete;
    this.showSpinner = true;
    var officeCodeDelete = this.officeFormCtls.controls[index].value.officeCode;
    await this._officeSrvc.OfficeCode_Delete(this.encryptedUser, officeCodeDelete)
      .then((result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.officeFormCtls.controls.splice(index, 1);
          this.originalOfficeFormcontrols = this.officeFormCtls.controls.slice();
          this.showSpinner = false;
          this._notifyService.showSuccess("Office Code deleted successfully", "", 3000);
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log('error in delete office code' + err);
      });

  }

  async saveOfficeItems() {
    this.showSpinner = true;
    this.officeCodes = [];
    this.officeFormCtls.controls.forEach((row, index) => {
      var officeCode = <OfficeCodes>{
        officeCode: row.value.officeCode,
        display: row.value.display,
        sOrder: index + 1,
        cLPCompanyID: this.user.cLPCompanyID
      }
      this.officeCodes.push(officeCode);
    });

    await this._officeSrvc.OfficeCode_List_Save(this.encryptedUser, this.officeCodes)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.officeCodeEdit = 0;
          this.sortOfficeMode = false;
          await this.getOfficeData();
          this.showSpinner = false;
          this.officeCodeData = "New Item 1 \nNew Item 2 \nNew Item 3";
          this._notifyService.showSuccess("Office Code saved successfully", "", 3000);
          this.editRowIndexOffice = -1;
        }
        else {
          this.showSpinner = false;
          this.sortOfficeMode = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        this.sortOfficeMode = false;
        console.log('error in saving office code' + err);
      });

  }

  async saveBulkOffices() {
    this.showSpinner = true;
    let officeCodeDataArray = this.officeCodeData.split('\n');
    officeCodeDataArray = officeCodeDataArray.filter(item => item.trim().length > 0);

    officeCodeDataArray.forEach((value, index) => {
      let lastindex = this.officeFormCtls.length;
      this.officeFormCtls.push(
        this.fb.group({
          sOrder: lastindex,
          display: value,
          officeCode: 0
        })
      )
    });

    await this.saveOfficeItems();
    this.showSpinner = false;
  }

  public routeUser() {
    this._router.navigate(["/user-setup"]);
  }


  identifyOffice(index, item) {
    return item.value.officeCode;
  }

  scrollToNewTeam() {
    setTimeout(function () {
      var elem = document.getElementById("scrollId");
      elem?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }, 0);
  }

  scrollToNewOffice() {
    setTimeout(function () {
      var elem = document.getElementById("scrollIdOffice");
      elem?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }, 0);
  }

  emitPaginationOffice(pagedDataOffice) {
    this.officeFormCtls.controls = [];
    this.officeFormCtls.controls = pagedDataOffice.dataOffice
    this.pageSizeOffice = pagedDataOffice.sizeOffice;
    this.skipOfficeSize = pagedDataOffice.skipOfficeSize;
  }

  emitPagination(pagedData) {
    this.teamFormCtls.controls = [];
    this.teamFormCtls.controls = pagedData.data;
    this.skipSize = pagedData.skipSize;
    this.pageSize = pagedData.size

  }

  teamItemtoEdit(index) {
    this.editRowIndexTeam = index;
    this.teamCodeEdit = 1;
  }

  officeItemtoEdit(index) {
    this.editRowIndexOffice = index;
    this.officeCodeEdit = 1;
  }

}
