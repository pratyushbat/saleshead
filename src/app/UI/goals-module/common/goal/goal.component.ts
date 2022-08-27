import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { CLPUser } from '../../../../models/clpuser.model';
import { eDDField, eGoalType, eGoalTypeCategory } from '../../../../models/enum.model';
import { DataList, GoalDisplay, GoalSetup, GoalSetupRespnose } from '../../../../models/goalSetup.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { GoalsService } from '../../../../services/goals.service';
import { NotificationService } from '../../../../services/notification.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';

@Component({
  selector: 'goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.css']
})


export class GoalComponent implements OnInit {

  @Input() dataSource: any[] = [];
  @Input() loggedUser: CLPUser;
  @Input() eGoalType?: eGoalTypeCategory;
  @Input() eDdField?: eDDField;
  @Input() selectedMonth;
  @Input() selectedYear;
  @Input() selectedUser;
  @Input() tableHeading: string;
  encryptedUser: string = "";
  @Input() roleFeaturePermissions?: RoleFeaturePermissions;
  showSpinner: boolean = false;
  goalDisplay: GoalDisplay[];

  @Output() showSectionContact: EventEmitter<boolean> = new EventEmitter();
  @Output() showSectionLead: EventEmitter<boolean> = new EventEmitter();
  @Output() showSectionGeneral: EventEmitter<boolean> = new EventEmitter();

  constructor(private _goalsService: GoalsService,
    private _notifyService: NotificationService,
    public _localService: LocalService) {

  }
  ngOnInit() {
    this.encryptedUser = localStorage.getItem("token");
    this.getGoalList();
  }

  async getGoalList() {
    this.showSpinner = true;
    await this._goalsService.getGoalList(this.encryptedUser, this.selectedUser, 0, this.eGoalType, this.eDdField, this.selectedMonth, this.selectedYear)
      .then(async (result: GoalDisplay[]) => {
        if (result) {
          this.showSpinner = false;
          var response = UtilityService.clone(result);
          this.goalDisplay = response;
          if (this.goalDisplay.length > 0) {
            this.showSectionContact.emit(true);
            this.showSectionLead.emit(true);
            this.showSectionGeneral.emit(true);
          }
          else {
            this.showSectionContact.emit(false);
            this.showSectionLead.emit(false);
            this.showSectionGeneral.emit(false);
          }
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log('error in saving setting code' + err);
      });
  }

}
