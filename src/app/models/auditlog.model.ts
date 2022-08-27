export interface AuditLog {
  actionType: number,
  userId: number,
  message: string,
  beforeValue: string,
  afterValue: string
}
export enum ActionType { LoginSuccess = 1, LoginError = 2, ConfirmSuccess = 3, ConfirmError = 4, ForgetSuccess = 5, ForgetError = 6, ReSetSuccess = 7, ReSetError = 8 }
