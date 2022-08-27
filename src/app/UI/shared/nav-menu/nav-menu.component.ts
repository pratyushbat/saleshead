import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CLPUser, UserResponse } from '../../../models/clpuser.model';
import { eFeatures, eUserRole } from '../../../models/enum.model';
import { SimpleResponse } from '../../../models/genericResponse.model';
import { RoleFeaturePermissions, RoleListResponse, RoleResponse } from '../../../models/roleContainer.model';
import { LocalService } from '../../../services/shared/local.service';
import { UtilityService } from '../../../services/shared/utility.service';
import { RoleService } from '../../../services/role.service';
import { MenuService } from '../../../services/menu.service';
import { MenuResponse, Menus } from '../../../models/menu.model';
import { SomythemeService } from '../../../services/shared/somytheme.service';
import * as homeMenu from '../../../../assets/json/menu.json';
import { Title } from '@angular/platform-browser';
import { animate, style, transition, trigger } from '@angular/animations';
declare var $: any;
@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css'],
  animations: [
    trigger('slideDownUp', [
      transition(':enter', [style({ height: 0 }), animate(300)]),
      transition(':leave', [animate(300, style({ height: 0 }))]),
    ]),
  ],
})
/** nav-menu component*/
export class NavMenuComponent implements OnInit {
  /** nav-menu ctor */
  homeMenu: any[] = [];
  showConfig: boolean = true;
  encryptedUser: string = '';
  user: CLPUser;
  userResponse: UserResponse;
  roleFeaturePermissions: RoleFeaturePermissions;
  menus: Menus[];
  showSpinner: boolean = false;
  validImage: boolean = false; 

  menuResponse: MenuResponse;
  _roleListResponse: RoleListResponse = <RoleListResponse>{};
  _roleList: RoleResponse[] = [];
  currentSelectedId: string = "-1";
  currentSelectedParentId: string = "-1";
  currentSelectedChildId: string = "-1";
  showSearch: boolean = false;

  constructor(public _localService: LocalService,
    private _router: Router,
    private titleService: Title,
    public _roleService: RoleService,
    private _utilityService: UtilityService,
    private _MenuService: MenuService,
    private readonly _somyThemeService: SomythemeService) {

    // this.themeChangeHandler('aldaaysi_agency');
  }
  ngOnInit() {
    if (!isNullOrUndefined(localStorage.getItem("token"))) {
      this.encryptedUser = localStorage.getItem("token");
      this.authenticateR(async () => {
        if (!isNullOrUndefined(this.user)) {
          this.getMenu();
          this.homeMenu = homeMenu.homeMenu;
          this.homeMenu[0].icon = "../../../../assets/homeicon.svg";
        }
        else { this._router.navigate(['/unauthorized']); }
      })
    }
    else
      this._router.navigate(['/unauthorized']);
  }

  themeChangeHandler(themeToSet) {
    this._somyThemeService.setTheme(themeToSet);
  }


