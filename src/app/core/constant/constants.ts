export class Constant {

    // public static Site_Url = "http://localhost/mycrm/";
    // public static Site_Url = "http://192.168.29.119/mycrm/";
    public static Site_Url = "https://datfuslab.in/drmapinew/";

    // ['sale-dashboard','create-user','user-list','add-donation','all-donation-list','payment-mode-master','payment-mode','currency-master','currency','program','add-receipt-header','receipt-header-list','company-setting','create-lead','lead-list']


    // USER ROLE
    public static mainAdmin = 'MAINADMIN';
    public static superAdmin = 'SUPERADMIN';
    public static admin = 'ADMIN';
    public static teamLeader = 'TEAM_LEADER';
    public static fundraisingOfficer = 'FUNDRAISING_OFFICER';
    public static donorExecutive = 'DONOR_EXECUTIVE';

    //Requested For
    public static TODAY = 'TODAY';
    public static YESTERDAY = 'YESTERDAY';
    public static MONTH = 'BYDATE';
    public static CUSTOM = 'CUSTOM'

    //Service
    public static donation = 'DONATION';

    //Code
    public static SUCCESS_CODE = 200;
    public static NO_CONTENT_CODE = 204;
    public static BAD_REQUEST_CODE = 400;
    public static INVALID_TOKEN_CODE = 401;
    public static ALREADY_EXISTS = 403;
    public static INTERNAL_SERVER_ERR = 500;



    public static ACTIVITY = 'ACTIVITY';

    public static INFO = "INFO";
    public static ENQUIRY = "ENQUIRY";
    public static FOLLOWUP = "FOLLOWUP";
    public static IMPORTAINT = "IMPORTAINT";
    public static PENDING_PAYMENT = "PENDING_PAYMENT";
    public static WIN = "WIN";
    public static LOST = "LOST";
    public static ASSIGNED = "ASSIGNED";
    public static RESERVED = "RESERVED";

    


    public static LEAD_STATUS_LIST = [{value: 'FOLLOWUP', name: 'Follow Up'}, {value: 'WIN', name: 'Win'},{value: 'LOST', name: 'Not Interest'},{value: 'RINGING', name: 'Ringing'},{value: 'OTHER', name: 'Other'}];
    public static LEAD_ORIGINE_LIST = [{ value: 'CALL', name: 'Call'}, {value: 'WHATSAPP', name: 'Whats App'}, {value: 'EMAIL', name: 'Email'},{value: 'OTHER', name: 'Other'}];
    public static LEAD_TYPE_LIST = [{ value: 'NEW', name: 'New'}, {value: 'REPEAT', name: 'Repeat'}, {value: 'REFERRED', name: 'Referred'},{value: 'AGENT', name: 'Agent'}, {value: 'AGENT-REPEAT', name: 'Agent Repeat'}];


      serviceType: any = ['DONATION'];
      public static roleTypeForMainAdmin: any = [{value: Constant.superAdmin, name: 'Superadmin'}, {value: Constant.admin, name: 'Admin'}, {value:Constant.teamLeader, name: 'Team Leader'}, { value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}];
      public static roleTypeForSuperadmin: any = [{value: Constant.admin, name: 'Admin'}, {value:Constant.teamLeader, name: 'Team Leader'}, { value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}];
      public static roleTypeForAdmin: any = [{value: Constant.teamLeader, name: 'Team Leader'}, { value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}];
      public static roleTypeFoManager: any = [{value: Constant.fundraisingOfficer, name: 'Fundrising Officer'}];
    

}