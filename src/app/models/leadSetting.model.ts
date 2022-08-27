export interface LeadSetting {
  tableName: string;
  code: number;
  clpCompanyId: number;
  display: string;
  sOrder: number;
}

export interface LeadSettingListResponse {
  leadSettings: Map<string, LeadSetting[]>;
}
