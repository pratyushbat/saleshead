import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { CreateFormGroupArgs, DateChangeEvent, SchedulerComponent, SchedulerEvent, ToolbarService } from '@progress/kendo-angular-scheduler';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../../models/clpuser.model';
import { RoleFeaturePermissions } from '../../../../models/roleContainer.model';
import { Task } from '../../../../models/task.model';
import { UtilityService } from '../../../../services/shared/utility.service';
import { MyCalenderService } from '../../../../services/my-calender.service';
import { ApptData, CalenderFiltersResponse, CalenderResponse, PhoneData, SchedulerCal, TaskData, WeekViewDisplay } from '../../../../models/calender.model';
import { DropDownItem, SimpleResponse } from '../../../../models/genericResponse.model';
import { DatePipe } from '@angular/common';
import { eApptCategory, eApptStatus, eCalenderView, eFeatures, eMailingStatus, eUserRole } from '../../../../models/enum.model';
import { keyValue } from '../../../../models/search.model';
import { LocalService } from '../../../../services/shared/local.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;
enum EditMode {
  Event,
  Occurrence,
  Series,
}
@Component({
  selector: 'my-calender',
  templateUrl: './my-calender.component.html',
  styleUrls: ['./my-calender.component.css']
})
export class MyCalenderComponent implements OnInit, OnDestroy, AfterViewInit {

  showTaskDayDetails: boolean = false;
  @Input() public selectedDate: Date = new Date();
  public selectedDate2: Date = new Date();
  public firstDate: Date = new Date();
  public currSelectedDate: Date = new Date();
  public focusedDate: Date = new Date(1900, 1, 1);
  public events: SchedulerEvent[] = [];
  editMode = EditMode.Event;
  public formGroup: FormGroup;
  showSpinner: boolean = false;
  private encryptedUser: string = '';
  @Input() user: CLPUser;
  @Input() roleFeaturePermissions: RoleFeaturePermissions;
  @ViewChild("scheduler") scheduler: SchedulerComponent;
  taskListResponse: CalenderResponse;
  tasks: Task[];
  notesVar: Task[];
  @Output() isShowFirstMonth: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  @Output() showOnMonth: EventEmitter<boolean> = new EventEmitter<boolean>(true);
  @Output() nextMonthDate: EventEmitter<Date> = new EventEmitter<any>();
  @Input() isShowTwoMonthBtn: boolean = true;
  selectedDay: DropDownItem = null;
  dateDropDown: DropDownItem[];
  runOnce: number = 0;
  selectedView: number = 2;
  runOnceCopy: number = 0;
  existingSelDate: Date;
  existingSelDateCopy: Date;
  dayViewListResponse: CalenderResponse;
  initNotesVar: ApptData[] = [];
  showView: number;
  changeFromCopyCal: boolean = false;
  isMonth: boolean = true;
  isFirstCalender: boolean = true;
  taskDataByTeamOffice: TaskData[] = [];
  showFilter: boolean = false;
  calenderFilterResponse: CalenderFiltersResponse;
  officeCodeList: keyValue[];
  teamCodeList: keyValue[];
  userList: keyValue[];
  taskStatusList: any = eMailingStatus;
  taskStatusL;
  currentEventId: number;
  weekViewListResponse: CalenderResponse;
  weekinitNotesVar: ApptData[];
  weekTaskData: TaskData[];
  weekTaskDataDisplay: WeekViewDisplay[] = [];
  dateSelectedDD: any;
  dtWeekStart: Date;
  dtWeekEnd: Date;
  selectedTask: Task = null;
  userResponse: UserResponse;
  count: number = 0;
  filterForm = new FormGroup({});

