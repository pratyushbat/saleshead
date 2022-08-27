import { SimpleChange } from "@angular/core";
import { SimpleResponse } from "./genericResponse.model";

export interface SORole {
  roleId: number;
  cLPCompanyId: number;
  roleName: string;
  description: string;  
}

export interface SORoleSOFeature {
  roleId: number;
  featureId: number;
  featureName: string;
  featureDescription: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  isAdmin: boolean;
}

export interface RoleResponse {
  roleId: number;
  role: SORole;
  users: any[];
  deletedUsers: any[];
  roleFeatureMap: SORoleSOFeature[];
}

export interface RoleListResponse extends SimpleResponse {
  roleList: RoleResponse[];
  roleFeatureMapMaster: SORoleSOFeature[];
  filterOffice: any[];
  filterTeam: any[];
  filterUser: any[];
}

export interface RoleFeaturePermissions {
  clpUserId: number;
  featureName: string;
  roleId: number;
  featureId: number;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  clpCompanyId: number;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}
