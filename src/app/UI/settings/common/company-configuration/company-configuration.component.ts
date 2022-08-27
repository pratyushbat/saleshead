import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { CompanyDisplaySettingResponse, CompanyFieldsResponse } from '../../../../models/company.model';
import { sectionDiplaySetting } from '../../../../models/contact.model';
import { eFeatures, eSection, eSectionCompany } from '../../../../models/enum.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { AccountSetupService } from '../../../../services/accountSetup.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';


declare var $: any;
@Component({
    selector: 'company-configuration',
    templateUrl: './company-configuration.component.html',
    styleUrls: ['./company-configuration.component.css']
})
/** company-configuration component*/
export class CompanyConfigurationComponent implements OnInit {
  user: CLPUser;
  eventUpdateCounter = 0;
  isInit: boolean = false;
  isChange: boolean = false;
  showSpinner: boolean = false;
  private encryptedUser: string = '';

  companyFieldsResponse: CompanyFieldsResponse;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;

  arrAllControls: any[] = [];
  arrGenCtrl: any[] = [];
  arrCommunicationCtrl: any[] = [];
  arrClassificationCbCtrl: any[] = [];
  arrClassificationDropDownCtrl: any[];
  arrAddtionalInformationCtrl: any[];
  arrCommentsCtrl: any[];
  arrSortedBySection: any[] = [];
  currentUrl: string = '';
  /* dragaable changes between section*/
  checkValeForSelectedItem: any;
  oldSection: any;
  newSection: any;
  newIndex: any;
  oldIndex: any;
  checkValueForSelectedInput: string;
  /* dragaable changes between section*/

