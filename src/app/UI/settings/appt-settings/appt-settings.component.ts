import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { AppointmentSetting, AppointmentSettingListResponse } from '../../../models/appointmentSetting.model';
import { ApptResponse } from '../../../models/appt.model';
import { ClassCodesDictionaryResponse } from '../../../models/classCodes.model';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { CompanySetting, CompanySettingListResponse } from '../../../models/companySetting.model';
import { eClassCodes, eCompanySettings, eFeatures, eLeadSettings, eUserRole } from '../../../models/enum.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { LeadSetting, LeadSettingListResponse } from '../../../models/leadSetting.model';
import { RoleFeaturePermissions } from '../../../models/roleContainer.model';
import { AccountSetupService } from '../../../services/accountSetup.service';
import { AppointmentSettingService } from '../../../services/appointmentSetting.service';
import { ClassCodeService } from '../../../services/classCode.service';
import { CompanySettingService } from '../../../services/companySetting.service';
import { ContactService } from '../../../services/contact.service';
import { LeadSettingService } from '../../../services/leadSetting.service';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';

@Component({
  selector: 'app-appt-settings',
  templateUrl: './appt-settings.component.html',
  styleUrls: ['./appt-settings.component.css']
})
/** appt-settings component*/
export class ApptSettingsComponent implements OnInit {
  /** appt-settings ctor */
  user: CLPUser;
  userResponse: UserResponse;
  appointmentSetting: AppointmentSetting[];
  roleFeaturePermissions: RoleFeaturePermissions;
  manipulatedApptSettings: any[] = [];
  manipulatedLeadSettings: any[] = [];
  manipulatedClassCodes: any[] = [];
  manipulatedCompanySettings: any[] = [];

  private encryptedUser: string = '';
  expdTypeApptName: string = '';
  expdTypeLeadName: string = '';
  expdTypeContactName: string = '';
  expdTypeCompanyName: string = '';
  currentUrl: string = '';
  index: number = -1;

  showSpinner: boolean = false;
  isExpdTypeAppt: boolean = false;
  isExpdTypeLead: boolean = false;
  isExpdTypeContact: boolean = false;
  isExpdTypeCompany: boolean = false;
  isExpdContactSetup: boolean = false;
  isExpdLeadSetup: boolean = false;
  isExpdCompanySetup: boolean = false;

  /* edit title */
  isContactEditMode = false;
  isCompanyEditMode = false;
  isLeadEditMode = false;
  contactClassificationHeading: string;
  companyClassificationHeading: string;
  leadClassificationHeading: string;
  /* edit title */