  private async getMenu() {
    await this._MenuService.getMenu(this.encryptedUser, this.user.cLPUserID)
      .then(async (result: MenuResponse) => {
        if (result) {
          this.menuResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.menuResponse) && !isNullOrUndefined(this.menuResponse.menus)) {
            this.menus = this.menuResponse.menus;
        /*    if (this.menus[this.menus.length - 1].text != "Control Panel") {
              this.menus = this.moveArrayItemToNewIndex(this.menus, this.menus.length - 2, this.menus.length - 1)
            }*/
            var removeUrlArr = [];
            this.menus.forEach(e => {
              if (e.text == 'Help') {
                e.icon = '../../../../assets/helpicon.svg';
                delete e.text;
              } else if (e.text == 'Control Panel') {
                e.icon = '../../../../assets/cpgear.svg';
                delete e.text;
              }
              delete e.url;
              removeUrlArr.push(e);
            })
            this.menus = removeUrlArr;
            this.menus = this.mapItems(this.menus);
          } else
            console.log('default.getMenu - this.menuResponse', this.menuResponse);
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }

  private mapItems(menu: Menus[], path?: string): any[] {
    return menu.map((item) => {
      const result: any = {
        icon: item.icon,
        text: item.text,
        path: item.url,
      };
      if (item.items) {
        result.items = this.mapItems(item.items, item.url);
      }
      return result;
    });
  }

 /* moveArrayItemToNewIndex(menu: Menus[], old_index, new_index) {
    if (new_index >= menu.length) {
      var k = new_index - menu.length + 1;
    while (k--) {
      menu.push(undefined);
    }
  }
    menu.splice(new_index, 0, menu.splice(old_index, 1)[0]);
    return menu;
};*/

  async getRoles(isFirstSelected: boolean = true) {
    this.showSpinner = true;
    await this._roleService.soRoles_get(this.encryptedUser, this.user.cLPCompanyID)
      .then(async (result: RoleListResponse) => {
        if (result) {
          this._roleListResponse = UtilityService.clone(result);
          this._roleList = this._roleListResponse.roleList;
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

  private async authenticateR(callback) {
    await this._localService.authenticateUser(this.encryptedUser, eFeatures.None)
      .then(async (result: UserResponse) => {
        if (result) {
          this.userResponse = UtilityService.clone(result);
          if (!isNullOrUndefined(this.userResponse)) {
            this.user = this.userResponse.user;
            this.roleFeaturePermissions = this.userResponse.roleFeaturePermissions;
          }
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
    callback();
  }

  logout() {
    this._localService.userToken_Signout(this.encryptedUser)
      .then(async (result: SimpleResponse) => {
        if (result && result.messageBool) {
          localStorage.removeItem("token");
          localStorage.clear();
          this.titleService.setTitle('SalesOptima');
          this._router.navigate(['/']);
        }
      })
      .catch((err: HttpErrorResponse) => {
        console.log(err);
        this._utilityService.handleErrorResponse(err);
      });
  }
  public onSelectHome(item): void {
    if (!isNullOrUndefined(item.text) && item.text != '') {
      switch (item.text) {
        case "My Documents":
          this._router.navigate(['/my-documents']);
          this.titleService.setTitle('My Documents');
          localStorage.setItem("title", 'My Documents');
          break;
        case "My Profile":
          this._router.navigate(['/edit-profile', this.user?.cLPUserID]);
          this.titleService.setTitle('Edit Profile');
          localStorage.setItem("title", 'Edit Profile');
          break;
        case "My Schedule":
          this._router.navigate(['/calender', this.user?.cLPUserID]);
          this.titleService.setTitle('Calender');
          localStorage.setItem("title", 'Calender');
          break;
        default:
          $('#underConstruction').modal('show');
          break;
      }
      this.currentSelectedId = "-1";
      this.currentSelectedParentId = "-1";
    }
  }


  public onSelectParent(item, type: string) {
    type = '' + type;
    if (item.items.length == 0) {
      if (item.path != "") {
        this.currentSelectedId = "-1";
        this.currentSelectedParentId = "-1";
        this.currentSelectedChildId = "-1";
        this._router.navigate([item.path]);
        this.titleService.setTitle(item.text);
        localStorage.setItem("title", item.text);
        this.toggleNavBar();
      }
      else {
        this.currentSelectedId = "-1";
        this.currentSelectedParentId = "-1";
        this.currentSelectedChildId = "-1";
        $('#underConstruction').modal('show');
        this.toggleNavBar();
      }
    } else {
      if (item.icon) {
        var split_string = item.icon.split("/");
        var newitem = split_string[split_string.length - 1];
        newitem = newitem.replace(/ /g, "").toLowerCase();
      } else if (item.text) {
        var newitem = item.text.replace(/ /g, "").toLowerCase();
      }

      switch (type) {
        case "0": {
          //for hiding toggler on click of icon
          if (item.icon) {
            this.toggleNavBar();
            if (this.showSearch)
            this.showSearch = !this.showSearch;
          }
           

          if (this.currentSelectedParentId == newitem)
            this.currentSelectedParentId = "-1";
          else
            this.currentSelectedParentId = newitem;
          break;
        }
        case "1": {
          if (this.currentSelectedId == newitem)
            this.currentSelectedId = "-1";
          else
            this.currentSelectedId = newitem;
          break;
        }
        case "2": {
          if (this.currentSelectedChildId == newitem)
            this.currentSelectedChildId = "-1";
          else
            this.currentSelectedChildId = newitem;
          break;
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  getUniqueId(name: string) {
    if (name?.includes('.svg')) {
      var split_string = name.split("/");
      var newitem = split_string[split_string.length - 1];
      newitem = newitem.replace(/ /g, "").toLowerCase();
      return newitem;
    }
    else
      return name?.replace(/ /g, "").toLowerCase();
  }


  toggleNavBar() {
    let element: HTMLElement = document.getElementsByClassName('navbar-toggler')[0] as HTMLElement;
    if (element.getAttribute('aria-expanded') == 'true') {
      element.click();
    }
  }
  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (this.showSearch)
      this.toggleNavBar();
  }

  resetMenuState() {
    this.currentSelectedParentId = "-1";
    this.currentSelectedId = "-1";
    this.currentSelectedChildId = "-1";
  }
}
