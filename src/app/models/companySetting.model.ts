export interface CompanySetting {
  tableName: string;
  code: number;
  clpCompanyId: number;
  display: string;
  sOrder: number;
}

export interface CompanySettingListResponse {
  companySettings: Map<string, CompanySetting[]>;
} 