  constructor(private _router: Router,
    public _localService: LocalService,
    private _utilityService: UtilityService,
    private notifyService: NotificationService,
    private _accountSetupService: AccountSetupService) {
    this._localService.isMenu = true;
    _router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        var url = event.url;
        var splitUrl = url?.split('/', 4);
        this.currentUrl = splitUrl.length > 0 ? splitUrl[1] : '';
      }
    });

  }

  public eventOptions = {
    onUpdate: () => this.eventUpdateCounter++,
    draggable: '.draggable',
    group: 'shared',
    onStart: (/**Event*/evt) => {
      this.startEe(evt);

    },
    onEnd: (/**Event*/evt) => {
      this.endEv(evt);
    }
  };

  public eventOptionsSection = {
    onUpdate: () => this.eventUpdateCounter++,
    draggable: '.draggable',
  };

  ngOnInit(): void {
 
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.showSpinner = true;
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {        
          this.showSpinner = false;
          this.getCompanyFieldsConfiguration();
        }
        else {
          this.showSpinner = false;
          this._router.navigate(['/unauthorized']);
        }
      })
    }
    else {
      this.showSpinner = false;
      this._router.navigate(['/unauthorized']);
    }

  }

  ngAfterViewChecked() {
    if (this.isInit) {
      this.isInit = false;
      this.loadConfiguration();
    }
    if (this.isChange) {
      this.isChange = false;
      this.updateConfiguration();
    }
  }

  loadConfiguration() {
    for (var i = 0; i < this.arrGenCtrl.length; i++) {
      if (this.arrGenCtrl[i].inputConfigFiled == 'radio') {
        var radioGen_id = "radioGen" + i;
        $('input:radio[name=' + radioGen_id + '][value=' + this.arrGenCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbGen_id = "cbGen" + i;
        $("#" + cbGen_id).prop("checked", this.arrGenCtrl[i].isShow == 1 ? true : false);
        $("#spanGen" + i).text(this.arrGenCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrCommunicationCtrl.length; i++) {
      if (this.arrCommunicationCtrl[i].inputConfigFiled == 'radio') {
        var radioComm_id = "radioComm" + i;
        $('input:radio[name=' + radioComm_id + '][value=' + this.arrCommunicationCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbComm_id = "cbComm" + i;
        $("#" + cbComm_id).prop("checked", this.arrCommunicationCtrl[i].isShow == 1 ? true : false);
        $("#spanComm" + i).text(this.arrCommunicationCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrAddtionalInformationCtrl.length; i++) {
      if (this.arrAddtionalInformationCtrl[i].inputConfigFiled == 'radio') {
        var radioCustomText_id = "radioCustomText" + i;
        $('input:radio[name=' + radioCustomText_id + '][value=' + this.arrAddtionalInformationCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbCustomText_id = "cbCustomText" + i;
        $("#" + cbCustomText_id).prop("checked", this.arrAddtionalInformationCtrl[i].isShow == 1 ? true : false);
        $("#spanCustomText" + i).text(this.arrAddtionalInformationCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      
      }
    }

    for (var i = 0; i < this.arrClassificationDropDownCtrl.length; i++) {
      if (this.arrClassificationDropDownCtrl[i].inputConfigFiled == 'radio') {
        var radioDD_id = "radioDD" + i;
        $('input:radio[name=' + radioDD_id + '][value=' + this.arrClassificationDropDownCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbDD_id = "cbDD" + i;
        $("#" + cbDD_id).prop("checked", this.arrClassificationDropDownCtrl[i].isShow == 1 ? true : false);
        $("#spanDD" + i).text(this.arrClassificationDropDownCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrClassificationCbCtrl.length; i++) {
      if (this.arrClassificationCbCtrl[i].inputConfigFiled == 'radio') {
        var radioCB_id = "radioCB" + i;
        $('input:radio[name=' + radioCB_id + '][value=' + this.arrClassificationCbCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbCB_id = "cbCB" + i;
        $("#" + cbCB_id).prop("checked", this.arrClassificationCbCtrl[i].isShow == 1 ? true : false);
        $("#spanCB" + i).text(this.arrClassificationCbCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrCommentsCtrl.length; i++) {
      if (this.arrCommentsCtrl[i].inputConfigFiled == 'radio') {
        var radioCBAdd_id = "radioCBAdd" + i;
        $('input:radio[name=' + radioCBAdd_id + '][value=' + this.arrCommentsCtrl[i].isShow + ']').attr('checked', true);
      }
      else {
        var cbComments_id = "cbComments" + i;
        $("#" + cbComments_id).prop("checked", this.arrCommentsCtrl[i].isShow == 1 ? true : false);
        $("#spanComments" + i).text(this.arrCommentsCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }
  }


  updateConfiguration() {
    for (var i = 0; i < this.arrGenCtrl.length; i++) {
      if (this.arrGenCtrl[i].inputConfigFiled == 'radio') {
        var radioGen_id = "radioGen" + i;
        $('input:radio[name=' + radioGen_id + '][value=' + this.arrGenCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbGen_id = "cbGen" + i;
        $("#" + cbGen_id).prop("checked", this.arrGenCtrl[i].isShow == 1 ? true : false);
        $("#spanGen" + i).text(this.arrGenCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrCommunicationCtrl.length; i++) {
      if (this.arrCommunicationCtrl[i].inputConfigFiled == 'radio') {
        var radioComm_id = "radioComm" + i;
        $('input:radio[name=' + radioComm_id + '][value=' + this.arrCommunicationCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbComm_id = "cbComm" + i;
        $("#" + cbComm_id).prop("checked", this.arrCommunicationCtrl[i].isShow == 1 ? true : false);
        $("#spanComm" + i).text(this.arrCommunicationCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrAddtionalInformationCtrl.length; i++) {
      if (this.arrAddtionalInformationCtrl[i].inputConfigFiled == 'radio') {
        var radioCustomText_id = "radioCustomText" + i;
        $('input:radio[name=' + radioCustomText_id + '][value=' + this.arrAddtionalInformationCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbCustomText_id = "cbCustomText" + i;
        $("#" + cbCustomText_id).prop("checked", this.arrAddtionalInformationCtrl[i].isShow == 1 ? true : false);
        $("#spanCustomText" + i).text(this.arrAddtionalInformationCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");

      }
    }

    for (var i = 0; i < this.arrClassificationDropDownCtrl.length; i++) {
      if (this.arrClassificationDropDownCtrl[i].inputConfigFiled == 'radio') {
        var radioDD_id = "radioDD" + i;
        $('input:radio[name=' + radioDD_id + '][value=' + this.arrClassificationDropDownCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbDD_id = "cbDD" + i;
        $("#" + cbDD_id).prop("checked", this.arrClassificationDropDownCtrl[i].isShow == 1 ? true : false);
        $("#spanDD" + i).text(this.arrClassificationDropDownCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrClassificationCbCtrl.length; i++) {
      if (this.arrClassificationCbCtrl[i].inputConfigFiled == 'radio') {
        var radioCB_id = "radioCB" + i;
        $('input:radio[name=' + radioCB_id + '][value=' + this.arrClassificationCbCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbCB_id = "cbCB" + i;
        $("#" + cbCB_id).prop("checked", this.arrClassificationCbCtrl[i].isShow == 1 ? true : false);
        $("#spanCB" + i).text(this.arrClassificationCbCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }

    for (var i = 0; i < this.arrCommentsCtrl.length; i++) {
      if (this.arrCommentsCtrl[i].inputConfigFiled == 'radio') {
        var radioCBAdd_id = "radioCBAdd" + i;
        $('input:radio[name=' + radioCBAdd_id + '][value=' + this.arrCommentsCtrl[i].isShow + ']').prop('checked', true);
      }
      else {
        var cbComments_id = "cbComments" + i;
        $("#" + cbComments_id).prop("checked", this.arrCommentsCtrl[i].isShow == 1 ? true : false);
        $("#spanComments" + i).text(this.arrCommentsCtrl[i].isShow == 1 ? "Show Mandatory" : "Show");
      }
    }
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, this.currentUrl == 'appt-settings' ? eFeatures.AppointmentNoteandMailingSettings : this.currentUrl == 'company-settings' ? eFeatures.CompanyModuleSettings : this.currentUrl == 'contact-settings' ? eFeatures.ContactModuleSettings : this.currentUrl == 'lead-settings' ? eFeatures.LeadModuleSettings : eFeatures.AppointmentNoteandMailingSettings)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse) ) {
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


  async getCompanyFieldsConfiguration() {
    this.showSpinner = false;
    await this._accountSetupService.companyFields_GetConfiguration(this.encryptedUser, this.user.cLPCompanyID, this.user.cLPUserID)
      .then(async (result: CompanyFieldsResponse) => {
        if (result) {
          this.showSpinner = false;
          var result = UtilityService.clone(result);
          this.companyFieldsResponse = UtilityService.clone(result);
          this.arrAllControls = [];
          var keys = Object.keys(this.companyFieldsResponse.companyFields).filter(i => i.indexOf("contactMoreFields") == -1 && i.indexOf("displaySetting") == -1);
          for (var i = 0; i < keys.length; i++) {
            if (!!this.companyFieldsResponse.companyFields[keys[i]])
              this.arrAllControls.push(this.companyFieldsResponse.companyFields[keys[i]]);
          }

          this.arrGenCtrl = this.arrAllControls.filter(i => i.sectionCompany == eSectionCompany.General);
          this.arrCommunicationCtrl = this.arrAllControls.filter(i => i.sectionCompany == eSectionCompany.Communication);
          this.arrClassificationCbCtrl = this.arrAllControls.filter(i => i.sectionCompany == eSectionCompany.ClassificationCheckBox);
          this.arrClassificationDropDownCtrl = this.arrAllControls.filter(i => i.sectionCompany == eSectionCompany.ClassificationDropDown);
          this.arrAddtionalInformationCtrl = this.arrAllControls.filter(i => i.sectionCompany == eSectionCompany.AddtionalInformation);
          this.arrCommentsCtrl = this.arrAllControls.filter(i => i.sectionCompany == eSectionCompany.Comments);

          this.arrGenCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.arrCommunicationCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.arrClassificationCbCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.arrClassificationDropDownCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.arrAddtionalInformationCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.arrCommentsCtrl.sort((a, b) => (a.displayOrder > b.displayOrder) ? 1 : -1);
          this.isInit = true;

          if (!isNullOrUndefined(this.companyFieldsResponse.companyFields) && !isNullOrUndefined(this.companyFieldsResponse.companyFields.displaySetting) && !isNullOrUndefined(this.companyFieldsResponse.companyFields.displaySetting.fieldDiplaySettings.length > 0)) {
            this.arrSortedBySection = [];
            let sectionDiplaySettings: sectionDiplaySetting[] = this.companyFieldsResponse.companyFields.displaySetting.sectionDiplaySettings;
            sectionDiplaySettings.sort((a, b) => (a.sectionDisplayOrder > b.sectionDisplayOrder) ? 1 : -1);
            for (var i = 0; i < sectionDiplaySettings.length; i++) {
              switch (eSectionCompany[sectionDiplaySettings[i].sectionId]) {
                case eSectionCompany[eSectionCompany.Communication]: this.arrSortedBySection.push({ sectionName: 'Communication', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCommunicationCtrl }); break;
                case eSectionCompany[eSectionCompany.AddtionalInformation]: this.arrSortedBySection.push({ sectionName: 'Addtional Information', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrAddtionalInformationCtrl }); break;
                case eSectionCompany[eSectionCompany.ClassificationDropDown]: this.arrSortedBySection.push({ sectionName: 'Classification DropDown', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrClassificationDropDownCtrl }); break;
                case eSectionCompany[eSectionCompany.ClassificationCheckBox]: this.arrSortedBySection.push({ sectionName: 'Classification CheckBox', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrClassificationCbCtrl }); break;
                case eSectionCompany[eSectionCompany.Comments]: this.arrSortedBySection.push({ sectionName: 'Comments', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrCommentsCtrl }); break;
                case eSectionCompany[eSectionCompany.General]: this.arrSortedBySection.push({ sectionName: 'General', sectionId: sectionDiplaySettings[i].sectionId, items: this.arrGenCtrl }); break;
              }
            }
          }

        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  getSectionNameById(sectionId): string {
    return eSectionCompany[sectionId].toString();
  }
  async saveConfiguration() {

    this.showSpinner = true;

    let _displaySettingResponse: CompanyDisplaySettingResponse = { companyFields: [], compDisplaySetting: { fieldDiplaySettings: [], sectionDiplaySettings: [] } };

    for (var i = 0; i < this.arrSortedBySection.length; i++) {
      let _setionDiplaySetting: sectionDiplaySetting = { sectionId: this.arrSortedBySection[i].sectionId, sectionName: this.arrSortedBySection[i].sectionName, sectionDisplayOrder: i }
      _displaySettingResponse.compDisplaySetting.sectionDiplaySettings.push(_setionDiplaySetting);
    }

    if (!isNullOrUndefined(this.companyFieldsResponse) && !isNullOrUndefined(this.companyFieldsResponse.companyFields)) {
      var contactFields = this.companyFieldsResponse.companyFields;
      var arrFinal = [];

      let arrGeneral: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionCompany.General)[0])?.items;

      if (!isNullOrUndefined(arrGeneral) && arrGeneral.length > 0) {
        for (var i = 0; i < arrGeneral.length; i++) {
          arrGeneral[i].sectionCompany = eSectionCompany.General;
          arrGeneral[i].displayOrder = (i + 1);
          arrGeneral[i].fieldTitle = $("#tbGenTitle" + i).val();

          if (arrGeneral[i].inputConfigFiled == 'radio') {
            var radioGen_id = "radioGen" + i;
            arrGeneral[i].isShow = $('input[name=' + radioGen_id + ']:checked').val();
          }
          else {
            var cbGen_id = "cbGen" + i;
            arrGeneral[i].isShow = $('#' + cbGen_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(this.arrGenCtrl[i]);
        }
      }

      let arrCommunication: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionCompany.Communication)[0]).items;

      if (!isNullOrUndefined(arrCommunication) && arrCommunication.length > 0) {
        for (var i = 0; i < arrCommunication.length; i++) {
          arrCommunication[i].sectionCompany = eSectionCompany.Communication;
          arrCommunication[i].displayOrder = (i + 1);
          arrCommunication[i].fieldTitle = $("#tbCommTitle" + i).val();

          if (arrCommunication.inputConfigFiled == 'radio') {
            var radioComm_id = "radioComm" + i;
            arrCommunication[i].isShow = $('input[name=' + radioComm_id + ']:checked').val();
          }
          else {
            var cbComm_id = "cbComm" + i;
            arrCommunication[i].isShow = $('#' + cbComm_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrCommunication[i]);
        }
      }

      let arrClassificationCb: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionCompany.ClassificationCheckBox)[0]).items;

      if (!isNullOrUndefined(arrClassificationCb) && arrClassificationCb.length > 0) {
        for (var i = 0; i < arrClassificationCb.length; i++) {
          arrClassificationCb[i].sectionCompany = eSectionCompany.ClassificationCheckBox;
          arrClassificationCb[i].displayOrder = (i + 1);
          arrClassificationCb[i].fieldTitle = $("#tbCBTitle" + i).val();

          if (arrClassificationCb[i].inputConfigFiled == 'radio') {
            var radioCB_id = "radioCB" + i;
            arrClassificationCb[i].isShow = $('input[name=' + radioCB_id + ']:checked').val();
          }
          else {
            var cbCB_id = "cbCB" + i;
            arrClassificationCb[i].isShow = $('#' + cbCB_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrClassificationCb[i]);
        }
      }

      let arrClassificationDropDow: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionCompany.ClassificationDropDown)[0]).items;

      if (!isNullOrUndefined(arrClassificationDropDow) && arrClassificationDropDow.length > 0) {
        for (var i = 0; i < arrClassificationDropDow.length; i++) {
          arrClassificationDropDow[i].sectionCompany = eSectionCompany.ClassificationDropDown;
          arrClassificationDropDow[i].displayOrder = (i + 1);
          arrClassificationDropDow[i].fieldTitle = $("#tbDDTitle" + i).val();

          if (arrClassificationDropDow[i].inputConfigFiled == 'radio') {
            var radioDD_id = "radioDD" + i;
            arrClassificationDropDow[i].isShow = $('input[name=' + radioDD_id + ']:checked').val();
            arrClassificationDropDow[i].isShow = +arrClassificationDropDow[i].isShow;
          }
          else {
            var cbDD_id = "cbDD" + i;
            arrClassificationDropDow[i].isShow = $('#' + cbDD_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrClassificationDropDow[i]);
        }
      }

      let arrAddtionalInformation: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionCompany.AddtionalInformation)[0]).items;

      if (!isNullOrUndefined(arrAddtionalInformation) && arrAddtionalInformation.length > 0) {
        for (var i = 0; i < arrAddtionalInformation.length; i++) {
          arrAddtionalInformation[i].sectionCompany = eSectionCompany.AddtionalInformation;
          arrAddtionalInformation[i].displayOrder = (i + 1);
          arrAddtionalInformation[i].fieldTitle = $("#tbCustomTextFldTitle" + i).val();

          if (arrAddtionalInformation[i].inputConfigFiled == 'radio') {
            var radioCustomText_id = "radioCustomText" + i;
            arrAddtionalInformation[i].isShow = $('input[name=' + radioCustomText_id + ']:checked').val();
            arrAddtionalInformation[i].isShow = +arrAddtionalInformation[i].isShow;
          }
          else {
            var cbCustomText_id = "cbCustomText" + i;
            arrAddtionalInformation[i].isShow = $('#' + cbCustomText_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrAddtionalInformation[i]);
        }
      }

      let arrComments: any = (this.arrSortedBySection.filter(i => i.sectionId == eSectionCompany.Comments)[0]).items;

      if (!isNullOrUndefined(arrComments) && arrComments.length > 0) {
        for (var i = 0; i < arrComments.length; i++) {
          arrComments[i].sectionCompany = eSectionCompany.Comments;
          arrComments[i].displayOrder = (i + 1);
          arrClassificationCb[i].fieldTitle = $("#tbCommentTitle" + i).val();

          if (arrComments[i].inputConfigFiled == 'radio') {
            var radioCBAdd_id = "radioCBAdd" + i;
            arrComments[i].isShow = $('input[name=' + radioCBAdd_id + ']:checked').val();
          }
          else {
            var cbComments_id = "cbComments" + i;
            arrComments[i].isShow = $('#' + cbComments_id).is(":checked") ? 1 : 0;
          }
          arrFinal.push(arrComments[i]);
        }
      }

      _displaySettingResponse.companyFields = arrFinal;
      _displaySettingResponse.compDisplaySetting.fieldDiplaySettings.push({ displayOrder: 0, fieldName: '', inputConfigFiled: '', sectionId: 0 });
      await this._accountSetupService.companyFields_UpdateConfiguration(this.encryptedUser, _displaySettingResponse, this.user.cLPCompanyID)
        .then(async (result: SimpleResponse) => {
          if (result) {
            this.getCompanyFieldsConfiguration();
            var res = UtilityService.clone(result);
            this.showSpinner = false;
            this.notifyService.showSuccess("Company Configuration updated successfully", "", 3000);
          }
          else
            this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          this.showSpinner = false;
          console.log(err);
          this._utilityService.handleErrorResponse(err);
          this.notifyService.showError("some error occurred, Please contact Administrator.", "", 3000);
        });
      this.showSpinner = false;
    }
  }

  checkValue(e: any, id: string) {
    this.newSection = e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstElementChild.getElementsByTagName('h5')[0].innerText;
    this.newIndex = Number(id[id.length - 1]);
    if (this.newIndex != undefined && this.newSection) {
      var checkedBoolean = e.target.checked ? 1 : 0;
      this.checkValeForSelectedItem = checkedBoolean;
      this.updateArray();
      $("#" + id).text(e.target.checked ? "Show Mandatory" : "Show");
    } else {
      console.log('index or section not found');
    }
  }

  cancel() {
    this.loadConfiguration();
  }
  async onreset() {
    await this.getCompanyFieldsConfiguration();
    this.notifyService.showSuccess("Company Configuration reset successfully", "", 3000);
  }

  startEe(evt) {
    var sectionSelFrom = evt.item?.offsetParent.firstElementChild.getElementsByTagName('h5')[0].innerText;
    this.oldSection = sectionSelFrom;
    if (evt.item.getElementsByTagName('input').length > 0) {
      if (evt.item.getElementsByTagName('input').item(0).type == "checkbox")
        this.checkValeForSelectedItem = evt.item?.getElementsByTagName('input').item(0).checked;
      else {
        if (evt.item.getElementsByTagName('input').item(0).type == "text")
          this.checkValueForSelectedInput = evt.item.getElementsByTagName('input').item(0).value;
      }

      if (evt.item.getElementsByTagName('input')[1]) {
        var selectedRadioId = evt.item.getElementsByTagName('input')[1].name;
        var selectedRadioValue = $('input[name=' + selectedRadioId + ']:checked').val();
        this.checkValeForSelectedItem = Number(selectedRadioValue);
      }
    }
  }

  endEv(evt) {
    console.log(this.checkValeForSelectedItem)
    this.newSection = evt.item.offsetParent.firstElementChild.getElementsByTagName('h5')[0].innerText;
    this.newIndex = evt.newIndex;
    this.isChange = true;
    this.updateArray();     

  }


  updateArray() {

    if (this.newSection == "General") {
      if (this.arrGenCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
      this.arrGenCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrGenCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrGenCtrl[this.newIndex].fieldTitle;
    }
    

    else if (this.newSection == "Comments") {
      if (this.arrCommentsCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
      this.arrCommentsCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrCommentsCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrCommentsCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Classification CheckBox") {
      if (this.arrClassificationCbCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
        this.arrClassificationCbCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrClassificationCbCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrClassificationCbCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Classification DropDown") {
      if (this.arrClassificationDropDownCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
        this.arrClassificationDropDownCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrClassificationDropDownCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrClassificationDropDownCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Addtional Information") {
      if (this.arrAddtionalInformationCtrl[this.newIndex].isShow != this.checkValeForSelectedItem)
        this.arrAddtionalInformationCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrAddtionalInformationCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrAddtionalInformationCtrl[this.newIndex].fieldTitle;
    }

    else if (this.newSection == "Communication") {
      this.arrCommunicationCtrl[this.newIndex].isShow = this.checkValeForSelectedItem;
      this.arrCommunicationCtrl[this.newIndex].fieldTitle = this.checkValueForSelectedInput ? this.checkValueForSelectedInput : this.arrCommunicationCtrl[this.newIndex].fieldTitle;
    }

    this.checkValueForSelectedInput = undefined;   
  }

  handleChange(evt) {
    this.newSection = evt.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstElementChild.getElementsByTagName('h5')[0].innerText;
    var id = evt.currentTarget.name
    this.newIndex = Number(id[id.length - 1]);
    if (this.newIndex != undefined && this.newSection) {
      this.checkValeForSelectedItem = Number(evt.currentTarget.value);
      this.updateArray();
    } else {
      console.log('index or section not found');
    }
  }

  showSectionWise(section, sectionItem) {
    return ((section.sectionId == 1 || section.sectionId == 2 || section.sectionId == 3 || section.sectionId == 4 || section.sectionId == 5 || section.sectionId == 6 ) && sectionItem.inputConfigFiled == 'check');
  }
}
