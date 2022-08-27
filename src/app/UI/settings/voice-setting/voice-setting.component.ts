import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageChangeEvent } from '@progress/kendo-angular-pager';
import { isNullOrUndefined } from 'util';
import { CLPUser, OfficeCodeResponseIEnumerable, OfficeCodes, TeamCodeResponseIEnumerable, TeamCodes, TeamOfficeSetting, UserResponse, VoiceRecordingResponseIEnumerable, VoiceRecordingType } from '../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { NotificationService } from '../../../services/notification.service';
import { OfficeSetupService } from '../../../services/officeCode.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { TeamOfficeSetupService } from '../../../services/teamoffice.service';
import { VoiceSettingService } from '../../../services/voice-setting.service';

@Component({
  selector: 'voice-settings',
  templateUrl: './voice-setting.component.html',
  styleUrls: ['./voice-setting.component.css']
})
export class VoiceSettingComponent implements OnInit, AfterContentChecked {

  showSpinner: boolean = false;
  private encryptedUser: string = '';
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  voiceSettingsForm: FormGroup;
  voiceSettings: VoiceRecordingType[];
  originalVoiceSettings: VoiceRecordingType[];
  initVoiceSettingsFormCtrls: any;

  editRowIndex: number = -1;
  voiceEdit: number = 0;
  voiceSort: number = 0;
  voiceData: string = "New Item 1 \nNew Item 2 \nNew Item 3";
  voiceItemIndexDelete: any;
  voiceItemDisplay: any;
  sortTeamMode: boolean = false;
  pageSize: number = 10;
  skipSize: number;
  isSorted: boolean = false;

  voiceSettingFormSetup(): FormGroup {
    return new FormGroup({
      teamConfigs: this.fb.array([this.fb.group({
        sOrder: ['', Validators.required],
        display: ['', Validators.required],
        voiceRecordingTypeID: '',
        script: ''
      })
      ]
      ),
    });
  }

  constructor(private cdRef: ChangeDetectorRef, private fb: FormBuilder, private _teamofficeSrvc: TeamOfficeSetupService, private _voiceSrvc: VoiceSettingService, private _officeSrvc: OfficeSetupService, public _localService: LocalService, private _router: Router, private _utilityService: UtilityService, private _notifyService: NotificationService) {
    this._localService.isMenu = true;
  }

  ngAfterContentChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.voiceSettingsForm = this.voiceSettingFormSetup();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getVoicesData();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);

  }


  async getVoicesData() {
    await this._voiceSrvc.voiceRecording_GetList(this.encryptedUser, this.user.cLPCompanyID)
      .then((result: VoiceRecordingResponseIEnumerable) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.voiceFormCtls.controls = [];
          this.voiceSettings = response.voiceRecordings;
          this.originalVoiceSettings = this.voiceSettings.map(x => Object.assign({}, x));
          this.voiceFormCtls.removeAt(0);
          this.voiceSettings.forEach((element, index) => {
            this.voiceFormCtls.push(
              this.fb.group({
                sOrder: element.sOrder,
                display: element.display,
                voiceRecordingTypeID: element.voiceRecordingTypeID,
                script: element.script
              })
            );
          });
          this.skipSize = 0;
          this.initVoiceSettingsFormCtrls = this.voiceFormCtls.controls.slice();
          this.voiceFormCtls.controls = this.initVoiceSettingsFormCtrls.slice(
            0,
            0 + this.pageSize
          );

        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
      });
  }

  dropVoice(event: CdkDragDrop<string[]>) {
    if (this.voiceFormCtls.controls.length > 1) {
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
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.VoiceSettings)
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

  get voiceFormCtls() {
    return this.voiceSettingsForm.get('teamConfigs') as FormArray;
  }

  sortAlphaVoices() {
    this.isSorted = true;
    this.voiceFormCtls.controls.sort((a, b) => a.value.display.localeCompare(b.value.display));
    this.voiceEdit = 1;
    this.voiceSort = 1;
  }

  editVoices() {
    this.editRowIndex = -1;
    this.voiceEdit = 1;
    this.voiceSort = 0;
  }

  cancelVoiceSelect() {
    this.isSorted = false;
    this.editRowIndex = -1;
    this.originalVoice();
    this.voiceEdit = 0;
    this.voiceSort = 0;
    this.sortTeamMode = false;
  }

  originalVoice() {
    this.voiceSettings = this.originalVoiceSettings.slice();
    this.voiceFormCtls.controls = [];
    this.voiceSettings.forEach((element, index) => {
      this.voiceFormCtls.push(
        this.fb.group({
          sOrder: element.sOrder,
          display: element.display,
          voiceRecordingTypeID: element.voiceRecordingTypeID,
          script: element.script
        })
      );
    });
  }

  addVoices() {
    this.voiceEdit = 2;
  }

  voiceToDelete(index) {
    this.voiceItemIndexDelete = index;
    this.voiceItemDisplay = this.voiceFormCtls.controls[index].value.display;
  }

  async deleteVoice() {
    var index = this.voiceItemIndexDelete;
    this.showSpinner = true;
    var voiceRecDelete = this.voiceFormCtls.controls[index].value.voiceRecordingTypeID;
    await this._voiceSrvc.voiceRecording_Delete(this.encryptedUser, voiceRecDelete)
      .then((result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.voiceFormCtls.controls.splice(index, 1);
          this.showSpinner = false;
          this._notifyService.showSuccess("Voice Recording deleted successfully", "", 3000);
          this.getVoicesData();
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log('Error in deleting Voice Recording' + err);
      });

  }

  async saveVoices() {
    this.showSpinner = true;

    this.voiceSettings = [];

    this.voiceFormCtls.controls.forEach((row, index) => {
      var voiceSetting = <VoiceRecordingType>{
        voiceRecordingTypeID: row.value.voiceRecordingTypeID,
        display: row.value.display,
        script: row.value.script,
        sOrder: index + 1,
        cLPCompanyID: this.user.cLPCompanyID
      }
      this.voiceSettings.push(voiceSetting);
    });
    await this._voiceSrvc.voiceRecording_Save(this.encryptedUser, this.voiceSettings)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.voiceEdit = 0;
          this.sortTeamMode = false;
          this.isSorted = false;
          await this.getVoicesData();
          this.showSpinner = false;
          this.editRowIndex = -1;
          this.voiceData = "New Item 1 \nNew Item 2 \nNew Item 3";
          this._notifyService.showSuccess("Voice Recording saved successfully", "", 3000);

        }
        else {
          this._notifyService.showError("Could Not Save Voice Recording", "Error while saving Voice Recording", 3000);
          this.sortTeamMode = false;
          this.isSorted = false;
          this.showSpinner = false;
          this.originalVoice();
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        this.sortTeamMode = false;
        this.isSorted = false;
        this.originalVoice();
        this._notifyService.showError("Could Not Save Voice Recording", "Error while saving Voice Recording", 3000);
        console.log('error in saving voice setting' + err);

      });

  }

  async saveBulkVoices() {
    this.showSpinner = true;
    let voiceCodeDataArray = this.voiceData.split('\n');
    voiceCodeDataArray = voiceCodeDataArray.filter(item => item.trim().length > 0);
    voiceCodeDataArray.forEach((value, index) => {
      let lastindex = this.voiceFormCtls.length;
      this.voiceFormCtls.push(
        this.fb.group({
          sOrder: lastindex,
          display: value,
          voiceRecordingTypeID: 0,
          script: ''
        })
      )
    });
    await this.saveVoices();
    this.showSpinner = false;

  }

  identifyVoice(index: number, item: any): string {
    return item.value.sOrder;
  }

  scrollToNew() {
    setTimeout(function () {
      var elem = document.getElementById("scrollId");
      elem?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }, 0);
  }

  emitPagination(pagedData) {
    this.voiceFormCtls.controls = [];
    this.voiceFormCtls.controls = pagedData.data
    this.skipSize = pagedData.skipSize;
    this.pageSize = pagedData.size
  }

  settingItemtoEdit(index) {
    this.editRowIndex = index;
    this.voiceEdit = 0;

  }


}
