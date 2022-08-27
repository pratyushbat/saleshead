import { Data } from "@angular/router";
import { SimpleResponse } from "./genericResponse.model";

export interface GridColumnsConfiguration {
  clpUserID: number;
  tableName: string;
  sortingColumn: string;
  reorderColumnName: string;
  columnWidth: string;
  pageSize: number;
  actualColumns: string;
  panelsSize: string;
}

export interface GridColumnsConfigurationResponse extends SimpleResponse {
  gridColumnsConfiguration: GridColumnsConfiguration;
}

export interface GridColumnsConfigurationByUserResponse extends SimpleResponse {
  gridColumnsConfiguration: GridColumnsConfiguration[];
}
