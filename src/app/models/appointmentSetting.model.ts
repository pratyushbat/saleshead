export interface AppointmentSetting {
  tableName: string;
  code: number;
  clpCompanyId: number;
  display: string;
  sOrder: number;
  colorCode: string;
}

export interface AppointmentSettingListResponse {
  appointmentSettings: AppointmentSetting[];
}
