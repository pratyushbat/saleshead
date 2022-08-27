
export interface GoalSetup {
  goalType: number;
  display: string;
  active: boolean;
  goal: number;
  goalId: number;
  showInSummary: boolean;
}
export interface GoalSetupRespnose {
  goalResponse: GoalSetup[];
  goalAPTResponse: DataList[];
}

export interface GoalData {
  goalId: number;
  clpCompanyId: number;
  clpUserId: number;
  goalType: number;
  ownerId: number;
  goal: number;
  showInSummary: boolean;
  sOrder: string;

}
export interface DataList {
  typeCode: number;
  goalId: number;
  clpCompanyId: number;
  active: boolean;
  goal: number;
  showInSummary: boolean;
  display: string;
  colorCode: string;
  sOrder: string;
}
export interface GoalsGeneric {
  sectionName: string;
  goals: DataList[] | GoalSetup[];
}

export interface GoalDisplay {
  display: string;
  goalShow: string;
  actualShow: number;
  pctCompleted: number;
}

