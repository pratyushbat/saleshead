import { TeamCodes } from "./clpuser.model";
import { ExportRequest } from "./exportRequest.model";

export interface ScoreCardByTeamFilterResponse {
  exportRequests: ExportRequest[]
  teamCodes: TeamCodes[]
}

export interface ScoreByTeam {
  clpUserID: number
  salesperson: string
  teamDisplay: string
  dnc: number
  lvm: number
  openCAS: number
  callCount: number
  newContacts: number
  newMembers: number
  memberRatio: number
  callRatio: number
}

export interface ScoreByTeamListResponse {
  scoresByTeam: ScoreByTeam[]
}
