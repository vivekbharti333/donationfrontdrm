export interface ProgramManagement {
}

export interface ProgramDetailsRequest {
    payload: {
      id?: number;
      programName?: string;
      programAmount?: Number;
      status?: string;
      createdBy?: string;
      superadminId?: string;

      requestedFor?: string;
      requestFor?: string;

      respCode?: number;
      respMesg?: string;
    } 
    responseCode?: string;
  }
  
  export interface ProgramDetails {
    id?: number;
      programName?: string;
      programAmount?: Number;
      status?: string;
      createdBy?: string;
      superadminId?: string;
  }
