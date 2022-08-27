import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';

import { filterAnimation, pageAnimations } from '../../../../animations/page.animation';
import { ConfigDetails } from '../../../../models/appConfig.model';

import { CLPUser } from '../../../../models/clpuser.model';
import { ContactFields, ContactFieldsResponse } from '../../../../models/contact.model';
import { EmailDropDownsResponse } from '../../../../models/emailTemplate.model';
import { SimpleResponse } from '../../../../models/genericResponse.model';
import { Task, TaskDocListResponse, TaskListResponse, TaskResponse } from '../../../../models/task.model';
import { ContactService } from '../../../../services/contact.service';
import { NotificationService } from '../../../../services/notification.service';

import { OutBoundEmailService } from '../../../../services/outBoundEmail.service';
import { AppconfigService } from '../../../../services/shared/appconfig.service';
import { ContactSearchService } from '../../../../services/shared/contact-search.service';
import { LocalService } from '../../../../services/shared/local.service';
import { UtilityService } from '../../../../services/shared/utility.service';
import { TaskService } from '../../../../services/task.service';

declare var $: any;

@Component({
    selector: 'app-contact-task',
    templateUrl: './contact-task.component.html',
    styleUrls: ['./contact-task.component.css'],
    animations: [pageAnimations, filterAnimation]
})
/** contact-task component*/
export class ContactTaskComponent implements OnInit, OnChanges {
  /** contact-task ctor */
  @Input() loggedUser: CLPUser;
  @Input() contactId: number = 0;
  @Input() leadId: number = 0;
  @Input() isLeadTask: boolean = false;
  @Input() taskCalender?: any;
  @Input() isCalenderTask?: boolean = false;
  @Input() taskIDCalender?: number = 0;
  @Output() updatedTask = new EventEmitter<string>();
  showSpinner: boolean = false;
  contactFields: ContactFields;
  taskForm: FormGroup;
  emailDropDownsResponse: EmailDropDownsResponse;
  taskListResponse: TaskListResponse;
  tasks: Task[] = [];
  task: Task;
  taskId: number = 0;
  private encryptedUser: string = '';
  isFormEdit: boolean = false;

  users: any;
  mySOUrl: any;
  soUrl: any;
  site: string = "";
  taskAttachedFiles: any[] = [];
  afuConfig: any;
  showAttachmentsDiv: boolean = false;
  public skip = 0;
  pageSize: number = 5;
  selectedTaskId: number = 0;
  selectedUser: any;

  isTaskSubmit: boolean = false;
  currentTaskToDelete: any;

  //Animation
  @HostBinding('@pageAnimations') public animatePage = true;
  showAnimation = -1;
  //Animation
  constructor(private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _appConfigService: AppconfigService,
    private _utilityService: UtilityService,
    private _outBoundEmailService: OutBoundEmailService,
    public _localService: LocalService,
    public _taskService: TaskService,
    public _contactService: ContactService,
    public _contactSearchService: ContactSearchService,
    private notifyService: NotificationService,
  ) {
    this._appConfigService.getAppConfigValue(this.encryptedUser, "SO_Site")
      .then(async (result: ConfigDetails) => {
        this.soUrl = result.configValue;
      })
    this._appConfigService.getAppConfigValue(this.encryptedUser, "MySO_URL").
      then(async (result: ConfigDetails) => {
        this.mySOUrl = result.configValue;
      })
    this._appConfigService.getAppConfigValue(this.encryptedUser, "MySO_Site")
      .then(async (result: ConfigDetails) => {
        this.site = result.configValue;
      })
  }

