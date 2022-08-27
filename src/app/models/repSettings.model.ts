import { CLPUser, TeamCodes } from "./clpuser.model"
import { MailMergeTemplate } from "./emailTemplate.model" 
import { eSOSCStatus } from "./enum.model"
import { SimpleResponse } from "./genericResponse.model" 

export interface SOSCResponse extends SimpleResponse {
  sOSC: SOSC[]
  mailMergeTemplateDropDown: MailMergeTemplateDropDown[]
}

export interface SOSC {
  sOSCID: number 
  contractName: string 
  mailMergeTemplateID: number 
  mailMergeTemplateName: string 
}

export interface MailMergeTemplateDropDown {
  mailMergeTemplateID: number 
  templateName: string 
}

export interface SOSCContract {
    sOSCContractID: number 
    sOSCID: number 
    cLPCompanyID: number 
    cLPUserID: number 
    teamCode: number 
    pH_Spot1: string 
    pH_Spot2: string 
    pH_Spot3: string 
    pH_Spot4: string 
    pH_Spot5: string 
    pH_Spot6: string 
    pH_Spot7: string 
    pH_Spot8: string 
    pH_Spot9: string 
    pH_Spot10: string 
    pH_Spot11: string 
    pH_Spot12: string 
    sigLegalName: string 
    sigName: string 
    sigEmail: string 
    sigLast4: string 
  dtStart: Date
  dtExpires: Date
  dtSigned: Date
    sigImage: number 
    status: number
    docPDF: number
  dtCreated: Date
  teamDisplay: string
  userFullName: string
  companyName: string
	}


export interface SOSCContractData {
    sOSCID: number 
    contractName: string 
    mailMergeTemplateID: number 
    MailMergeTemplateName: string 
    sOSCContractID: number 
    cLPCompanyID: number 
    cLPUserID: number 
    teamCode: number 
    pH_Spot1: string 
    pH_Spot2: string 
    pH_Spot3: string 
    pH_Spot4: string 
    pH_Spot5: string 
    pH_Spot6: string 
    pH_Spot7: string 
    pH_Spot8: string 
    pH_Spot9: string 
    pH_Spot10: string 
    pH_Spot11: string 
    pH_Spot12: string 
    sigLegalName: string 
    sigName: string 
    sigEmail: string 
    sigLast4: string 
  dtStart: Date
  dtExpires: Date
  dtSigned: Date
  sigImage: number
    status: number
    docPDF: number
  dtCreated: Date
  teamName: string
  companyName: string;
	}

export interface SOSCContractResponse {
  sOSCContractData:  SOSCContractData[]
  sOSCContract: SOSCContract[]
  hTMLText: string
  teamCodes: TeamCodes[]
  cLPUsers: CLPUser[]
	}