  @ViewChild('formFilterRef')
  formFilterRef: FormGroupDirective;
  calenderInitialFilters: { status: number, team: number, office: number, user: number } = { status: 0, team: 0, office: 0, user: 0 }
  phoneDayData: PhoneData[];
  weekPhoneData: PhoneData[];
  phoneDayCall: PhoneData;
  lastSelectedDateResponse: SimpleResponse;
  imgCalIconPersonal: string = "<img src='../../../../../assets/trans1x1.gif' class='caliconpersonal' border=0 />"
  imgCalIconCompany: string = "<img  src='../../../../../assets/trans1x1.gif' class='caliconcompany' border=0 />"
  imgCalIconContact: string = "<img  src='../../../../../assets/trans1x1.gif' class='caliconcontact' border=0 />"
  imgCalIconLead: string = "<img src='../../../../../assets/trans1x1.gif' class='caliconlead' border=0 />"
  imgCalIconMeeting: string = "<img  src='../../../../../assets/trans1x1.gif' class='caliconmeeting' border=0 />"
  imgCalIconOtherUser: string = "<img src='../../../../../assets/trans1x1.gif' class='caliconotheruser' border=0 />"

  ngAfterViewInit() {
    this.selectedView = 2;
    this.scheduler.editable = { remove: false, drag: false, resize: false, add: false, edit: false };
    this.selectedDate2.setDate(1);
    this.selectedDate2.setMonth(this.selectedDate.getMonth() + 1);
    setTimeout(() => { this.isFirstCalender = false }, 6000);
  }

