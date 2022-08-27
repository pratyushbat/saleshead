export interface LoginSecurityCode {
  mobile: string;
  securityCode: string;
  sentToCarrier: boolean;
  dtCreated: Date;
}

export interface LoginSecurityCodeResponse {
  loginSecurityCode: LoginSecurityCode;
  loginMsgId: number;
  verified: boolean;
}
