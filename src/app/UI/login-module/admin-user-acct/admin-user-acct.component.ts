import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatInput } from '@angular/material/input';

import { CLPUserLock, CLPUserLockListResponse } from '../../../models/clpUserLock.model';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';

import { UtilityService } from '../../../services/shared/utility.service';
import { UserService } from '../../../services/user.service';
import { ManageUserAccessService } from '../../../services/manageUserAccess';
import { NotificationService } from '../../../services/notification.service';
import { GlobalService } from '../../../services/global.service';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'app-admin-user-acct',
    templateUrl: './admin-user-acct.component.html',
    styleUrls: ['./admin-user-acct.component.css']
})

export class AdminUserAcctComponent implements OnInit {
  clpUserLockListResponse: CLPUserLockListResponse;
  userResponse: UserResponse;
  clpUserLocks: CLPUserLock[] = [];
  user: CLPUser = <CLPUser>{};
  private encryptedUser: string = '';
  btnLock: boolean = false;
  btnPasswordUpdate: boolean = false;

  displayedColumns: string[] = ['clpcompanyId', 'clpUserId', 'companyName', 'userName', 'isLocked'];
  dataSource = new MatTableDataSource<CLPUserLock>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sortAdminUserAc: MatSort;
  @ViewChild(MatInput) searchUserAcct: MatInput;

  pageSize: any;
  pageEvent: any = PageEvent;

  constructor(private _router: Router,
    private _route: ActivatedRoute,
    private _userService: UserService,
    private _manageUserAccessService: ManageUserAccessService,
    private _snackBar: MatSnackBar,
    private _utilityService: UtilityService,
    public globalService: GlobalService,
    private notifyService: NotificationService) {
  }

  ngOnInit() {
  
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");

        this.authenticateR(() => {
          if (this.userResponse && this.userResponse.user) {
            if (this.userResponse.isvalid) {
              this.loadClpUsers();
              this.globalService.loadAppConfig(this.encryptedUser);
            }
            else { this._router.navigate(['/unauthorized']); }
          }
          else { this._router.navigate(['/unauthorized']); }
        })
      }
      else {
        this._router.navigate(['/unauthorized']);
    }

  }

  private async authenticateR(callback) {
    await this._userService.authenticateR(this.encryptedUser)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = result;
          this.user = this.userResponse.user;
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  public async updateClpUserPassword(userId: number) {
    if (!isNullOrUndefined(this.clpUserLocks)) {
      var user = this.clpUserLocks.filter(i => i.clpUserId == userId)[0];
      if (user)
        user.isLocked = user.isLocked == 0 ? 3 : 0;
      this.btnPasswordUpdate = true;
      await this._manageUserAccessService.clpuser_Update_Lock(this.encryptedUser, user)
        .then(result => {
          this.btnPasswordUpdate = false;
          if (result) {
            if (result.statusCode == 401) {
              this._router.navigate(['/unauthorized']);
            } else {
              this.loadClpUsers();
              var msg = user.isLocked == 3 ? 'initiated' : 'reverted';
              this.notifyService.showSuccess("Password reset request " + msg + " successfully!", "");
            }
          }
        }).catch((err: HttpErrorResponse) => {
          this.btnPasswordUpdate = false;
          console.log(err);
          this._utilityService.handleErrorResponse(err);
        });
    }
  }

  private async loadClpUsers() {
    let userCompanyId: number = this.user.cLPCompanyID;
    await this._manageUserAccessService.getClpUsers_Lock(this.encryptedUser, userCompanyId)
      .then(async (result: CLPUserLockListResponse) => {
        if (result) {
          this.clpUserLockListResponse = UtilityService.clone(result);
          this.clpUserLocks = this.clpUserLockListResponse.clpUserLocks;
          const ELEMENT_PP: CLPUserLock[] = this.clpUserLocks;
          this.dataSource = new MatTableDataSource(ELEMENT_PP);
          this.dataSource.paginator = this.paginator;
          if (localStorage.getItem('adminUserAcct_pageSize')) {
            let pageSizeVal: string = "";
            pageSizeVal = localStorage.getItem('adminUserAcct_pageSize');
            this.paginator.pageSize = parseInt(pageSizeVal);
          } else
            this.paginator.pageSize = 50;
          this.dataSource.sort = this.sortAdminUserAc;
          this.applyFilterTemplateConfiguration(this.searchUserAcct.value);
        }
        else { this._router.navigate(['/unauthorized']); }
      })
      .catch((err: HttpErrorResponse) => {
        this._utilityService.handleErrorResponse(err);
      });
  }

  applyFilterTemplateConfiguration(filterValue: string) {
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.clpCompanyId.toFixed().includes(filter) || data.firstName.toLowerCase().includes(filter) || data.lastName.toLowerCase().includes(filter) || data.userName.toLowerCase().includes(filter) || data.companyName.toLowerCase().includes(filter);
    };
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public async updateClpUser(userId: number) {
    if (!isNullOrUndefined(this.clpUserLocks)) {
      var user = this.clpUserLocks.filter(i => i.clpUserId == userId)[0];
      if (user)
        user.isLocked = user.isLocked == 0 ? 2 : 0;
      this.btnLock = true;
      await this._manageUserAccessService.clpuser_Update_Lock(this.encryptedUser, user)
        .then(result => {
          this.btnLock = false;
          if (result) {
            if (result.statusCode == 401) {
              this._router.navigate(['/unauthorized']);
            } else {
              this.loadClpUsers();
              var msg = user.isLocked == 2 ? 'locked' : 'unlocked';
              this.notifyService.showSuccess("The user is " + msg + " successfully!", "");
              //Mail for unlocked user
              if (user && user.isLocked == 0) {
                this._manageUserAccessService.userlock_Notification(this.encryptedUser, user.userName)
                  .then(async (result: any) => {
                    if (result) { }
                  })
                  .catch((err: HttpErrorResponse) => {
                    console.log(err)
                    this._utilityService.handleErrorResponse(err);
                  });
              }
            }
          }
        }).catch((err: HttpErrorResponse) => {
          this.btnLock = false;
          console.log(err);
          this._utilityService.handleErrorResponse(err);
        });
    }
  }

  public handlePage(e: any) {
    localStorage.setItem('adminUserAcct_pageSize', e.pageSize);
  }
}
