export interface UserManagement {
}

export interface LoginDetails {
    id?:Number;
    userId?:String;
    loginId?: String;
    fullName?:String;
    mobileNo?: String;
    email: String;
    password: String;
    token?: String;
    tokenExp?: String;
    role: String;
    userRole?:String;
  }


  export class UserDetailsRequest {
    payload!: {
        id?: number;
        token?: string;
        loginId?: string;
        password?: string;
        fullName?: string;
        emailId?: string;
        firstName?: string;
        lastName?: string;
        roleType?: string;
        mobileNo?: string;
        alternateMobile?: string;
        superadminId?: string;
        requestedFor?: string;
        searchParam?: string;
        respCode?: string;
        respMesg?: string;
        createdBy?: string;
    };

    responseCode?: string;
}

export class UserDetails {
    id?: number;
    sessionId?: string;
    loginId?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    roleType?: string;
    mobileNo?: string;
    alternateMobile?: string;
    emailId?: string;
    superadminId?: string;
    offset?: number;
    limit?: number;
    responseCode?: string;
}