  constructor(public _localService: LocalService,
    private _utilityService: UtilityService,
    private _appointmentSettingService: AppointmentSettingService,
    private _leadSettingService: LeadSettingService,
    private _accountSetupService: AccountSetupService,
    private _contactService: ContactService,
    private _classCodeService: ClassCodeService,
    private _companySettingService: CompanySettingService,
    private _ngZone: NgZone,
    private _router: Router,
  ) {
    this._localService.isMenu = true;
    this.subscribeToEvents();
    _router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        var url = event.url;
        var splitUrl = url?.split('/', 4);
        this.currentUrl = splitUrl.length > 0 ? splitUrl[1] : '';
      }
    });
  }

  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getAppointmentSettings();
          this.getClassCodes();
          this.getLeadSettings();
          this.getCompanySettings();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    this.showSpinner = true;
    await this._localService.authenticateUser(this.encryptedUser, this.currentUrl == 'appt-settings' ? eFeatures.AppointmentNoteandMailingSettings : this.currentUrl == 'company-settings' ? eFeatures.CompanyModuleSettings : this.currentUrl == 'contact-settings' ? eFeatures.ContactModuleSettings : this.currentUrl == 'lead-settings' ? eFeatures.LeadModuleSettings : eFeatures.AppointmentNoteandMailingSettings)
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

  saveSettingsHeading(index: number, type) {
    if (type) {
      switch (type) {
        case "appt":
          break;
        case "contact":
          this.manipulatedClassCodes[index].title = this.contactClassificationHeading;
          this.isContactEditMode = false;
          this.saveTitleHeading(this.manipulatedClassCodes[index].tableName, this.manipulatedClassCodes[index].title)
          break;
        case "lead":
          this.manipulatedLeadSettings[index].title = this.leadClassificationHeading;
          this.isLeadEditMode = false;
          this.saveLeadTitleHeading(this.manipulatedLeadSettings[index].tableName, this.manipulatedLeadSettings[index].title)
          break;
        case "company":
          this.manipulatedCompanySettings[index].title = this.companyClassificationHeading;
          this.isCompanyEditMode = false;
          this.saveCompanyTitleHeading(this.manipulatedCompanySettings[index].tableName, this.manipulatedCompanySettings[index].title)
          break;
      }
    }

  }

  async saveTitleHeading(classcodeTile: string, title: string) {
    var codetitle: eClassCodes = eClassCodes[classcodeTile];
    this.showSpinner = true;
    await this._contactService.contactFieldTitleUpdate(this.encryptedUser, this.user.cLPCompanyID, title, codetitle)
      .then((result: SimpleResponse) => {
        if (result) {
          this.showSpinner = false;
          this.isExpdTypeContact = false;
          this.expdTypeContactName = '';
          this.getClassCodes();
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
      });
  }
  async saveCompanyTitleHeading(classcodeTile: string, title: string) {
    var codetitle: eCompanySettings = eCompanySettings[classcodeTile];
    this.showSpinner = true;
    await this._accountSetupService.companyFieldTitleUpdate(this.encryptedUser, this.user.cLPCompanyID, title, codetitle)
      .then((result: SimpleResponse) => {
        if (result) {
          this.showSpinner = false;
          this.isExpdTypeCompany = false;
          this.expdTypeCompanyName = '';
          this.getCompanySettings();

        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
      });
  }

  async saveLeadTitleHeading(classcodeTile: string, title: string) {
    var codetitle: eLeadSettings = eLeadSettings[classcodeTile];
    this.showSpinner = true;
    await this._leadSettingService.leadFieldTitleUpdate(this.encryptedUser, this.user.cLPCompanyID, title, codetitle)
      .then((result: ApptResponse) => {
        if (result) {
          this.showSpinner = false;
          this.isExpdTypeLead = false;
          this.expdTypeLeadName = '';
          this.getLeadSettings();

        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
      });
  }

  async getAppointmentSettings() {
    this.showSpinner = true;
    this.manipulatedApptSettings = [];
    await this._appointmentSettingService.getAppointmentSettings(this.encryptedUser, this.user.cLPCompanyID)
      .then((result: AppointmentSettingListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.appointmentSetting = response.appointmentSettings;
          if (this.appointmentSetting?.length > 0) {
            var appointmentSettingArr = this.appointmentSetting.map(x => Object.assign({}, x)); //Deep copy
            var manipulatedApptArr: any[] = [];
            appointmentSettingArr?.forEach(function (obj) {
              var dynTableName: string;
              if (obj.tableName == 'ApptContactTypeCode')
                dynTableName = 'Contact Appointment Type';
              else if (obj.tableName == 'ApptGeneralTypeCode')
                dynTableName = 'General Appointment Type';
              else if (obj.tableName == 'NoteTypeCode')
                dynTableName = 'Note Type';
              else if (obj.tableName == 'MailingtypeCode')
                dynTableName = 'Mailing Type';
              else if (obj.tableName == 'ApptLeadTypeCode')
                dynTableName = 'Lead Appointment Type';
              else
                dynTableName = obj.tableName;

              manipulatedApptArr.push({ name: dynTableName, tableName: obj.tableName, items: appointmentSettingArr?.filter(i => i.tableName == obj.tableName).sort((a, b) => (a.sOrder > b.sOrder) ? 1 : -1) });
            });
            var ApptSetting = manipulatedApptArr.filter((elem, index) => manipulatedApptArr.findIndex(obj => obj.name == elem.name) === index);
            if (ApptSetting.filter(elem => elem.name == 'Contact Appointment Type').length <= 0)
              ApptSetting.push({ name: 'Contact Appointment Type', items: [], tableName: 'ApptContactTypeCode' });

            if (ApptSetting.filter(elem => elem.name == 'General Appointment Type').length <= 0)  
              ApptSetting.push({ name: 'General Appointment Type', items: [], tableName: 'ApptGeneralTypeCode' });

            if (ApptSetting.filter(elem => elem.name == 'Lead Appointment Type').length <= 0)
              ApptSetting.push({ name: 'Lead Appointment Type', items: [], tableName: 'ApptLeadTypeCode' });

            if (ApptSetting.filter(elem => elem.name == 'Note Type' ).length <= 0)
              ApptSetting.push({ name: 'Note Type', items: [], tableName: 'NoteTypeCode' });

            if (ApptSetting.filter(elem => elem.name == 'Mailing Type' ).length <= 0)
              ApptSetting.push({ name: 'Mailing Type', items: [], tableName: 'MailingtypeCode' });

            this.manipulatedApptSettings.push(ApptSetting.filter(elem => elem.name == 'Contact Appointment Type' || elem.name == 'General Appointment Type' || elem.name == 'Lead Appointment Type'));
            this.manipulatedApptSettings.push(ApptSetting.filter(elem => elem.name == 'Note Type'));
            this.manipulatedApptSettings.push(ApptSetting.filter(elem => elem.name == 'Mailing Type'));
          } else
            this.manipulatedApptSettings = [[{ name: 'Contact Appointment Type', items: [], tableName: 'ApptContactTypeCode' }, { name: 'General Appointment Type', items: [], tableName: 'ApptGeneralTypeCode' }, { name: 'Lead Appointment Type', items: [], tableName: 'ApptLeadTypeCode' }], [{ name: 'Note Type', items: [], tableName: 'NoteTypeCode' }], [{ name: 'Mailing Type', items: [], tableName: 'MailingtypeCode' }]];

          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
      });
  }

  async getClassCodes() {
    this.showSpinner = true;
    this.manipulatedClassCodes = [];
    await this._classCodeService.getClassCodesListDictionary(this.encryptedUser, this.user.cLPCompanyID)
      .then((result: ClassCodesDictionaryResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          var listContact: any = response.classCodes;
          this.manipulatedClassCodes = this._localService.convertAnyDictionaryToAnyType(listContact);
          this.manipulatedClassCodes?.forEach(contactSetting => {
            var companyKeySplit = contactSetting?.key?.split(':');
            contactSetting.tableName = companyKeySplit[0];
            contactSetting.title = companyKeySplit[1];
          });
          this.manipulatedClassCodes?.forEach(lead => lead.value.sort((a, b) => (a.sOrder > b.sOrder) ? 1 : -1));
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
      });
  }

  async getLeadSettings() {
    this.showSpinner = true;
    this.manipulatedLeadSettings = [];
    await this._leadSettingService.getLeadSettings(this.encryptedUser, this.user.cLPCompanyID)
      .then((result: LeadSettingListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          var listLead: any = response.leadSettings;
          this.manipulatedLeadSettings = this._localService.convertAnyDictionaryToAnyType(listLead);
          this.manipulatedLeadSettings?.forEach(leadSetting => {
            var companyKeySplit = leadSetting?.key?.split(':');
            leadSetting.tableName = companyKeySplit[0];
            leadSetting.title = companyKeySplit[1];
          });
          this.manipulatedLeadSettings?.forEach(lead => lead.value.sort((a, b) => (a.sOrder > b.sOrder) ? 1 : -1));
          if (this.manipulatedLeadSettings.filter(lead => lead.tableName == 'LeadStatusCode').length <= 0)
            this.manipulatedLeadSettings.push({ key: 'LeadStatusCode:Status', tableName: 'LeadStatusCode', title: 'Status', value: [] });
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
      });
  }

  async getCompanySettings() {
    this.showSpinner = true;
    this.manipulatedCompanySettings = [];
    await this._companySettingService.getCompanySettings(this.encryptedUser, this.user.cLPCompanyID)
      .then((result: CompanySettingListResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          var listCompany: any = response.companySettings;
          this.manipulatedCompanySettings = this._localService.convertAnyDictionaryToAnyType(listCompany);
          this.manipulatedCompanySettings?.forEach(companySetting => {
            var companyKeySplit = companySetting?.key?.split(':');
            companySetting.tableName = companyKeySplit[0];
            companySetting.title = companyKeySplit[1];
          });
          this.manipulatedCompanySettings?.forEach(company => company.value.sort((a, b) => (a.sOrder > b.sOrder) ? 1 : -1));
          this.showSpinner = false;
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
      });
  }

  expendStrip(name, type?) {

    if (type) {
      this.isExpdContactSetup = false; this.isExpdLeadSetup = false; this.isExpdCompanySetup = false;
      switch (type) {
        case "appt":
          name != this.expdTypeApptName ? this.isExpdTypeAppt = true : this.isExpdTypeAppt = !this.isExpdTypeAppt;
          this.expdTypeApptName == name ? this.expdTypeApptName = '' : this.expdTypeApptName = name;
          break;
        case "contact":
          name != this.expdTypeContactName ? this.isExpdTypeContact = true : this.isExpdTypeContact = !this.isExpdTypeContact;
          this.expdTypeContactName == name ? this.expdTypeContactName = '' : this.expdTypeContactName = name;
          break;
        case "lead":
          name != this.expdTypeLeadName ? this.isExpdTypeLead = true : this.isExpdTypeLead = !this.isExpdTypeLead;
          this.expdTypeLeadName == name ? this.expdTypeLeadName = '' : this.expdTypeLeadName = name;
          break;
        case "company":
          name != this.expdTypeCompanyName ? this.isExpdTypeCompany = true : this.isExpdTypeCompany = !this.isExpdTypeCompany;
          this.expdTypeCompanyName == name ? this.expdTypeCompanyName = '' : this.expdTypeCompanyName = name;
          break;
      }
    }

  }

  subscribeToEvents() {
    this._localService.handleContactSettings.subscribe(({ value, settingName }) => {
      this._ngZone.run(() => {
        if (settingName === "appt") {
          this.expdTypeApptName = value;
          this.getAppointmentSettings();
        }
        else if (settingName === "lead") {
          this.expdTypeLeadName = value;
          this.getLeadSettings();
        }
        else if (settingName === "company") {
          this.expdTypeCompanyName = value;
          this.getCompanySettings();
        }
        else {
          this.expdTypeContactName = value;
          this.getClassCodes();
        }
      });
    });
  }

  trackBy(index, item) {
    return item.name;
  }

  collapseAll() {
    this.expdTypeLeadName = ''; this.expdTypeContactName = ''; this.expdTypeCompanyName = '';
    this.isExpdTypeLead = false; this.isExpdTypeContact = false; this.isExpdTypeCompany = false;
  }

}