  ngOnInit() {
    this.taskForm = this.prepareTaskForm();
    this.taskForm.reset();
    this._localService.getPristineForm().subscribe(res => {
      this._localService.genericFormValidationState(this.taskForm);
    });
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");

      if (this.loggedUser) {
        if (!isNullOrUndefined(this._localService.contactFields) && (this._localService.contactFields.contactID.fieldValue == this.contactId))
          this.loadInitData();
        else if (this.leadId > 0)
          this.loadInitData();
        else
          this.getContactFields(this.contactId, this.loggedUser.cLPCompanyID, this.loggedUser.cLPUserID);
        //this.getContactFields(this.contactId, this.loggedUser.cLPCompanyID, this.loggedUser.cLPUserID).subscribe((value) => this.getTaskList());

        this.getEmailDropDowns().subscribe((value) => console.log('task value'));
      }
    }
    else
      this._router.navigate(['/unauthorized']);
  }

  ngOnChanges() {
    if (!isNullOrUndefined(this.taskCalender))
    this.taskGridCRUD('edit', this.taskCalender,0)
  }
  loadInitData() {
    this.contactFields = this._localService.contactFields;
    this.getTaskList();
    this.loadAfuConfig();
    if ($(window).width() < 768) 
      this.afuConfig.theme = '';
    
  }

  private prepareTaskForm(): FormGroup {
    return this.fb.group({
      priority: [{ value: '' }],
      dtDue: [{ value: '' }, [Validators.required]],
      hours: [{ value: '' }],
      cost: [{ value: '' }],
      status: [{ value: '' }],
      cLPUserID: [{ value: '' }],
      reminderCLP: [{ value: true }],
      reminderEmail: [{ value: true }],
      taskDesc: [{ value: '' }, [Validators.required]],
    });
  }

  get taskFrm() {
    return this.taskForm.controls;
  }

  get sendEmailFrm() {
    return this.taskForm.controls;
  }

  getContactFields(contactId, companyID, userId) {
    this._localService.getContactFields(this.encryptedUser, contactId, companyID, userId, true)
      .subscribe((value) =>
        this.loadInitData()
    );
  }
  onCloseTask() {
    this._localService.hideCommonComponentEmit('task');
    this._localService.showCommonComp = '';
    this.taskForm.reset();
  }

  getEmailDropDowns() {
    return new Observable(observer => {
      this._outBoundEmailService.getEmailDropDowns(this.encryptedUser, this.loggedUser.cLPCompanyID, this.loggedUser.cLPUserID, this.loggedUser.teamCode)
        .then(async (result: EmailDropDownsResponse) => {
          if (result) {
            this.emailDropDownsResponse = UtilityService.clone(result);
            this.users = this.emailDropDownsResponse.userToList;

            var usersArray = [];
            if (this.users && this.users.length > 0) {
              usersArray = this.users.map(x => Object.assign({}, x));
              var manipulatedArr = [];
              usersArray.map(function (e) {
                var splittedArr = e.value.split(/[:(]/, 2);
                e.value = splittedArr.length == 2 ? splittedArr[1] + ', ' + splittedArr[0] : splittedArr.length == 1 ? splittedArr[0] : e.value;
                manipulatedArr.push(e);
              })
              this.users = manipulatedArr;
            }
            observer.next("success");
          }
        })
        .catch((err: HttpErrorResponse) => {
          console.log(err);
          this._utilityService.handleErrorResponse(err);
        });
    });
  }

  loadAfuConfig() {
    this.afuConfig = {
      theme: 'dragNDrop',
      hideResetBtn: false,
      hideSelectBtn: false,
      maxSize: 3,
      uploadAPI: {
        url: this.site + 'api/Task/TaskDoc_Post/' + this.loggedUser.cLPCompanyID + '/' + this.isLeadTask ? this.leadId : this.contactFields.contactID.fieldValue + '/' + this.loggedUser.cLPUserID,
        headers: {},
      },
      formatsAllowed: '.jpg,.png,.pdf,.docx, .txt,.gif,.jpeg,.xlsx,.pptx,.bmp,.tiff',
      multiple: true,
      replaceTexts: {
        selectFileBtn: 'Select File',
        resetBtn: 'Reset',
        uploadBtn: 'Upload',
        dragNDropBox: 'Drag and Drop your file here',
        attachPinBtn: 'Attach Files...',
        afterUploadMsg_success: 'Successfully Uploaded!',
        afterUploadMsg_error: 'Upload Failed!',
      }
    };
  }

  getTaskList() {
    this.showSpinner = true;
    var ownerId = this.isLeadTask ? this.leadId : (this.contactFields ? this.contactFields.contactID.fieldValue : 0);
    this._taskService.taskGetList(this.encryptedUser, this.isLeadTask ? 3 : 2, 0, this.loggedUser.cLPCompanyID, ' ', ' ', ownerId, 3)
      .then(async (result: TaskListResponse) => {
        if (result) {
          this.taskListResponse = UtilityService.clone(result);
          this.tasks = this.taskListResponse.tasks;
          this.taskFormPatchValueByField('user');
          this.showSpinner = false;
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.showSpinner = false;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  getTaskDocuments(taskId, userId?) {
    this.selectedTaskId = taskId;
    if (userId) {
      this.getSelectedTaskUser(userId);
      this.showAttachmentsDiv = false;
    }
    this._taskService.getTaskDocuments(this.encryptedUser, taskId, this.isLeadTask ? this.leadId : this.contactFields.contactID.fieldValue, this.loggedUser.cLPUserID, this.loggedUser.cLPCompanyID)
      .then(async (result: TaskDocListResponse) => {
        if (result) {
          this.showAttachmentsDiv = true;
          var response = UtilityService.clone(result);
          this.taskAttachedFiles = response.taskDocs.attachedFiles;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  getSelectedTaskUser(uId) {
    this.selectedUser = {};
    var users = this.taskListResponse.users;
    this.selectedUser = users.find(i => i.cLPUserID === uId);
  }

  taskFormPatchValueByField(field) {

    if (field) {
      switch (field) {
        case "user":
          if (this.users && this.users.length > 0) {
            var user = this.users.find(x => x.key === this.loggedUser.cLPUserID);
            this.taskForm.patchValue({ cLPUserID: user.key });
          }
          break;
      }
    }
    this.taskForm.patchValue({ priority: 1, hours: 0, cost: 0, status: 0, taskDesc: '', dtDue: new Date(), reminderCLP: true, reminderEmail: true });
  }

  taskFormSubmit() {
    this._localService.validateAllFormFields(this.taskForm);
    if (this.taskForm.valid) {
      this.taskForm.markAsPristine();

      if ((this.isFormEdit) && (this.taskId > 0)) {       
        let task = this.tasks.find(i => i.taskID === this.taskId);
        var selectedTaskUserId = !this.isCalenderTask ? task.cLPUserID : this.taskCalender.clpUserId;

        if (selectedTaskUserId != this.taskForm.controls.cLPUserID.value)
          $('#modalUpdateTask').modal('show');
        else
          this.createUpdateTask();
      }
      else if (this.loggedUser.cLPUserID != this.taskForm.controls.cLPUserID.value)
        $('#modalUpdateTask').modal('show');
      else
        this.createUpdateTask();
    }
  }

  copyDataObjectToTaskObject() {
    let tm: Task = {} as any;

    tm.taskID = this.taskId > 0 ? this.taskId : 0;
    tm.cLPUserID = this.loggedUser ? this.loggedUser.cLPUserID : 0;
    tm.cLPCompanyID = this.loggedUser ? this.loggedUser.cLPCompanyID : 0;
    tm.ownerID = this.isLeadTask ? this.leadId : this.contactFields ? this.contactFields.contactID.fieldValue : 0;
    tm.priority = this.taskForm.controls.priority.value ? this.taskForm.controls.priority.value : 1;
    tm.dtDue = this.taskForm.controls.dtDue.value ? this.taskForm.controls.dtDue.value : '';
    tm.hours = this.taskForm.controls.hours.value ? this.taskForm.controls.hours.value : 0;
    tm.cost = this.taskForm.controls.cost.value ? this.taskForm.controls.cost.value : 0;
    tm.status = this.taskForm.controls.status.value ? this.taskForm.controls.status.value : 0;
    tm.cLPUserID = this.taskForm.controls.cLPUserID.value ? this.taskForm.controls.cLPUserID.value : 0;
    tm.reminderCLP = this.taskForm.controls.reminderCLP.value ? this.taskForm.controls.reminderCLP.value : false;
    tm.reminderEmail = this.taskForm.controls.reminderEmail.value ? this.taskForm.controls.reminderEmail.value : true;
    tm.taskDesc = this.taskForm.controls.taskDesc.value ? this.taskForm.controls.taskDesc.value : '';

    tm.category = this.isLeadTask ? 3 : 2;
    tm.isPrivate = false;
    tm.campaignID = 0;


    tm.campaignEventID = 0;
    tm.runID = 0;
    tm.ownerName = "";
    tm.contactName = "";
    tm.PriorityDisplay = null;

    tm.TaskDescHTML = null;
    tm.DisplayName = null;
    tm.DisplayToolTip = null;
    tm.DisplayURL = null;
    tm.CategoryDisplay = null;
    tm.CategoryURL = null;
    tm.UserName = null;
    tm.UserNameSort = null;
    tm.DueDateDisplay = null;
    tm.StatusDisplay = null;
    tm.StatusImg = null;
    tm.TaskDocURL = null;
    tm.TaskDocURLEdit = null;
    tm.ReminderDisplay = null;
    tm.isShowAttached = false;
    tm.messageString = null;
    tm.messageInt = 0;
    tm.messageBool = false;
    tm.list = null;
    tm.statusCode = 0;
    tm.errorMsg = null;

    this.task = tm;
  }

  createUpdateTask() {
    this.copyDataObjectToTaskObject();
    this.isTaskSubmit = true;
    this._taskService.taskUpdate(this.encryptedUser, this.task, this.loggedUser.cLPUserID)
      .then(async (result: TaskResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          let msg = this.taskId > 0 ? "updated" : "created";
          this.notifyService.showSuccess("Task " + msg + " successfully", "", 5000);
          this.getTaskList();
          if (this.isCalenderTask && this.taskId > 0)
            this.updatedTask.emit('updated Task');
          this.taskId = 0;
          this.hideUpdateTask();
          this.isFormEdit = false;
          this.taskFormPatchValueByField('user');
          $('#taskForm').collapse('hide');
          this._localService.handledEventEmit(true);
        }
        this.isTaskSubmit = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.isTaskSubmit = false;
        this.taskId = 0;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  deleteTask() {
    var taskId = this.taskId;
    this._taskService.taskDelete(this.encryptedUser, taskId)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.notifyService.showSuccess("Task deleted successfully", "", 5000);
          this.getTaskList();
          this.hideDeleteTask();
          this._localService.handledEventEmit(true);
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.taskId = 0;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  hideDeleteTask() {
    this.taskId = 0;
    $('#modalDeleteTask').modal('hide');
  }

  hideUpdateTask() {
    $('#modalUpdateTask').modal('hide');
  }

  getUser(uId) {
    return this.users?.find(x => x.key == uId);
  }

  taskGridCRUD(type, row, index) {
    console.log(row)
    this.currentTaskToDelete = row.taskDesc
    if (type) {
/*If condition added for calender*/
      if (this.isCalenderTask)
        this.taskId = row.taskId;
      else
      this.taskId = row.taskID;
      switch (type) {
        case "edit":
          $('#taskForm').collapse('show');
          this.isFormEdit = true;

          this.taskForm.patchValue({
            priority: row.priority,
            dtDue: row.dtDue ? new Date(row.dtDue) : new Date(),
            hours: row.hours,
            cost: row.cost,
            status: row.status,
            cLPUserID: this.isCalenderTask ? row.clpUserId : row.cLPUserID,
            reminderCLP: row.reminderCLP,
            reminderEmail: row.reminderEmail,
            taskDesc: row.taskDesc,
          });
          break;
        case "delete":
          $('#modalDeleteTask').modal('show');
          break;
      }
    }
  }

  addNewHandler() {
    this.taskId = 0;
    this.isFormEdit = false;
    this.taskForm.reset();
    this.taskFormPatchValueByField('user');
  }

  goToLink(type, id) {
    if (type) {
      switch (type) {
        case "user":
          this._router.navigate(['/edit-profile', id]);
          break;
        case "attachment":
          var url = this.soUrl;
          var mContactUrl = this.mySOUrl + this.encryptedUser + "&ReturnUrl=" + encodeURIComponent(url + "/task/taskdoc.aspx?tkid=" + id);
          window.open(mContactUrl, '', 'width=900,height=700,left=1, right=1');
          break;
      }
    }
  }

  deleteTaskFile(item, index) {
    var document = item;
    this._taskService.taskDocDelete(this.encryptedUser, item.documentId)
      .then(async (result: SimpleResponse) => {
        if (result) {
          var response = UtilityService.clone(result);
          this.notifyService.showSuccess("Task document deleted successfully", "", 5000);
          this.taskAttachedFiles = this.taskAttachedFiles.filter(({ documentId }) => documentId !== document.documentId);
        }
      })
      .catch((err: HttpErrorResponse) => {
        this.taskId = 0;
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  fileUpload(e) {
    //get uploaded file here
    this.getTaskDocuments(this.selectedTaskId);
  }

  get hideAFU(): boolean {
    if (this.selectedUser) {
      if (this.loggedUser.userRole > 1) {
        return false;
      }
      else if ((this.loggedUser.userRole == 1) && (this.selectedUser.cLPUserID == this.loggedUser.cLPUserID)) {
        return false;
      }
      return true;
    }
    return false;
  }

}
