import { CLPUser } from "./clpuser.model";
import { SimpleResponse } from "./genericResponse.model";

export interface Task extends SimpleResponse {
  taskID: number;
  cLPUserID: number;
  cLPCompanyID: number;
  ownerID: number;
  taskDesc: string;
  category: number;
  priority: number;
  dtDue: Date;
  hours: number;
  cost: number;
  isPrivate: boolean;
  reminderCLP: boolean;
  reminderEmail: boolean;
  reminderTime: Date;
  reminderSent: boolean
  status: number;
  campaignID: number;
  campaignEventID: number;
  runID: number;
  dtCreated: Date;
  userLastFirst: string;
  ownerName: string;
  contactName: string;
  PriorityDisplay: string;
  TaskDescHTML: string;
  DisplayName: string;
  DisplayToolTip: string;
  DisplayURL: string;
  CategoryDisplay: string;
  CategoryURL: string;
  UserName: string;
  UserNameSort: string;
  DueDateDisplay: string;
  StatusDisplay: string;
  StatusImg: string;
  TaskDocURL: string;
  TaskDocURLEdit: string;
  ReminderDisplay: string;
  isShowAttached: boolean;
}

export interface TaskListResponse {
  tasks: Task[];
  users: CLPUser[];
}

export interface TaskResponse {
  task: Task;
}

export interface TaskDocListResponse extends SimpleResponse {
  taskDocs: any;
  taskID: number;
}
