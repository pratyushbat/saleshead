import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { isNull, isNullOrUndefined } from 'util';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalService } from '../../../services/shared/local.service';
import { NotificationService } from '../../../services/notification.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { RoleService } from '../../../services/role.service';
import { UserService } from '../../../services/user.service';
import { RoleFeaturePermissions, RoleListResponse, RoleResponse, SORole, SORoleSOFeature } from '../../../models/roleContainer.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { CLPUser, FeatureAccess, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { Dictionary } from "lodash";

declare var $: any;

@Component({
  selector: 'role-setup',
  templateUrl: './role-setup.component.html',
  styleUrls: ['./role-setup.component.css']
})
/** role-setup component*/
export class RoleSetupComponent {
  //Sortable
  public userList: string[] = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep', 'Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];
  public attendeesList: string[] = ["SteelBlue", "CornflowerBlue", "RoyalBlue", "MediumBlue", "SteelBlue", "CornflowerBlue", "RoyalBlue", "MediumBlue"];
  searchText: string;
  encryptedUser: string;
  user: CLPUser;
  _roleListResponse: RoleListResponse = <RoleListResponse>{};
  _roleList: RoleResponse[] = [];
  roleFeatureMapMaster: SORoleSOFeature[];
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  isDeletedUserList: any[] = [];
  toUserlist: any[] = [];
  fromUserlist: any[] = [];
  filterOffice: any[] = [];
  filterTeam: any[] = [];
  roleFeatureMap_test: SORoleSOFeature[] = [];
  @ViewChild('selectedRole') elementRole: any;
  @ViewChild('frmList') elementFromListBox: any;

  //selectedRole: SORole = <SORole>{};
  selectedRoleId: number = 0;
  isInit: any = false;
  fromUserListState: any;

  //roleFormGroup = new FormGroup({});
  roleFormGroup: FormGroup;
  showSpinner: boolean = false;
  featureAccess: FeatureAccess;

  //Sortable
  /** role-setup ctor */
  constructor(public notifyService: NotificationService, private fb: FormBuilder, private _utilityService: UtilityService,
    public _localService: LocalService,
    private _route: ActivatedRoute,
    private _router: Router,
    public _roleService: RoleService,
    public _userService: UserService,
    public cdRef: ChangeDetectorRef
  ) {
    this._localService.isMenu = true;
  }

  onTabSelect(e) {
  }
  //Sortable
  drop(event: CdkDragDrop<string[]>) {
    if (this.attendeesList.length > 1) {
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
  //Sortable

  ngAfterViewChecked() {
    if (this.isInit) {
      this.isInit = false;
      this.roleSelectionChange();
    }
    this.cdRef.detectChanges();
  }

  public ngOnInit(): void {
    this.prepareRoleForm();
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(() => {
        if (!isNullOrUndefined(this.user)) {
          // this.showSpinner = true;         
          this.getRoles();
        }
        else
          this._router.navigate(['/login']);
      })
    }
    else
      this._router.navigate(['/login']);
  }

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.RoleSetup)
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
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  async getRoles(isFirstSelected: boolean = true) {
    this.showSpinner = true;
    await this._roleService.soRoles_get(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: RoleListResponse) => {
        if (result) {
          this.isDeletedUserList = [];
          this._roleListResponse = UtilityService.clone(result);
          this._roleList = this._roleListResponse.roleList;
          this.isDeletedUserList = this.convertDictionaryToAnyType(this._roleList.filter(i => i.role.roleId == this.selectedRoleId)[0]?.users);
          this.filterOffice = this.convertDictionaryToAnyType(this._roleListResponse.filterOffice);
          this.filterTeam = this.convertDictionaryToAnyType(this._roleListResponse.filterTeam);

          this.isInit = isFirstSelected;
          this.loadFeatures();
          this.showSpinner = false;
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

  async clpuser_GetList_Lite(clpCompanyId: number, officideCode: number = 0, teamCode: number = 0) {
    await this._userService.clpuser_GetList_Lite(this.encryptedUser, clpCompanyId, officideCode, teamCode)
      .then(async (result: SimpleResponse) => {
        if (result) {
          let response: SimpleResponse = UtilityService.clone(result);
          this.fromUserlist = this.convertDictionaryToAnyType(response.dictionary);
          for (var i = 0; i < this.fromUserlist.length; i++) {
            this.fromUserlist[i].value = this.fromUserlist[i].value.split("~")[1];
          }
          this.fromUserListState = this.fromUserlist;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  roleSelectionChange() {
    this.toUserlist = [];
    this.selectedRoleId = this.elementRole.selectedOptions.selected[0]?.value;

    if (!isNullOrUndefined(this._roleList)) {
      let toUserDictionary: any = this._roleList.filter(i => i.role.roleId == this.selectedRoleId)[0].users;
      this.toUserlist = this.convertDictionaryToAnyType(toUserDictionary);
      this.isDeletedUserList = this.convertDictionaryToAnyType(this._roleList.filter(i => i.role.roleId == this.selectedRoleId)[0].users);
    }

    if (!isNullOrUndefined(this._roleListResponse)) {
      let fromUserDictionary: any = this._roleListResponse.filterUser;
      this.fromUserlist = this.convertDictionaryToAnyType(fromUserDictionary);
      for (var i = 0; i < this.fromUserlist.length; i++) {
        this.fromUserlist[i].value = this.fromUserlist[i].value.split("~")[1];
      }
      this.fromUserListState = this.fromUserlist;
    }

    let role: SORole = this._roleList.filter(i => i.role.roleId == this.selectedRoleId)[0].role;
    this.roleFormGroup.patchValue({ roleName: role.roleName, roleDescription: role.description });
    this.loadFeatures();
  }

  convertDictionaryToAnyType(dictionary: any[]): any[] {
    let toList: any[] = [];
    for (let key in dictionary) {
      let value = dictionary[key];
      let anyTypeObject: any = { key: key, value: value }
      toList.push(anyTypeObject);
    }
    return toList;
  }

  fromList_Onclick(e: any) {
  }

  selectAll() {
    for (var i = 0; i < this.fromUserlist.length; i++) {
      if (!this.toUserlist.includes(i => i.key == this.fromUserlist[i].key)) {
        this.toUserlist.push(this.fromUserlist[i]);
      }
    }
    this.fromUserlist = [];
  }

  unSelectAll() {
    for (var i = 0; i < this.toUserlist.length; i++) {
      if (!this.fromUserlist.includes(i => i.key == this.toUserlist[i].key)) {
        this.fromUserlist.push(this.toUserlist[i]);
      }
    }
    this.toUserlist = [];
  }

  filterOffice_onchange(id: any) {
    $("#ddlTeam").val("0");
    this.clpuser_GetList_Lite(this.user.cLPCompanyID, id, 0);
  }

  filterTeam_onchange(id: any) {
    $("#ddlOffice").val("0");
    this.clpuser_GetList_Lite(this.user.cLPCompanyID, 0, id)
  }

  keyPress(e: any) {
    if (this.searchText == "") {
      this.fromUserlist = this.fromUserListState;
    } else {
      this.fromUserlist = this.fromUserListState.filter(i => i.value.includes(this.searchText));
    }
  }

  clearDataSearch() {
    this.searchText = "";
    this.keyPress(null);
  }

  roleFormSubmit() { }

  prepareRoleForm() {
    this.roleFormGroup = this.fb.group({
      roleName: [{ value: '' }, [Validators.required]],
      roleDescription: [{ value: '' }, [Validators.required]],
      featuresArray: this.fb.array([this.fb.group({
        featureName: '',
        featureDescription: '',
        featureId: 0,
        view: false,
        create: false,
        delete: false,
        edit: false,
        isAdmin: false
      })])
    });
  }

  get form() {
    return this.roleFormGroup.controls;
  }

  get featuresArrayCtls() {
    return this.roleFormGroup.get('featuresArray') as FormArray;
  }

  loadFeatures() {
    this.featuresArrayCtls.controls = [];

    let roleFeatureMap: SORoleSOFeature[] = [];

    if (!isNullOrUndefined(this._roleList) && this._roleList.length > 0) {
      if (this.selectedRoleId == 0) {
        roleFeatureMap = this._roleList[0].roleFeatureMap;
      }
      else {
        roleFeatureMap = this._roleList.filter(i => i.roleId == this.selectedRoleId)[0].roleFeatureMap;
      }
    }

    //if (isNullOrUndefined(roleFeatureMap) || roleFeatureMap.length <= 0) {
    //  roleFeatureMap = this.roleFeatureMapMaster;
    //}

    for (var i = 0; i < roleFeatureMap.length; i++) {
      this.featuresArrayCtls.push(this.fb.group({
        featureName: roleFeatureMap[i].featureName,
        featureDescription: roleFeatureMap[i].featureDescription,
        featureId: roleFeatureMap[i].featureId,
        view: roleFeatureMap[i].view,
        create: roleFeatureMap[i].create,
        delete: roleFeatureMap[i].delete,
        edit: roleFeatureMap[i].edit,
        isAdmin: roleFeatureMap[i].isAdmin
      }))
    }

  }

  saveRoleSettings() {

    let RoleResponse: RoleResponse = <RoleResponse>{};
    RoleResponse.roleFeatureMap = [];

    RoleResponse.roleId = this.selectedRoleId;
    let soRole: SORole = <SORole>{};

    soRole.roleId = RoleResponse.roleId = this.selectedRoleId;
    soRole.cLPCompanyId = this.user.cLPCompanyID;
    soRole.roleName = this.roleFormGroup.get("roleName").value;
    soRole.description = this.roleFormGroup.get("roleDescription").value;
    RoleResponse.role = soRole;


    if (!isNullOrUndefined(this.featuresArrayCtls && this.featuresArrayCtls.controls.length > 0)) {
      for (var i = 0; i < this.featuresArrayCtls.controls.length; i++) {
        let feature: SORoleSOFeature = <SORoleSOFeature>{};
        feature.featureId = this.featuresArrayCtls.controls[i].get("featureId").value;
        feature.featureDescription = this.featuresArrayCtls.controls[i].get("featureDescription").value;
        feature.featureName = this.featuresArrayCtls.controls[i].get("featureName").value;
        feature.view = this.featuresArrayCtls.controls[i].get("view").value;
        feature.create = this.featuresArrayCtls.controls[i].get("create").value;
        feature.delete = this.featuresArrayCtls.controls[i].get("delete").value;
        feature.edit = this.featuresArrayCtls.controls[i].get("edit").value;
        RoleResponse.roleFeatureMap.push(feature);
      }
    }
    if (!isNullOrUndefined(this.toUserlist) && this.toUserlist.length > 0) {
      var dictionary: Dictionary<string> = {};
      for (var i = 0; i < this.toUserlist.length; i++) {
        dictionary[this.toUserlist[i].key] = this.toUserlist[i].value;
      }
      RoleResponse.users = dictionary;
    }
    this.validateAdminUser(RoleResponse);
  }

  validateAdminUser(roleResponse: RoleResponse) {
    if (!isNullOrUndefined(roleResponse.users)) {
      if (this.selectedRoleId >= 3 && this.user.userRole >= 3) {    // Admin should not be able to remove his/her role
        if (this.toUserlist.filter(item => { return item.key == this.user.cLPUserID }).length > 0)
          this.SORoles_Update(roleResponse);
        else
          $('#confirmationModal').modal('show');
      }
      else
        this.SORoles_Update(roleResponse);
    }
  }

  async SORoles_Update(roleResponse: RoleResponse) {
    this.showSpinner = true;
    this.toUserlist.forEach((i) => {
      this.isDeletedUserList.forEach((d, index) => {
        if (d.key == i.key) this.isDeletedUserList.splice(index, 1);
      });
    });
    if (!isNullOrUndefined(this.isDeletedUserList) && this.isDeletedUserList.length > 0) {
      var dictionary: Dictionary<string> = {};
      for (var i = 0; i < this.isDeletedUserList.length; i++) {
        dictionary[this.isDeletedUserList[i].key] = this.isDeletedUserList[i].value;
      }
    }
      roleResponse.deletedUsers = dictionary;
    await this._roleService.SORoles_Update(this.encryptedUser, roleResponse)
      .then(async (result: SimpleResponse) => {
        if (result) {
          this.showSpinner = false;
          var simpleResponse = UtilityService.clone(result);
          if (simpleResponse.messageBool) {
            this.notifyService.showSuccess("Role settings updated Successfully", "", 3000);
            this.getRoles(false);
            /* this.reset();*/

          }
        }
        else
          this.showSpinner = false;
      })
      .catch((err: HttpErrorResponse) => {
        this.notifyService.showSuccess("Unable to update Role Settings, Please contact Administrator.", "", 3000);
        console.log(err);
        this.showSpinner = false;
        this._utilityService.handleErrorResponse(err);
      });
  }

  reset() {
    this.selectedRoleId = 0;
    this.roleFormGroup.reset();
    this.loadFeatures();
    this.unSelectAll();
  }
  onchange(e, i) {
    if (e.target.checked == true) {
      return;
    } else {
      this.featuresArrayCtls.controls[i].get('edit').setValue(false);
      this.featuresArrayCtls.controls[i].get('create').setValue(false);
      this.featuresArrayCtls.controls[i].get('delete').setValue(false);
    }
  }
  onchangeToggle(e, i) {
    if (e.target.checked == true) {
      this.featuresArrayCtls.controls[i].get('view').setValue(true);
    } else {
      return;
    }
  }
  onreset() {
    this.roleSelectionChange();
  }


}