  prepareFilterForm() {
    return this.fb.group({
      status: new FormControl(0),
      team: new FormControl(0),
      office: new FormControl(0),
      user: new FormControl(0)

    });
  }
  convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('-')
  }

  ngOnInit() {
    this.isFirstCalender = true;
    this.loadCalenderGlobal();
  }

  loadCalenderGlobal() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          this.getTaskFilters();
          this.copyValueFromFilterForm();
          var selDateResponse: SimpleResponse = <SimpleResponse>{};
          this.getDetailedTasksList(selDateResponse, 'Month');
          this.taskStatusList = this._localService.convertDictionaryToAnyType(this.taskStatusList);
          this.taskStatusList = this.taskStatusList.filter(a => !isNaN(a.key));
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    if (!isNullOrUndefined(this.user)) {
      this.showSpinner = false;
    }
    else {
      this.showSpinner = true;
      await this._localService.authenticateUser(this.encryptedUser, eFeatures.MyCalender)
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
    }
    callback();
  }
  ngOnDestroy(): void {
    this.scheduler.selectedViewIndexChange.unsubscribe();
    this.scheduler.dateChange.unsubscribe();
  }

  twoMonthView() {
    this.showOnMonth.emit(true);
    setTimeout(() => {
      this.changeFromCopyCal = false;
      this.nextMonthDate.emit(new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, this.selectedDate.getDate()));
      this.selectedDate2.setMonth(this.selectedDate2.getMonth() + 1);
    }, 200);
  }

  public createFormGroup(args: CreateFormGroupArgs): FormGroup {
    const dataItem = args.dataItem;
    const isOccurrence = args.mode === 0;
    const exceptions = isOccurrence ? [] : dataItem.recurrenceExceptions;
    this.formGroup = this.fb.group({
      id: args.isNew ? this.getNextId() : dataItem.id,
      start: [dataItem.start, Validators.required],
      end: [dataItem.end, Validators.required],
      startTimezone: [dataItem.startTimezone],
      endTimezone: [dataItem.endTimezone],
      isAllDay: dataItem.isAllDay,
      title: dataItem.title,
      description: dataItem.description,
      recurrenceRule: dataItem.recurrenceRule,
      recurrenceId: dataItem.recurrenceId,
      recurrenceExceptions: [exceptions],
    });
    return this.formGroup;
  }

  public getNextId(): number {
    const len = this.events.length;
    return len === 0 ? 1 : this.events[this.events.length - 1].id + 1;
  }

  constructor(private fb: FormBuilder, private _utilityService: UtilityService, private cdRef: ChangeDetectorRef, public datepipe: DatePipe,
    private _localService: LocalService, private _myCalenderService: MyCalenderService, public toolbarService: ToolbarService, private _router: Router, private _sanitizer: DomSanitizer) {
    if (this._router.url.match('calender')) { this._localService.isMenu = true; }
  }

  onDateChange(args: DateChangeEvent) {
    this.firstDate = args.dateRange.start;
    this.changeFromCopyCal = false;
    this.showOnMonth.emit(false);
    if (this.currSelectedDate < args.selectedDate || this.currSelectedDate > args.selectedDate) {
      this.selectedDate = args.selectedDate;
      var selDateResponse: SimpleResponse = <SimpleResponse>{};
      selDateResponse.messageString = this.selectedDate.toDateString();
      this.lastSelectedDateResponse = selDateResponse;
      this.getDetailedTasksList(selDateResponse, 'Month')
      this.currSelectedDate = new Date(args.selectedDate.getFullYear(), args.selectedDate.getMonth(), args.selectedDate.getDate(), 0, 0, 0);
    }
  }

  onDateChangeCon(args: DateChangeEvent) {
    this.selectedDate2 = args.selectedDate;
    setTimeout(() => { this.changeFromCopyCal = true; }, 50);
  }

  async getTaskFilters() {
    this.showSpinner = true;
    await this._myCalenderService.calenderFilters(this.encryptedUser, this.user.cLPUserID, this.user.cLPCompanyID)
      .then(async (result: CalenderFiltersResponse) => {
        if (result) {
          this.calenderFilterResponse = UtilityService.clone(result);
          this.officeCodeList = this.calenderFilterResponse?.filterOffice;
          this.teamCodeList = this.calenderFilterResponse?.filterTeam;
          this.userList = this.calenderFilterResponse?.filterUsers;
          this.filterForm = this.prepareFilterForm();
          Object.keys(this.filterForm.controls).forEach((keyControl: string) => {
            this.preparePatchFilterFormControlValue(keyControl, 0)
          });
          this.filterForm.get('user').setValue(this.user.cLPUserID);
        }
        this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  subscribeToEvents() {
    this.scheduler.selectedViewIndexChange.subscribe(data => {
      this.showOnMonth.emit(false);
      if (data <= 1) {
        this.showFilter = false;
        this.showView = data;
        this.selectedTask = null;
        this.showTaskDayDetails = true;
        this.isShowFirstMonth.emit(true);
        this.cdRef.detectChanges();
      }
      else {
        this.showTaskDayDetails = false;
        this.isShowFirstMonth.emit(false);
        this.cdRef.detectChanges();
      }

      this.runOnce = 0;
    });

    this.scheduler.dateChange.subscribe(data => {
      if (this.scheduler.selectedViewIndex <= 1) {
        this.showView = this.scheduler.selectedViewIndex;
        this.runOnce++;
        if (!isNullOrUndefined(this.existingSelDate) && this.scheduler.selectedDate != this.existingSelDate)
          this.runOnce = 0;

        if (this.runOnce <= 1 && this.scheduler.selectedDate != this.existingSelDate) {
          this.showView = this.scheduler.selectedViewIndex;
          this.existingSelDate = this.scheduler.selectedDate;
          var selDateOfMonth = this.datepipe.transform((new Date(this.scheduler.selectedDate)), 'MM/dd/yyyy hh:mm:ss');
          var selDateResponse: SimpleResponse = <SimpleResponse>{};
          selDateResponse.messageString = selDateOfMonth;
          this.lastSelectedDateResponse = selDateResponse;
          this.copyValueFromFilterForm();
          this.getDetailedTasksList(selDateResponse, 'Day');
          this.getDetailedTasksList(selDateResponse, 'Week');
          this.cdRef.detectChanges();
        }
        else if (this.runOnce == 2)
          this.cdRef.detectChanges();
      }
      else {

      }

    });

  }

  async getDetailedTasksList(selDateResponse: SimpleResponse, type: string) {
    this.showFilter = false;

    if (type == 'Day') {
      this.showSpinner = true;
      await this._myCalenderService.calenderDataGet(this.encryptedUser, this.user.cLPUserID, this.user.cLPCompanyID, this.calenderInitialFilters.team, this.calenderInitialFilters.office, "1", eCalenderView.Day, this.filterForm.get('user') ? this.filterForm.get('user').value : this.user.cLPUserID, eMailingStatus.Pending, eApptStatus.Pending, this.calenderInitialFilters.status, selDateResponse)
        .then(async (result: CalenderResponse) => {
          if (result) {
            this.dayViewListResponse = UtilityService.clone(result);
            this.initNotesVar = this.dayViewListResponse?.apptData;
            this.taskDataByTeamOffice = this.dayViewListResponse?.taskData;
            this.phoneDayData = this.dayViewListResponse?.phoneData;
            if (!isNullOrUndefined(this.currSelectedDate) && !isNullOrUndefined(this.taskListResponse?.phoneData)) {
              var getTaskDay = this.getPhoneDataForSelectedDate(this.currSelectedDate);
              if (getTaskDay?.length > 0)
                this.phoneDayCall = getTaskDay[0];
              else
                this.phoneDayCall = null;
            }
          }
          this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });
    }
    else if (type == 'Week') {
      this.showSpinner = true;
      await this._myCalenderService.calenderDataGet(this.encryptedUser, this.user.cLPUserID, this.user.cLPCompanyID, this.calenderInitialFilters.team, this.calenderInitialFilters.office, "1", eCalenderView.Week, this.filterForm?.get('user') ? this.filterForm?.get('user').value : this.user.cLPUserID, eMailingStatus.Pending, eApptStatus.Pending, this.calenderInitialFilters.status, selDateResponse)
        .then(async (result: CalenderResponse) => {
          if (result) {
            this.weekTaskDataDisplay = [];
            this.weekViewListResponse = UtilityService.clone(result);
            this.weekinitNotesVar = this.weekViewListResponse?.apptData;
            this.weekTaskData = this.weekViewListResponse?.taskData;
            this.weekPhoneData = this.weekViewListResponse?.phoneData;
            this.dtWeekStart = this.setStartDateToSunday(this.changeFromCopyCal ? this.selectedDate2 : this.selectedDate, this.changeFromCopyCal ? this.selectedDate2.getDay() : this.selectedDate.getDay());
            this.dtWeekEnd = new Date(this.dtWeekStart.getTime());;
            this.dtWeekEnd = new Date(this.dtWeekEnd.setDate(this.dtWeekStart.getDate() + 7));
            var dateRange: any[] = this.getDatesInRange(this.dtWeekStart, this.dtWeekEnd);
            dateRange.forEach(val => {
              var weekTaskDataDisp: WeekViewDisplay = <WeekViewDisplay>{};
              weekTaskDataDisp.dispDate = val;
              weekTaskDataDisp.taskData = this.getTaskDataForSelectedDate(val);
              weekTaskDataDisp.apptData = this.getAppointmentDataForSelectedDate(val);
              weekTaskDataDisp.phoneData = this.getPhoneDataForSelectedDate(val);
              this.weekTaskDataDisplay.push(weekTaskDataDisp);
            });
          }
          this.showSpinner = false;
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });
    }
    else if (type == 'Month') {
      this.showSpinner = true;
      await this._myCalenderService.calenderDataGet(this.encryptedUser, this.user.cLPUserID, this.user.cLPCompanyID, this.calenderInitialFilters.team, this.calenderInitialFilters.office, "1", eCalenderView.Month, this.calenderInitialFilters.user, this.calenderInitialFilters.status, this.calenderInitialFilters.status, this.calenderInitialFilters.status, selDateResponse)
        .then(async (result: CalenderResponse) => {
          if (result) {
            this.currentEventId = 0;
            this.taskListResponse = UtilityService.clone(result);
            await this.fillCalenderData();
            this.subscribeToEvents();
            this.showSpinner = false;
          }
        })
        .catch((err: HttpErrorResponse) => {
          this.showSpinner = false;
          this._utilityService.handleErrorResponse(err);
        });
    }
  }

  async fillCalenderData() {
    this.events = [];
    if (isNullOrUndefined(this.dateDropDown))
      this.dateDropDown = this.taskListResponse?.dropDownItem;
    this.taskListResponse?.taskCount?.forEach((elem, i) => {
      var event1: SchedulerEvent = <SchedulerEvent>{};
      event1.id = i + 1;
      this.currentEventId = i + 1;
      event1.title = elem.count + ' pending task';
      event1.description = "task";
      event1.start = new Date(elem.year, elem.month - 1, elem.day);
      event1.end = new Date(elem.year, elem.month - 1, elem.day);
      event1.isAllDay = false;
      event1.dataItem = elem;
      this.events.push(event1);

    });

    this.taskListResponse?.apptData?.forEach((elem, i) => {
      var event1: SchedulerEvent = <SchedulerEvent>{};
      event1.id = this.currentEventId + i + 1;
      event1.title = elem.subject;
      event1.description = "appt";
      event1.start = new Date(elem.apptStartTime);
      event1.end = new Date(elem.apptEndTime);
      event1.isAllDay = false;
      event1.dataItem = elem;
      this.events.push(event1);
    });

    this.taskListResponse?.phoneData?.forEach((elem, i) => {
      var event1: SchedulerEvent = <SchedulerEvent>{};
      event1.id = this.currentEventId + i + 1;
      this.currentEventId = i + 1;
      event1.title = elem.count + ' pending call';
      event1.description = "call";
      event1.start = new Date(elem.year, elem.month - 1, elem.day);
      event1.end = new Date(elem.year, elem.month - 1, elem.day);
      event1.isAllDay = false;
      event1.dataItem = elem;
      this.events.push(event1);
    });

    this.setCalenderEvents();
  }

  setCalenderEvents() {
    var height = 60;
    var counts: SchedulerCal[];

    counts = Object.values(this.events.reduce((r, e) => {
      let k = `${this.datepipe.transform(e.start, 'MM/dd/yyyy')}`;
      if (!r[k]) r[k] = { ...e, count: 1 }
      else r[k].count = r[k].count + 1;
      return r;

    }, {}));

    var byWeek = [];
    var weekStart = new Date(this.firstDate);
    var weekEnd = new Date(this.firstDate.getFullYear(), this.firstDate.getMonth(), this.firstDate.getDate() - 1);
    for (let i = 0; i < 6; i++) {
      weekStart = i != 0 ? new Date(weekStart.setDate(weekStart.getDate() + 7)) : weekStart
      weekEnd = new Date(weekEnd.setDate(weekEnd.getDate()+ 7))
      byWeek.push(counts.filter(item => item.start > weekStart && item.start < weekEnd));
    }
    if (!this.isShowTwoMonthBtn)
      var box = (<HTMLInputElement>document.getElementsByClassName('k-scheduler-table')[3]);
    else 
      var box = (<HTMLInputElement>document.getElementsByClassName('k-scheduler-table')[1]);  

    byWeek.forEach((item, index) => {
      height = Math.max(...item.map(function (ix) { return ix.count; })) * 50 + 60;
      if (!isNullOrUndefined(box?.children[index])) 
        box?.children[index].setAttribute("style", `height:${height}px !important`);
      
    })
  }
  getPhoneDataForSelectedDate(val: Date): PhoneData[] {
    return this.taskListResponse?.phoneData?.filter(data => {
      if (new Date(new Date(data.year, data.month - 1, data.day).toDateString()) > new Date(val.toDateString()))
        return false;
      else if (new Date(new Date(data.year, data.month - 1, data.day).toDateString()) < new Date(val.toDateString()))
        return false;
      else
        return true;
    });
  }

  getTaskDataForSelectedDate(val: Date): TaskData[] {
    return this.weekTaskData.filter(data => {
      if (new Date(new Date(data.reminderTime).toDateString()) > new Date(val.toDateString()))
        return false;
      else if (new Date(new Date(data.reminderTime).toDateString()) < new Date(val.toDateString()))
        return false;
      else
        return true;
    });
  }

  getAppointmentDataForSelectedDate(val: Date): ApptData[] {
    return this.weekinitNotesVar.filter(data => {
      if (new Date(new Date(data.apptStartTime).toDateString()) > new Date(val.toDateString()))
        return false;
      else if (new Date(new Date(data.apptStartTime).toDateString()) < new Date(val.toDateString()))
        return false;
      else
        return true;
    });
  }

  setStartDateToSunday(dtStart, DayOfWeek) {
    switch (DayOfWeek) {
      case 1: dtStart = new Date(dtStart.setDate(dtStart.getDate() - 1)); break;
      case 2: dtStart = new Date(dtStart.setDate(dtStart.getDate() - 2)); break;
      case 3: dtStart = new Date(dtStart.setDate(dtStart.getDate() - 3)); break;
      case 4: dtStart = new Date(dtStart.setDate(dtStart.getDate() - 4)); break;
      case 5: dtStart = new Date(dtStart.setDate(dtStart.getDate() - 5)); break;
      case 6: dtStart = new Date(dtStart.setDate(dtStart.getDate() - 6)); break;
      default:
        break;
    }
    return dtStart;
  }

  getDatesInRange(startDate, endDate) {
    const date = new Date(startDate.getTime());
    const dates = [];
    while (date < endDate) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }

  eventClick(ev) {
  }

  onOptionsSelectedDD(event: DropDownItem) {
    this.selectedDay = event;
    this.dateSelectedDD = event.text;
    this.selectedDate = new Date(event.value);
    var from: string[] = event.value.split("-")
    this.selectedDate = new Date(+from[2], +from[1] - 1, +from[0]);
    this.showOnMonth.emit(false);
    var selDateResponse: SimpleResponse = <SimpleResponse>{};
    selDateResponse.messageString = this.dateSelectedDD;
    this.lastSelectedDateResponse = selDateResponse;
    this.copyValueFromFilterForm();
    this.getDetailedTasksList(selDateResponse, 'Month')
  }

  onClick(args) { }

  onRemove(args) { }
  saveHandler(event) { }
  cancelHandler(event) { }

  callIndex(type) {
    if (type == 'month') {
      this.isShowFirstMonth.emit(false);
      this.scheduler.selectedViewIndex = 2;
      if (this.selectedDate.getHours() < 23)
        this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate(), this.selectedDate.getHours() + 1);
      else
        this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate(), this.selectedDate.getHours() - 1);

      setTimeout(() => { this.fillCalenderData(); }, 300);
    }
    else if (type == 'week')
      setTimeout(() => { this.scheduler.selectedViewIndex = 1; }, 200);
    else
      this.scheduler.selectedViewIndex = 0;
  }


  enableEditTask(task) {
    if (this.selectedTask == task) {
      this.selectedTask = null;
      setTimeout(() => {
        this.selectedTask = task;
      }, 300);
    }
    else
      this.selectedTask = task;
  }

  filterFormSubmit() {
    this.copyValueFromFilterForm();
    var selDateResponse: SimpleResponse = <SimpleResponse>{};
    this.getDetailedTasksList(selDateResponse, 'Month');
  }
  updateFromTask(ev) {
    this.copyValueFromFilterForm();
    this.getDetailedTasksList(this.lastSelectedDateResponse, 'Day');
    this.getDetailedTasksList(this.lastSelectedDateResponse, 'Week');
  }

  copyValueFromFilterForm() {
    this.calenderInitialFilters.office = this.filterForm.get('office') ? this.filterForm.get('office').value : 0;
    this.calenderInitialFilters.team = this.filterForm.get('team') ? this.filterForm.get('team').value : 0;
    this.calenderInitialFilters.status = this.filterForm.get('status') ? this.filterForm.get('status').value : 0;
    this.calenderInitialFilters.user = this.filterForm.get('user') ? this.filterForm.get('user').value : this.user.cLPUserID;
  }

  preparePatchFilterFormControlValue(key, value) {
    if (this.filterForm.get(key))
      this.filterForm.get(key).setValue(value);
  }

  prepareAppoinmentMonthData(dr: ApptData) {
    var eStat: eApptStatus = dr.status;
    var eCat: eApptCategory = dr.category;
    var strSubject = dr.subject;

    var strOut = "";
    var strContact = "";
    var strColorPic = "";
    var strType = "";
    var strStatLink = "";
    var strContactName = "";
    var strOwnerName = "";
    var strUserName = "";
    var strUser = "";
    var viewcpu: CLPUser = this.user;
    var intTypeCode: number = 0;

    var blnIncludeUser = false;;
    if (this.user.teamCode > 0 || this.user.officeCode > 0) {

    }


    switch (eCat) {
      case eApptCategory.Contact:
        intTypeCode = dr.contactTypeCode;
        strContact = dr.contactName;
        strType = ""
        if (intTypeCode > 0)
          strType = dr.codeDisplay;
        break;
      case eApptCategory.Lead:
        intTypeCode = dr.leadTypeCode;
        strContact = dr.contactName;
        if (intTypeCode > 0)
          strType = dr.codeDisplay;
        strColorPic = dr.colorCode
        break;
      case eApptCategory.Company: case eApptCategory.Personal:
        intTypeCode = dr.generalTypeCode;
        if (intTypeCode > 0)
          strType = dr.codeDisplay;
        strColorPic = dr.colorCode
        break;
      default:
        break;

    }

    if (strColorPic != "")
      strColorPic = "<div class='cal-color'><span style='background-color:" + dr?.colorCode + " !important;'" + ">&nbsp;" + "</span></div>";


    if (eStat != eApptStatus.Pending)
      strStatLink = "<a href=" + dr.apptID + " title='" + eStat + "'>" + dr.apptID + "</a>"

    var strTime = new Date(dr.apptStartTime).toLocaleTimeString();
    strContactName = dr.contactName;
    var strToolTip = this.quickToolTipDisplay(strTime, dr.subject, dr.location ? dr.location : "", dr.notes, eCat, strType, strContactName, strOwnerName);
    if (strContact.length > 28)
      strContact = "<span class=smallgreen>" + strContact + "...</span>";
    else
      strContact = "<span style='color:Green;'>" + strContact + "</span>";

    if (strSubject.length > 20)
      strSubject = strSubject + "...";


    if (blnIncludeUser || intCalCLPUserID != viewcpu.cLPUserID)
      strUserName = `User: ${dr.userLastFirst}`;
    if (strUserName.length > 28)
      strUser = "<span class=smallorange>" + strUserName + "...</span>"
    else
      strUser = "<span class='smallorange'>" + strUserName + "</span>"

    /*strUser is omitted below*/

    if (dr.clpUserID == viewcpu.cLPUserID)
      strOut += "<div class='cal-icon'>" + "<a href='" + this.apptWindowLink(dr.apptID, true, true, eApptCategory.None, 0, 0, "cal") + "'" + `title = '${strUserName} ${strToolTip}'` + this.categoryIcon(eCat) + "</a></div>" + "<div class='cal-link'><a href=" + strTime + ">" + "<b>" + strTime + " </b>" + strSubject + "</a>" + strContact + "</div>" + strColorPic + strStatLink;
    else {
      var intCalCLPUserID = this.user.cLPUserID;
      if (intCalCLPUserID == viewcpu.cLPUserID)
        strOut += "<div class='cal-icon'>" + "<a href='" + this.apptWindowLink(dr.apptID, true, true, eApptCategory.None, 0, 0, "cal") + "'"+`title = ${strUserName} ${strToolTip}` + this.categoryIcon(eCat) + "</a></div>" + "<div class='cal-link'><a href=" + strTime + ">" + "<b>" + strTime + " </b>" + strSubject + "</a>" + strContact + "</div>" + strColorPic + strStatLink;
      else {
        var blnShareable: boolean = true;
        strOut += "<div class='cal-icon'>" + "<a href='" + this.apptWindowLink(dr.apptID, true, true, eApptCategory.None, 0, 0, "cal") + "'"+ `title = ${strUserName} ${strToolTip}` + this.categoryIcon(eCat) + "</a></div>" + "<div class='cal-link'><a href=" + strTime + ">" + "<b>" + strTime + " </b>" + "</a>" + strContact + "</div>" + strColorPic + strStatLink;

      }
    }
    var strOutHtml = this._sanitizer.bypassSecurityTrustHtml(strOut);
    return strOutHtml;
  }

  statusIcon(estat: eApptStatus, blnIncludeLink: boolean = true, intApptID: number = 0) {
    if (blnIncludeLink && intApptID > 0) {
      switch (estat) {
        case eApptStatus.Pending:
          return "<a href=" + intApptID + " title='Pending'>" + intApptID + "</a>";
        case eApptStatus.Cancelled:
          return "<a href=" + intApptID + " title='Cancelled'>" + intApptID + "</a>";
        case eApptStatus.Completed, eApptStatus.CompleteAndCampaignStop:
          return "<a href=" + intApptID + " title='Completed'>" + "</a>";
        default:
          return "<a href=" + intApptID + " title='Pending'>" + intApptID + "</a>";
      }
    }
  }


  categoryIcon(ecat: eApptCategory): string {
    switch (ecat) {
      case eApptCategory.Company:
        return this.imgCalIconCompany;
      case eApptCategory.Contact:
        return this.imgCalIconContact;
      case eApptCategory.Lead:
        return this.imgCalIconLead;
      default:
        return this.imgCalIconPersonal;
    }
  }


  apptWindowLink(intApptID: number = 0, blnEditMode: boolean = false, blnIncludeQuotes: boolean = true, eCat: eApptCategory = eApptCategory.None, intOwnerID: number = 0, intMessageID: number = 0, strRedirectCode: string = "", blnOpenCallForm: boolean = false, blnForceGeneralTab: boolean = false, intCASID: number = 0, intBCKID: number = 0) {
    var strWinID: string, strEditMode, strCat: string, strID: string, strMsgID: string, strRDT: string, strCF: string, strFGT: string, strCASID: string, strBCKID: string;
    if (intApptID = 0)
      strWinID = "clpapt" + new Date().toDateString()
    else
      strWinID = "clpapt" + intApptID;
    if (intMessageID = 0)
      strMsgID = ""
    else
      strMsgID = "&msgid=" + intMessageID;

    if (strRedirectCode = "")
      strRDT = ""
    else strRDT = "&rdt=" + strRedirectCode;

    if (blnEditMode == true)
      strEditMode = "&mde=e";
    else
      strEditMode = "";

    if (blnOpenCallForm == true)
      strCF = "&cf=1";
    else
      strCF = "";
    if (intCASID > 0)
      strCASID = "&casid=" + intCASID;
    else strCASID = "";

    if (intBCKID > 0)
      strBCKID = "&bckid=" + intBCKID;
    else
      strBCKID = "";

    if (blnForceGeneralTab == true)
      strFGT = "&fgt=1"
    else
      strFGT = "";
    if (eCat != eApptCategory.None && intOwnerID > 0) {
      strCat = "&cat=" + eCat;
      strID = "&id=" + intOwnerID;
    }
    else {
      strCat = ""
      strID = ""
    }
    return this.openChild("../calendar/clpappt.aspx?flr=1" + strCat + strID + "&aid=" + intApptID + strEditMode + strMsgID + strRDT + strCF + strFGT + strCASID + strBCKID, 900, 700, 1, 1, strWinID, blnIncludeQuotes)
    return "Get user info";
  }
  openChild(strPath: string, intWidth: number, intHeight: number = 600, intScroll: number, intResize: number, strWinName: string, blnIncludeQuotes: boolean): string {

    var strOut: string = "";
    var strQuote: string = "";
    if (strPath.includes("clpemail")) {
      intWidth = 800;
      intHeight = 750;
    }
    if (blnIncludeQuotes == false)
      strQuote = "";

    strOut = strQuote + "javascript:openChild("+ strPath + "," + intWidth + "," + intHeight + "," + intScroll + "," + intResize + "," + strWinName + ")" + strQuote;
    return strOut
  }

  quickToolTipDisplay(strTimeDisplay: string, strSubject: string, strLocation: string, strNotes: string, eCat: eApptCategory, strType: string, strContactName: string, strLeadName: string) {
    if (strLocation != "")
      strLocation = "(" + strLocation + ")";
    if (strNotes != "")
      strNotes = " " + " " + strNotes;

    var strCat: string = "";

    switch (eCat) {
      case eApptCategory.Contact:
        if (strLocation != "")
          strCat = "\nContact: " + strContactName + " ";
        break;
      case eApptCategory.Lead:
        if (strLeadName != "")
          strCat = "\nLead: " + strLeadName + " ";
        if (strContactName != "")
          strCat = "\nContact: " + strContactName + " ";
        break;

      default:
        return this.imgCalIconPersonal;
    }
    if (strType != "")
      strType = "\nType: " + strType + " \n";


    var strOut: string = "";
    strOut += strCat + "\n" + strSubject + " \n";
    strOut += strTimeDisplay + strLocation + strNotes;

    return strOut;
  }


  public getEventStyles(args: any): any {
    return {
      backgroundColor: args?.event?.dataItem?.dataItem?.colorCode ? args?.event?.dataItem?.dataItem?.colorCode : '#808080',
      'box-shadow': "10px 5px 5px #aaaaaa",
      'width': '158px !important'
    };
  }

  public getSlotClass(args: any): any {
    if (args.start.getMonth() != this.selectedDate.getMonth())
      return 'disable-slot';
    else
      return '';
  }

}
