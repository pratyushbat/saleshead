import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, OnInit, Output } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { CLPUser } from '../../../../models/clpuser.model';
import { eDDField, eGoalType } from '../../../../models/enum.model';
import { DataList, GoalData, GoalSetup, GoalSetupRespnose, GoalsGeneric } from '../../../../models/goalSetup.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { GoalsService } from '../../../../services/goals.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'goal-setup-list',
  templateUrl: './goal-setup-list.component.html',
  styleUrls: ['./goal-setup-list.component.css']
})

export class GoalSetupListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() sectionHeading: string;
  @Input() loggedUser: CLPUser;
  encryptedUser: string = "";
  @Input() roleFeaturePermissions?: RoleFeaturePermissions;
  showSpinner: boolean = false;

  /*General*/
  generalGoal: GoalSetup[];
  eGoalGeneral: eGoalType = eGoalType.None;

  /*General Appointment*/
  eGoalApptGeneral: eGoalType = eGoalType.ApptGeneralType;
  eDDFieldsAppGeneral: eDDField = eDDField.ApptGeneralTypeCode;
  generalAppointmentGoal: DataList[];

  /*Contact Appointment*/
  eContactApptType: eGoalType = eGoalType.ApptContactType;
  eDDFieldContactAppt: eDDField = eDDField.ApptContactTypeCode;
  contactAppointmentGoal: DataList[];

  /*Contact Status*/
  eContactApptSta: eGoalType = eGoalType.Class1Code;
  eContactSta: eDDField = eDDField.Class1Code;
  contactStatusGoal: DataList[];

  /*Contact Prospect  Status*/
  eContactApptProsSta: eGoalType = eGoalType.Class2Code;
  eDDFieldContactProsSta: eDDField = eDDField.Class2Code;
  contactProsStatusGoal: DataList[];

  /*Contact: Agreement Type*/
  eContactAggr: eGoalType = eGoalType.Class3Code;
  eDDFieldContactAggr: eDDField = eDDField.Class3Code;
  contactAggrGoal: DataList[];

  /*Contact: Referral Source Type*/
  eContactRef: eGoalType = eGoalType.Class4Code;
  eDDFieldContactRef: eDDField = eDDField.Class4Code;
  contactRefGoal: DataList[];

  /*Contact: Location of Interest*/
  eContactLOI: eGoalType = eGoalType.Class5Code;
  eDDFieldContactLOI: eDDField = eDDField.Class5Code;
  contactLOIGoal: DataList[];

  /*Contact: Objections*/
  eContactObject: eGoalType = eGoalType.Class6Code;
  eDDFieldContactObject: eDDField = eDDField.Class6Code;
  contactObjectGoal: DataList[];

  /*Contact: Ad/Marketing Channel*/
  eContactMarket: eGoalType = eGoalType.Class7Code;
  eDDFieldContactMarket: eDDField = eDDField.Class7Code;
  contactMarketGoal: DataList[];

  /*Lead Appointment*/
  eLeadApptType: eGoalType = eGoalType.ApptLeadType;
  eDDFieldLeadAppt: eDDField = eDDField.ApptLeadTypeCode;
  leadAppointmentGoal: DataList[];

  /*Lead Status*/
  eLeadStatus: eGoalType = eGoalType.LeadClass1Code;
  eDDFieldLeadSta: eDDField = eDDField.LeadClass1Code;
  leadStatusGoal: DataList[];

  /*Lead: Rollout Phases 1 */
  eLeadRollOut: eGoalType = eGoalType.LeadClass2Code;
  eDDFieldLeadRollOut: eDDField = eDDField.LeadClass2Code;
  leadRollOutGoal: DataList[];

  finalGoals: GoalsGeneric[] = [];
  private saveClickedSubscription: Subscription;

  @Input() buttonSave: Observable<void>;
  disableSaveButton: boolean = false;
  goalDataList: GoalData[] = [];

  @Output() onSaveGoals = new EventEmitter<boolean>();

  ngAfterViewInit(): void {
    this.saveClickedSubscription = this.buttonSave?.subscribe(() => this.submitGoalForm());
  }

  ngOnInit() {

    this.encryptedUser = localStorage.getItem("token");
    this.getSectionDetails();
  }

  ngOnDestroy() {
    this.saveClickedSubscription?.unsubscribe();
  }

  constructor(private _goalsService: GoalsService,
    private _notifyService: NotificationService,
    public _localService: LocalService) {

  }


  getSectionDetails() {
    switch (this.sectionHeading) {
      case 'General Related Goals': {
        this.getGeneralGoals().subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.generalGoal = value;
            this.finalGoals.push({ sectionName: 'General', goals: this.generalGoal });
          }
        });
        this.showSpinner = true;
        this.getMonthlyGoal(this.eDDFieldsAppGeneral, this.eGoalApptGeneral).subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.generalAppointmentGoal = value;
            this.generalAppointmentGoal.sort((a, b) => parseFloat(a.sOrder) - parseFloat(b.sOrder));
            this.finalGoals.push({ sectionName: 'General Appointment Type', goals: this.generalAppointmentGoal });
            this.showSpinner = false;
          }
        });
        break;
      }
      case 'Contact Related Goals': {

        this.showSpinner = true;
        this.getMonthlyGoal(this.eDDFieldContactAppt, this.eContactApptType).subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.contactAppointmentGoal = value;
            this.contactAppointmentGoal.sort((a, b) => parseFloat(a.sOrder) - parseFloat(b.sOrder));
            this.finalGoals.splice(0, 0, { sectionName: 'Contact Appointment Type', goals: this.contactAppointmentGoal });
            this.showSpinner = false;
          }
          else {
            this._notifyService.showError('Could not find Contact Appointment Type', 'Contact Appointment Type', 1000);
          }
        });

        this.getMonthlyGoal(this.eContactSta, this.eContactApptSta).subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.contactStatusGoal = value;
            this.contactStatusGoal.sort((a, b) => parseFloat(a.sOrder) - parseFloat(b.sOrder));
            this.finalGoals.splice(1, 0, { sectionName: 'Contact: Status', goals: this.contactStatusGoal });
          }
          else {
            this._notifyService.showError('Could not find Contact Status', 'Contact Status', 1000);
          }
        });

        this.getMonthlyGoal(this.eDDFieldContactProsSta, this.eContactApptProsSta).subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.contactProsStatusGoal = value;
            this.contactProsStatusGoal.sort((a, b) => parseFloat(a.sOrder) - parseFloat(b.sOrder));
            this.finalGoals.splice(2, 0, { sectionName: 'Contact:Prospect Status', goals: this.contactProsStatusGoal });
          }
          else {
            this._notifyService.showError('Could not find Contact:Prospect Status', 'Contact Prospect Status', 1000);
          }
        });

        this.getMonthlyGoal(this.eDDFieldContactAggr, this.eContactAggr).subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.contactAggrGoal = value;
            this.contactAggrGoal.sort((a, b) => parseFloat(a.sOrder) - parseFloat(b.sOrder));
            this.finalGoals.splice(3, 0, { sectionName: 'Contact:Agreement Type', goals: this.contactAggrGoal });
          }
          else {
            this._notifyService.showError('Could not find Contact:Agreement Type Status', 'Contact:Agreement Type Status', 1000);
          }
        });

        this.getMonthlyGoal(this.eDDFieldContactRef, this.eContactRef).subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.contactRefGoal = value;
            this.contactRefGoal.sort((a, b) => parseFloat(a.sOrder) - parseFloat(b.sOrder));
            this.finalGoals.splice(4, 0, { sectionName: 'Contact:Referral Source Type', goals: this.contactRefGoal });
          }
          else {
            this._notifyService.showError('Could not find Referral Source Type Status', 'Referral Source Type Status', 1000);
          }
        });

        this.getMonthlyGoal(this.eDDFieldContactLOI, this.eContactLOI).subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.contactLOIGoal = value;
            this.contactLOIGoal.sort((a, b) => parseFloat(a.sOrder) - parseFloat(b.sOrder));
            this.finalGoals.splice(5, 0, { sectionName: 'Contact:Location of Interest', goals: this.contactLOIGoal });
          }
          else {
            this._notifyService.showError('Could not find Referral Source Type Status', 'Referral Source Type Status', 1000);
          }
        });

        this.getMonthlyGoal(this.eDDFieldContactObject, this.eContactObject).subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.contactObjectGoal = value;
            this.contactObjectGoal.sort((a, b) => parseFloat(a.sOrder) - parseFloat(b.sOrder));
            this.finalGoals.splice(6, 0, { sectionName: 'Contact:Objections', goals: this.contactObjectGoal });
          }
          else {
            this._notifyService.showError('Could not find Referral Source Type Status', 'Referral Source Type Status', 1000);
          }
        });

        this.getMonthlyGoal(this.eDDFieldContactMarket, this.eContactMarket).subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.contactMarketGoal = value;
            this.contactMarketGoal.sort((a, b) => parseFloat(a.sOrder) - parseFloat(b.sOrder));
            this.finalGoals.splice(7, 0, { sectionName: 'Contact:Ad/Marketing Channel', goals: this.contactMarketGoal });
          }
          else {
            this._notifyService.showError('Could not find Referral Source Type Status', 'Referral Source Type Status', 1000);
          }
        });


        break;
      }
      case 'Lead Related Goals': {
        this.getMonthlyGoal(this.eDDFieldLeadAppt, this.eLeadApptType).subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.leadAppointmentGoal = value;
            this.leadAppointmentGoal.sort((a, b) => parseFloat(b.sOrder) - parseFloat(a.sOrder));
            this.finalGoals.splice(0, 0, { sectionName: 'Lead Appointment Type', goals: this.leadAppointmentGoal });
          }
          else {
            this._notifyService.showError('Could not find Lead Appointment Type', 'Lead Appointment Type', 1000);
          }
        });
        this.showSpinner = true;
        this.getMonthlyGoal(this.eDDFieldLeadSta, this.eLeadStatus).subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.leadStatusGoal = value;
            this.leadStatusGoal.sort((a, b) => parseFloat(b.sOrder) - parseFloat(a.sOrder));
            this.finalGoals.splice(1, 0, { sectionName: 'Lead Status', goals: this.leadStatusGoal });
            this.showSpinner = false;
          }
          else {
            this._notifyService.showError('Could not find Lead Status', 'Lead Status', 1000);
          }
        });

        this.getMonthlyGoal(this.eDDFieldLeadRollOut, this.eLeadRollOut).subscribe((value: any) => {
          if (!isNullOrUndefined(value)) {
            this.leadRollOutGoal = value;
            this.leadRollOutGoal.sort((a, b) => parseFloat(b.sOrder) - parseFloat(a.sOrder));
            this.finalGoals.splice(2, 0, { sectionName: 'Lead: Rollout Phases 1', goals: this.leadRollOutGoal });
          }
          else {
            this._notifyService.showError('Could not find Lead Rollout', 'Lead Rollout', 1000);
          }
        });

        break;
      }
      default: {
      }

    }
  }

  activateRowGeneral(goalRes, generalGoal, i: number) {
    if (goalRes.active) {
      generalGoal[i].goal = 0;
      generalGoal[i].showInSummary = false;
    }
    generalGoal[i].active = !goalRes.active;
  }

  getGeneralGoals() {
    return new Observable(observer => {
      this._goalsService.getGeneralData(this.encryptedUser, this.loggedUser.cLPUserID, this.eGoalGeneral)
        .then(async (result: GoalSetupRespnose) => {
          if (result) {
            this.showSpinner = true;
            var response = UtilityService.clone(result);
            if (!isNullOrUndefined(response)) {
              observer.next(response?.goalResponse);
            }
            else {
              console.log('Null in general data Goals');
              this._notifyService.showError('Could not get Goals', 'Goals Error', 1000);
            }
          }
          this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          this.showSpinner = false;
          console.log('error in saving setting code' + err);
        });
    });
  }

  getMonthlyGoal(eDdFieldGeneric: eDDField, eGoalTypeGeneric: eGoalType) {
    return new Observable(observer => {
      this._goalsService.getApptGeneral(this.encryptedUser, this.loggedUser.cLPUserID, this.loggedUser.cLPCompanyID, eDdFieldGeneric, eGoalTypeGeneric)
        .then(async (result: GoalSetupRespnose) => {
          if (result) {
            var response = UtilityService.clone(result);
            observer.next(response?.goalAPTResponse);
          }
          else {
            this.showSpinner = false;
          }
        })
        .catch((err: HttpErrorResponse) => {
          this.showSpinner = false;
          console.log('error in saving monthly goal' + err);
        });
    });
  }

  submitGoalForm() {
    this.goalDataList = [];
    this.finalGoals?.forEach((goal) => {

      if (goal.sectionName === "General") {
        goal?.goals?.forEach((goalValue, id) => {
          var goalData: GoalData = <GoalData>{};
          goalData = this.copyGoalDataGeneral(goalValue, goalData, id);
          this.goalDataList.push(goalData);
        });

      }
      else {
        goal?.goals?.forEach((goalValue) => {
          var goalData: GoalData = <GoalData>{};
          goalData = this.copyGoalData(goalValue, goalData, goal.sectionName);
          this.goalDataList.push(goalData);
        })
      }

    });
    this.goalDataList = this.goalDataList.filter(val => val.goal > 0);
    this.saveGoals();


  }
  copyGoalData(goalData: DataList, objGoalData: GoalData, sectonName: string): GoalData {
    objGoalData.clpCompanyId = goalData.clpCompanyId ? goalData.clpCompanyId : this.loggedUser.cLPCompanyID;
    objGoalData.clpUserId = this.loggedUser.cLPUserID;
    objGoalData.goal = goalData.goal;
    objGoalData.goalId = goalData.goalId;
    objGoalData.showInSummary = goalData.showInSummary;
    objGoalData.sOrder = goalData.sOrder;
    objGoalData.ownerId = goalData.typeCode;
    switch (sectonName) {
      case 'General Appointment Type': {
        objGoalData.goalType = this.eGoalApptGeneral;
        break;
      }
      case 'Contact Appointment Type': {
        objGoalData.goalType = this.eContactApptType;
        break;
      }
      case 'Contact: Status': {
        objGoalData.goalType = this.eContactApptSta;
        break;
      }
      case 'Contact:Prospect Status': {
        objGoalData.goalType = this.eContactApptProsSta;
        break;
      }
      case 'Contact:Agreement Type': {
        objGoalData.goalType = this.eContactAggr;
        break;
      }
      case 'Contact:Referral Source Type': {
        objGoalData.goalType = this.eContactRef;
        break;
      }
      case 'Contact:Location of Interest': {
        objGoalData.goalType = this.eContactLOI;
        break;
      }
      case 'Contact:Objections': {
        objGoalData.goalType = this.eContactObject;
        break;
      }
      case 'Contact:Ad/Marketing Channel': {
        objGoalData.goalType = this.eContactMarket;
        break;
      }
      case 'Lead Appointment Type': {
        objGoalData.goalType = this.eLeadApptType;
        break;
      }
      case 'Lead Status': {
        objGoalData.goalType = this.eLeadStatus;
        break;
      }
      case 'Lead: Rollout Phases 1': {
        objGoalData.goalType = this.eLeadRollOut;
        break;
      }
      default: {
        objGoalData.goalType = this.eGoalApptGeneral;
      }
    }


    return objGoalData;
  }

  copyGoalDataGeneral(goalData: GoalSetup, objGoalData: GoalData, id: number) {
    objGoalData.clpCompanyId = this.loggedUser.cLPCompanyID;
    objGoalData.clpUserId = this.loggedUser.cLPUserID;
    objGoalData.goal = goalData.goal;
    objGoalData.goalId = goalData.goalId;
    objGoalData.showInSummary = goalData.showInSummary;
    objGoalData.goalType = goalData.goalType;
    objGoalData.ownerId = 0;

    objGoalData.sOrder = '' + ++id;
    return objGoalData;
  }

  setButtonDisable(model) {
    this.disableSaveButton = model.invalid;
  }

  async saveGoals() {
    this.goalDataList.filter
    this.showSpinner = true;
    await this._goalsService.saveGoal(this.encryptedUser, this.goalDataList)
      .then(async (result: boolean) => {
        if (result) {
          console.log(result);
          if (result) {
            this.onSaveGoals.emit(true);
            this._notifyService.showSuccess('Saved Goals Successfully', 'Saved Goals', 2000);
          }

        }
        this.showSpinner = false;

      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log('error in saving monthly goal' + err);
      });
  }

}


