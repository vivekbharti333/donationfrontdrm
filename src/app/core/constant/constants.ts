export class Constant {

    // public static Site_Url = "http://datfuslab3.techmates.org:6080/rentalcrm/";
    public static Site_Url = "http://localhost/mycrm/";
    // public static Site_Url = "http://192.168.29.119:8080/rentalcrm/";


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
    public static WON = "WON";
    public static LOST = "LOST";
    public static ASSIGNED = "ASSIGNED";
    public static RESERVED = "RESERVED";

    


    public static LEAD_STATUS_LIST = [{ value: 'ENQUIRY', name: 'Enquiry'}, {value: 'FOLLOWUP', name: 'Follow Up'}, {value: 'RESERVED', name: 'Reserved'},{value: 'LOST', name: 'Lost'},{value: 'OTHER', name: 'Other'}];
    public static LEAD_ORIGINE_LIST = [{ value: 'CALL', name: 'Call'}, {value: 'WHATSAPP', name: 'Whats App'}, {value: 'EMAIL', name: 'Email'},{value: 'OTHER', name: 'Other'}];
    public static LEAD_TYPE_LIST = [{ value: 'NEW', name: 'New'}, {value: 'REPEAT', name: 'Repeat'}, {value: 'REFERRED', name: 'Referred'},{value: 'AGENT', name: 'Agent'}, {value: 'AGENT-REPEAT', name: 'Agent Repeat'}];


    

}