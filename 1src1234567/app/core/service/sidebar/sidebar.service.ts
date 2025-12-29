import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { routes } from '../../core.index';

// ['admin-dashboard','sale-dashboard','create-user','user-list','add-donation','all-donation-list','payment-mode-master','payment-mode','currency-master','currency','program','add-receipt-header','receipt-header-list','company-setting']

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private collapseSubject = new BehaviorSubject<boolean>(false);
  collapse$ = this.collapseSubject.asObservable();

  toggleCollapse() {
    this.collapseSubject.next(!this.collapseSubject.value);
  }

  public sideBarPosition: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('sideBarPosition') || 'false'
  );

  public toggleMobileSideBar: BehaviorSubject<string> =
    new BehaviorSubject<string>(
      localStorage.getItem('isMobileSidebar') || 'false'
    );

  public expandSideBar: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  public switchSideMenuPosition(): void {
    if (localStorage.getItem('sideBarPosition')) {
      this.sideBarPosition.next('false');
      this.expandSideBar.next(true);
      localStorage.removeItem('sideBarPosition');
    } else {
      this.sideBarPosition.next('true');
      this.expandSideBar.next(false);
      localStorage.setItem('sideBarPosition', 'true');
    }
  }

  public switchMobileSideBarPosition(): void {
    if (localStorage.getItem('isMobileSidebar')) {
      this.toggleMobileSideBar.next('false');
      localStorage.removeItem('isMobileSidebar');
    } else {
      this.toggleMobileSideBar.next('true');
      localStorage.setItem('isMobileSidebar', 'true');
    }
  }

  private getPermissions(): string[] {
    const permissions = localStorage.getItem('menuPermission');
    return permissions ? JSON.parse(permissions) : [];
  }

  public getFilteredSidebarData() {
    const permissions = this.getPermissions();
    return this.sidebarData1
      .map(section => ({
        ...section,
        menu: section.menu
          .map(menuItem => ({
            ...menuItem,
            subMenus: menuItem.subMenus.filter(subMenuItem =>
              permissions.includes(subMenuItem.permission)
            ),
          }))
          .filter(menuItem => menuItem.subMenus.length > 0),
      }))
      .filter(section => section.menu.length > 0); // Filter out titles with no accessible submenus
  }

  public sidebarData1 = [
    {
      tittle: 'Main',
      hasSubRoute: true,
      icon: 'assets/img/icons/menu-icon.svg',
      showSubRoute: false,
      menu: [
        {
          menuValue: 'Dashboard',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'grid',
          base1: 'dashboard',
          subMenus: [
            {
              menuValue: 'Dashboard',
              route: routes.salesDashboard,
              permission: 'dashboard',
            },
            {
              menuValue: 'Call Dashboard',
              route: routes.adminDashboard,
              permission: 'call-dashboard',
            },
          ],
        },
        {
          menuValue: 'User Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          subMenus: [
            {
              menuValue: 'Add user',
              route: routes.createUser,
              permission: 'create-user',
            },
            {
              menuValue: 'User List',
              route: routes.users,
              permission: 'user-list',
            },
            {
              menuValue: 'Roles & Permissions',
              route: routes.rolesPermission,
              permission: 'roles-permission',
            },
          ],
        },
        {
          menuValue: 'Donation Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'database',
          subMenus: [
            {
              menuValue: 'Add Receipt',
              route: routes.addDonation,
              permission: 'add-donation',
            }, 
            {
              menuValue: 'Receipt List',
              route: routes.allDonationList,
              permission: 'all-donation-list',
            },
          ],
        },
        {
          menuValue: 'Reports Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'database',
          subMenus: [
            {
              menuValue: 'Payment Report',
              route: routes.paymentReport,
              permission: 'payment-report',
            }, 
            
          ],
        },
        {
          menuValue: 'Payment Mode Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          // base1: 'usermang',
          subMenus: [
            {
              menuValue: 'Payment Mode Master',
              route: routes.paymentModeMaster,
              permission: 'payment-mode-master',
            }, 
            {
              menuValue: 'Payment Mode',
              route: routes.paymentMode,
              permission: 'payment-mode',
            },
          ],
        },
        {
          menuValue: 'Program Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          // base1: 'usermang',
          subMenus: [
            {
              menuValue: 'Program',
              route: routes.program,
              // permission: 'program',
              permission: 'add-donation',
            }, 
          ],
        },
        {
          menuValue: 'Currency Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'shield',
          // base1: 'usermang',
          subMenus: [
            {
              menuValue: 'Currency Master',
              route: routes.currencyMaster,
              permission: 'currency-master',
            }, 
            {
              menuValue: 'Currency',
              route: routes.currency,
              permission: 'currency',
            }, 
          ],
        },
        {
          menuValue: 'Receipt Header Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          // base1: 'usermang',
          subMenus: [
            {
              menuValue: 'Add Receipt Header',
              route: routes.addReceiptHeader,
              permission: 'add-receipt-header',
            }, 
            {
              menuValue: 'Receipt Header List',
              route: routes.receiptHeaderList,
              permission: 'receipt-header-list',
            }, 
            {
              menuValue: 'Receipt',
              route: routes.receipt,
              permission: 'receipt-header-list',
            }, 
          ],
        },
        {
          menuValue: 'Lead Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'bar-chart',
          // base1: 'leadmang',
          subMenus: [
            {
              menuValue: 'Create Lead',
              route: routes.createLead,
              permission: 'create-lead',
            },
            {
              menuValue: 'Follow up',
              route: routes.followupOne,
              permission: 'follow-up',
            },
            {
              menuValue: 'All Lead',
              route: routes.allLead,
              permission: 'lead-list',
            },
            {
              menuValue: 'Info',
              route: routes.infoLead,
              permission: 'info',
            },
            {
              menuValue: 'Enquiry',
              route: routes.enquiry,
              permission: 'enquiry',
            },
            {
              menuValue: 'Hot Lead',
              route: routes.hotLead,
              permission: 'hot-lead',
            },
            {
              menuValue: 'Follow Up',
              route: routes.folloupLead,
              permission: 'followup',
            },
            {
              menuValue: 'importaint Lead',
              route: routes.importaintLead,
              permission: 'importaint-lead',
            },
            {
              menuValue: 'Pending Paymnt',
              route: routes.pendingPayment,
              permission: 'pending-payment',
            },
            {
              menuValue: 'Won Lead',
              route: routes.wonLead,
              permission: 'won-lead',
            },
            {
              menuValue: 'Lost Lead',
              route: routes.lost,
              permission: 'lost-lead',
            },
            {
              menuValue: 'Assigned Lead',
              route: routes.assignedLead,
              permission: 'assigned-lead',
            },
            {
              menuValue: 'Reserved',
              route: routes.reserved,
              permission: 'reserved',
            },
            
            
          ],
        },
        {
          menuValue: 'Category Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'bar-chart',
          // base1: 'leadmang',
          subMenus: [
            {
              menuValue: 'Category Type',
              route: routes.categoryType,
              permission: 'category-type',
            },
            {
              menuValue: 'Super Category',
              route: routes.superCategory,
              permission: 'super-category',
            },
            {
              menuValue: 'Category',
              route: routes.category,
              permission: 'category',
            },
            {
              menuValue: 'Sub category',
              route: routes.subCategory,
              permission: 'sub-category',
            },
            
          ],
        },
      ],
    },
    {
      tittle: 'Setting',
      hasSubRoute: true,
      icon: 'assets/img/icons/menu-icon.svg',
      showSubRoute: false,
      menu: [
        {
          menuValue: 'Setting',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'grid',
          base1: 'dashboard',
          subMenus: [
            {
              menuValue: 'General Setting',
              route: routes.generalSettings,
              permission: 'general-setting',
            },
            {
              menuValue: 'Company Setting',
              route: routes.companySettings,
              permission: 'company-setting',
            },
            {
              menuValue: 'Email',
              route: routes.emailSettings,
              permission: 'email-setting',
            },
            {
              menuValue: 'Payment Gateway',
              route: routes.paymentGatewaySettings,
              permission: 'email-setting',
            },
            {
              menuValue: 'SMS Gateways',
              route: routes.smsGateway,
              permission: 'sms-setting',
            },
            {
              menuValue: 'OTP',
              route: routes.otpSettings,
              permission: 'otp-setting',
            },

          ],
        },
      ],
    },

    {
      tittle: 'Financial Settings',
      hasSubRoute: true,
      icon: 'assets/img/icons/menu-icon.svg',
      showSubRoute: false,
      menu: [
        {
         menuValue: 'Financial Settings',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'grid',
          base1: 'dashboard',
          subMenus: [
           {
              menuValue: 'Payment Gateway',
              route: routes.paymentGatewaySettings,
              permission: 'email-setting',
            },
            {
              menuValue: 'Bank Accounts',
              route: routes.bankSettingsGrid,
              permission: 'email-setting',
            },
            {
              menuValue: 'Tax Rates',
              route: routes.taxRates,
              permission: 'email-setting',
            },
            {
              menuValue: 'Currencies',
              route: routes.currencySettings,
              permission: 'email-setting',
            },
           
            

          ],
        },

    
      ],
    },



    // {
    //   tittle: 'System Settings',
    //   hasSubRoute: true,
    //   showSubRoute: false,
    //   activeRoute: 'users',
    //   subRoutes: [
    //     {
    //       tittle: 'Email',
    //       route: routes.emailSettings,
    //       hasSubRoute: false,
    //       showSubRoute: false,
    //     },
    //     {
    //       tittle: 'SMS Gateways',
    //       route: routes.smsGateway,
    //       hasSubRoute: false,
    //       showSubRoute: false,
    //     },
    //     {
    //       tittle: 'OTP',
    //       route: routes.otpSettings,
    //       hasSubRoute: false,
    //       showSubRoute: false,
    //     },
    //     {
    //       tittle: 'GDPR Cookies',
    //       route: routes.gdprSettings,
    //       hasSubRoute: false,
    //       showSubRoute: false,
    //     },
    //   ],
    // },

  ];


  public sidebarData2 = [
    {
      tittle: 'Main',
      hasSubRoute: true,
      icon: 'assets/img/icons/menu-icon.svg',
      showSubRoute: false,
      menu: [
        {
          menuValue: 'Dashboard',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'grid',
          base1: 'dashboard',
          subMenus: [
            {
              menuValue: 'Dashboard',
              route: routes.salesDashboard,
              permission: 'dashboard',
            },
            {
              menuValue: 'Call Dashboard',
              route: routes.adminDashboard,
              permission: 'call-dashboard',
            },
          ],
        },
        {
          menuValue: 'User Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          subMenus: [
            // {
            //   menuValue: 'Add user',
            //   route: routes.addusers,
            //   permission: 'create-user',
            // },
            {
              menuValue: 'Add user',
              route: routes.createUser,
              permission: 'create-user',
            },
            {
              menuValue: 'User List',
              route: routes.users,
              permission: 'user-list',
            },
            {
              menuValue: 'Roles & Permissions',
              route: routes.rolesPermission,
              permission: 'user-list',
            },
          ],
        },
        {
          menuValue: 'Donation Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          subMenus: [
            {
              menuValue: 'Add Receipt',
              route: routes.addDonation,
              permission: 'add-donation',
            }, 
            {
              menuValue: 'Receipt List',
              route: routes.allDonationList,
              permission: 'all-donation-list',
            },
          ],
        },
        {
          menuValue: 'Payment Mode Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          // base1: 'usermang',
          subMenus: [
            {
              menuValue: 'Payment Mode Master',
              route: routes.paymentModeMaster,
              permission: 'payment-mode-master',
            }, 
            {
              menuValue: 'Payment Mode',
              route: routes.paymentMode,
              permission: 'payment-mode',
            },
          ],
        },
        {
          menuValue: 'Program Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          // base1: 'usermang',
          subMenus: [
            {
              menuValue: 'Program',
              route: routes.program,
              permission: 'program',
            }, 
          ],
        },
        {
          menuValue: 'Currency Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          // base1: 'usermang',
          subMenus: [
            {
              menuValue: 'Currency Master',
              route: routes.currencyMaster,
              permission: 'currency-master',
            }, 
            {
              menuValue: 'Currency',
              route: routes.currency,
              permission: 'currency',
            }, 
          ],
        },
        {
          menuValue: 'Receipt Header Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          // base1: 'usermang',
          subMenus: [
            {
              menuValue: 'Add Receipt Header',
              route: routes.addReceiptHeader,
              permission: 'add-receipt-header',
            }, 
            {
              menuValue: 'Receipt Header List',
              route: routes.receiptHeaderList,
              permission: 'receipt-header-list',
            }, 
            {
              menuValue: 'Receipt',
              route: routes.receipt,
              permission: 'receipt-header-list',
            }, 
          ],
        },
        {
          menuValue: 'Lead Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'bar-chart',
          // base1: 'leadmang',
          subMenus: [
            {
              menuValue: 'Create Lead',
              route: routes.createLead,
              permission: 'create-lead',
            },
            {
              menuValue: 'Follow up',
              route: routes.followupOne,
              permission: 'follow-up',
            },
            {
              menuValue: 'All Lead',
              route: routes.allLead,
              permission: 'lead-list',
            },
            {
              menuValue: 'Info',
              route: routes.infoLead,
              permission: 'info',
            },
            {
              menuValue: 'Enquiry',
              route: routes.enquiry,
              permission: 'enquiry',
            },
            {
              menuValue: 'Hot Lead',
              route: routes.hotLead,
              permission: 'hot-lead',
            },
            {
              menuValue: 'Follow Up',
              route: routes.folloupLead,
              permission: 'followup',
            },
            {
              menuValue: 'importaint Lead',
              route: routes.importaintLead,
              permission: 'importaint-lead',
            },
            {
              menuValue: 'Pending Paymnt',
              route: routes.pendingPayment,
              permission: 'pending-payment',
            },
            {
              menuValue: 'Won Lead',
              route: routes.wonLead,
              permission: 'won-lead',
            },
            {
              menuValue: 'Lost Lead',
              route: routes.lost,
              permission: 'lost-lead',
            },
            {
              menuValue: 'Assigned Lead',
              route: routes.assignedLead,
              permission: 'assigned-lead',
            },
            {
              menuValue: 'Reserved',
              route: routes.reserved,
              permission: 'reserved',
            },
            
            
          ],
        },
        {
          menuValue: 'Category Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'bar-chart',
          // base1: 'leadmang',
          subMenus: [
            {
              menuValue: 'Category Type',
              route: routes.categoryType,
              permission: 'category-type',
            },
            {
              menuValue: 'Super Category',
              route: routes.superCategory,
              permission: 'super-category',
            },
            {
              menuValue: 'Category',
              route: routes.category,
              permission: 'category',
            },
            {
              menuValue: 'Sub category',
              route: routes.subCategory,
              permission: 'sub-category',
            },
            
          ],
        },
      ],
    },
    {
      tittle: 'Setting',
      hasSubRoute: true,
      icon: 'assets/img/icons/menu-icon.svg',
      showSubRoute: false,
      menu: [
        {
          menuValue: 'Setting',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'grid',
          base1: 'dashboard',
          subMenus: [
            {
              menuValue: 'General Setting',
              route: routes.generalSettings,
              permission: 'general-setting',
            },
            {
              menuValue: 'Company Setting',
              route: routes.companySettings,
              permission: 'company-setting',
            },
          ],
        },
      ],
    },

  ];


  public sidebarData3 = [
    {
      tittle: 'Main',
      hasSubRoute: true,
      icon: 'assets/img/icons/menu-icon.svg',
      showSubRoute: false,
      menu: [
        {
          menuValue: 'Dashboard',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'grid',
          base1: 'dashboard',
          subMenus: [
            {
              menuValue: 'Dashboard',
              route: routes.salesDashboard,
              permission: 'dashboard',
            },
            {
              menuValue: 'Call Dashboard',
              route: routes.adminDashboard,
              permission: 'call-dashboard',
            },
          ],
        },
        {
          menuValue: 'User Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          subMenus: [
            // {
            //   menuValue: 'Add user',
            //   route: routes.addusers,
            //   permission: 'create-user',
            // },
            {
              menuValue: 'Add user',
              route: routes.createUser,
              permission: 'create-user',
            },
            {
              menuValue: 'User List',
              route: routes.users,
              permission: 'user-list',
            },
            {
              menuValue: 'Roles & Permissions',
              route: routes.rolesPermission,
              permission: 'user-list',
            },
          ],
        },
        {
          menuValue: 'Donation Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          subMenus: [
            {
              menuValue: 'Add Receipt',
              route: routes.addDonation,
              permission: 'add-donation',
            }, 
            {
              menuValue: 'Receipt List',
              route: routes.allDonationList,
              permission: 'all-donation-list',
            },
          ],
        },
        {
          menuValue: 'Payment Mode Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          // base1: 'usermang',
          subMenus: [
            {
              menuValue: 'Payment Mode Master',
              route: routes.paymentModeMaster,
              permission: 'payment-mode-master',
            }, 
            {
              menuValue: 'Payment Mode',
              route: routes.paymentMode,
              permission: 'payment-mode',
            },
          ],
        },
        {
          menuValue: 'Program Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          // base1: 'usermang',
          subMenus: [
            {
              menuValue: 'Program',
              route: routes.program,
              permission: 'program',
            }, 
          ],
        },
        {
          menuValue: 'Currency Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          // base1: 'usermang',
          subMenus: [
            {
              menuValue: 'Currency Master',
              route: routes.currencyMaster,
              permission: 'currency-master',
            }, 
            {
              menuValue: 'Currency',
              route: routes.currency,
              permission: 'currency',
            }, 
          ],
        },
        {
          menuValue: 'Receipt Header Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'users',
          // base1: 'usermang',
          subMenus: [
            {
              menuValue: 'Add Receipt Header',
              route: routes.addReceiptHeader,
              permission: 'add-receipt-header',
            }, 
            {
              menuValue: 'Receipt Header List',
              route: routes.receiptHeaderList,
              permission: 'receipt-header-list',
            }, 
            {
              menuValue: 'Receipt',
              route: routes.receipt,
              permission: 'receipt-header-list',
            }, 
          ],
        },
        {
          menuValue: 'Lead Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'bar-chart',
          // base1: 'leadmang',
          subMenus: [
            {
              menuValue: 'Create Lead',
              route: routes.createLead,
              permission: 'create-lead',
            },
            {
              menuValue: 'Follow up',
              route: routes.followupOne,
              permission: 'follow-up',
            },
            {
              menuValue: 'All Lead',
              route: routes.allLead,
              permission: 'lead-list',
            },
            {
              menuValue: 'Info',
              route: routes.infoLead,
              permission: 'info',
            },
            {
              menuValue: 'Enquiry',
              route: routes.enquiry,
              permission: 'enquiry',
            },
            {
              menuValue: 'Hot Lead',
              route: routes.hotLead,
              permission: 'hot-lead',
            },
            {
              menuValue: 'Follow Up',
              route: routes.folloupLead,
              permission: 'followup',
            },
            {
              menuValue: 'importaint Lead',
              route: routes.importaintLead,
              permission: 'importaint-lead',
            },
            {
              menuValue: 'Pending Paymnt',
              route: routes.pendingPayment,
              permission: 'pending-payment',
            },
            {
              menuValue: 'Won Lead',
              route: routes.wonLead,
              permission: 'won-lead',
            },
            {
              menuValue: 'Lost Lead',
              route: routes.lost,
              permission: 'lost-lead',
            },
            {
              menuValue: 'Assigned Lead',
              route: routes.assignedLead,
              permission: 'assigned-lead',
            },
            {
              menuValue: 'Reserved',
              route: routes.reserved,
              permission: 'reserved',
            },
            
            
          ],
        },
        {
          menuValue: 'Category Management',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'bar-chart',
          // base1: 'leadmang',
          subMenus: [
            {
              menuValue: 'Category Type',
              route: routes.categoryType,
              permission: 'category-type',
            },
            {
              menuValue: 'Super Category',
              route: routes.superCategory,
              permission: 'super-category',
            },
            {
              menuValue: 'Category',
              route: routes.category,
              permission: 'category',
            },
            {
              menuValue: 'Sub category',
              route: routes.subCategory,
              permission: 'sub-category',
            },
            
          ],
        },
      ],
    },
    {
      tittle: 'Setting',
      hasSubRoute: true,
      icon: 'assets/img/icons/menu-icon.svg',
      showSubRoute: false,
      menu: [
        {
          menuValue: 'Setting',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'grid',
          base1: 'dashboard',
          subMenus: [
            {
              menuValue: 'General Setting',
              route: routes.generalSettings,
              permission: 'general-setting',
            },
            {
              menuValue: 'Company Setting',
              route: routes.companySettings,
              permission: 'company-setting',
            },
          ],
        },
      ],
    },

  ];


  public sidebarData21 = [
    {
      tittle: 'Main Menu',
      hasSubRoute: true,
      icon: 'assets/img/icons/menu-icon.svg',
      showSubRoute: false,
      subRoutes: [
        {
          tittle: 'Dashboard',
          hasSubRoute: true,
          icon: 'assets/img/icons/dashboard.svg',
          showSubRoute: true,
          route: routes.dashboard,
          subRoutes: [
            {
              tittle: 'Admin Dashboard',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.adminDashboard,
              subRoutes: [],
            },
            {
              tittle: 'Sales Dashboard',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.salesDashboard,
              subRoutes: [],
            },
          ],
        },
        {
          tittle: 'Application',
          hasSubRoute: true,
          showSubRoute: true,
          base: 'application',
          subRoutes: [
            {
              tittle: 'Chat',
              route: routes.chat,
              hasSubRoute: false,
              showSubRoute: false,
              customSubmenuTwo: false,
            },
            {
              tittle: 'Call',
              hasSubRoute: true,
              showSubRoute: true,
              base: 'application',
              subRoutes: [
                {
                  tittle: 'Video Call',
                  route: routes.videoCall,
                  hasSubRoute: false,
                  showSubRoute: false,
                  subRoutes: [],
                },
                {
                  tittle: 'Audio Call',
                  route: routes.audioCall,
                  hasSubRoute: false,
                  showSubRoute: false,
                },
                {
                  tittle: 'Call History',
                  route: routes.callHistory,
                  hasSubRoute: false,
                  showSubRoute: false,
                },
              ],
            },
            {
              tittle: 'Calendar',
              route: routes.calendar,
              hasSubRoute: false,
              showSubRoute: false,
              customSubmenuTwo: false,
            },
            {
              tittle: 'Email',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.email,
              customSubmenuTwo: false,
              subRoutes: [],
            },
            {
              tittle: 'To Do',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.toDo,
              customSubmenuTwo: false,
              subRoutes: [],
            },
            {
              tittle: 'Notes',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.notes,
              customSubmenuTwo: false,
              subRoutes: [],
            },
            {
              tittle: 'File Manager',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.fileManager,
              customSubmenuTwo: false,
              subRoutes: [],
            },
          ],
        },
      ],
    },
    {
      tittle: 'Inventory',
      hasSubRoute: true,
      icon: 'assets/img/icons/product.svg',
      showSubRoute: false,
      activeRoute: 'product',
      subRoutes: [
        {
          tittle: 'Products',
          hasSubRoute: false,
          showSubRoute: true,
          route: routes.productList,
          subRoutes: [],
        },
        {
          tittle: 'Create Product',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.addProduct,
          subRoutes: [],
        },
        {
          tittle: 'Expired Products',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.expiredProduct,
          subRoutes: [],
        },
        {
          tittle: 'Low Stocks',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.lowStock,
          subRoutes: [],
        },
        {
          tittle: 'Category',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.categoryList,
          subRoutes: [],
        },
        {
          tittle: 'Sub Category',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.subCategories,
          subRoutes: [],
        },
        {
          tittle: 'Brands',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.brandList,
          subRoutes: [],
        },
        {
          tittle: 'Units',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.units,
          subRoutes: [],
        },
        {
          tittle: 'Variant Attributes',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.varriantAttributes,
          subRoutes: [],
        },
        {
          tittle: 'Warranties',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.warranty,
          subRoutes: [],
        },
        {
          tittle: 'Print Barcode',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.barCode,
          subRoutes: [],
        },
        {
          tittle: 'Print QR Code',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.qrCode,
          subRoutes: [],
        },
      ],
    },
    {
      tittle: 'Sales',
      hasSubRoute: true,
      showSubRoute: false,
      activeRoute: 'users',
      subRoutes: [
        {
          tittle: 'Sales',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.salesList,
          subRoutes: [],
        },
        {
          tittle: 'Invoice',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.invoiceSettings,
          subRoutes: [],
        },
        {
          tittle: 'Sales Return',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.salesReturn,
          subRoutes: [],
        },
        {
          tittle: 'Quotation',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.quotationList,
          subRoutes: [],
        },
        {
          tittle: 'POS',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.pos,
          subRoutes: [],
        },
      ],
    },
    {
      tittle: 'Purchases',
      hasSubRoute: true,
      icon: 'assets/img/icons/purchase1.svg',
      showSubRoute: false,
      activeRoute: 'users',
      subRoutes: [
        {
          tittle: 'Purchases',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.purchaseList,
          subRoutes: [],
        },
        {
          tittle: 'Purchase Order',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.purchaseOrderReport,
          subRoutes: [],
        },
        {
          tittle: 'Purchase Return',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.purchaseReturns,
          subRoutes: [],
        },
        {
          tittle: 'ManageStock',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.manageStocks,
          subRoutes: [],
        },
        {
          tittle: 'Stock Adjustment',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.stockAdjustment,
          subRoutes: [],
        },
        {
          tittle: 'Sub Category',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.subCategories,
          subRoutes: [],
        },
        {
          tittle: 'Stock Transfer',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.stockTransfer,
          subRoutes: [],
        },
        {
          tittle: 'Expenses',
          hasSubRoute: true,
          showSubRoute: true,
          route: routes.stockTransfer,
          subRoutes: [
            {
              tittle: 'Expenses',
              route: routes.expenseList,
            },
            {
              tittle: 'Expense Category',
              route: routes.expenseCategory,
            },
          ],
        },
      ],
    },
    {
      tittle: 'Customers',
      hasSubRoute: true,
      icon: 'assets/img/icons/users1.svg',
      showSubRoute: false,
      activeRoute: 'users',
      subRoutes: [
        {
          tittle: 'Customers',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.customers,
          subRoutes: [],
        },
        {
          tittle: 'Suppliers',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.suppliers,
          subRoutes: [],
        },
        {
          tittle: 'Stores',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.storeList,
          subRoutes: [],
        },
        {
          tittle: 'Warehouses',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.wareHouse,
          subRoutes: [],
        },
      ],
    },
    {
      tittle: 'Employees',
      hasSubRoute: true,
      icon: 'assets/img/icons/product.svg',
      showSubRoute: false,
      activeRoute: 'users',
      subRoutes: [
        {
          tittle: 'Employees',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.employeesGrid,
          subRoutes: [],
        },
        {
          tittle: 'Departments',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.departmentGrid,
          subRoutes: [],
        },
        {
          tittle: 'Designation',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.designation,
          subRoutes: [],
        },
        {
          tittle: 'Shifts',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.shift,
          subRoutes: [],
        },
        {
          tittle: 'Attendence',
          hasSubRoute: true,
          showSubRoute: true,
          route: routes.shift,
          subRoutes: [
            {
              tittle: 'Employees',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.attendanceEmployee,
              subRoutes: [],
            },
            {
              tittle: 'Admin',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.attendanceAdmin,
              subRoutes: [],
            },
          ],
        },
        {
          tittle: 'Leaves',
          hasSubRoute: true,
          showSubRoute: true,
          route: routes.shift,
          subRoutes: [
            {
              tittle: 'Admin Leaves',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.leavesAdmin,
              subRoutes: [],
            },
            {
              tittle: 'Employee Leaves',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.leavesEmployee,
              subRoutes: [],
            },
            {
              tittle: 'Leave Types',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.leavesType,
              subRoutes: [],
            },
          ],
        },
        {
          tittle: 'Holidays',
          hasSubRoute: false,
          showSubRoute: true,
          route: routes.holidays,
          subRoutes: [],
        },
        {
          tittle: 'Payroll',
          hasSubRoute: true,
          showSubRoute: true,
          route: routes.holidays,
          subRoutes: [
            {
              tittle: 'Employee Salary',
              route: routes.payrollList,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Payslip',
              route: routes.paySlip,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
      ],
    },
    {
      tittle: 'Sales Report',
      hasSubRoute: true,
      icon: 'assets/img/icons/users1.svg',
      showSubRoute: false,
      activeRoute: 'users',
      subRoutes: [
        {
          tittle: 'Sales Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.salesReport,
          subRoutes: [],
        },
        {
          tittle: 'Purchase Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.purchaseReport,
          subRoutes: [],
        },
        {
          tittle: 'Inventory Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.inventoryReport,
          subRoutes: [],
        },
        {
          tittle: 'Invoice Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.invoiceReport,
          subRoutes: [],
        },
        {
          tittle: 'Supplier Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.supplierReport,
          subRoutes: [],
        },
        {
          tittle: 'Supplier Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.supplierReport,
          subRoutes: [],
        },
        {
          tittle: 'Customer Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.customerReport,
          subRoutes: [],
        },
        {
          tittle: 'Expense Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.expenseReport,
          subRoutes: [],
        },
        {
          tittle: 'Income Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.incomeReport,
          subRoutes: [],
        },
        {
          tittle: 'Tax Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.taxReport,
          subRoutes: [],
        },
      ],
    },
    {
      tittle: 'Pages',
      hasSubRoute: true,
      icon: 'assets/img/icons/purchase1.svg',
      showSubRoute: false,
      activeRoute: 'users',
      subRoutes: [
        {
          tittle: 'Profile',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.profile,
          subRoutes: [],
        },
        {
          tittle: 'Authentication',
          hasSubRoute: true,
          showSubRoute: false,
          route: routes.purchaseReport,
          subRoutes: [
            {
              tittle: 'Login',
              hasSubRoute: true,
              showSubRoute: false,
              subRoutes: [
                {
                  tittle: 'Cover',
                  route: routes.signIn,
                  hasSubRoute: false,
                  showSubRoute: false,
                },
                {
                  tittle: 'Illustration',
                  route: routes.signIn2,
                  hasSubRoute: false,
                  showSubRoute: false,
                },
                {
                  tittle: 'Basic',
                  route: routes.signIn3,
                  hasSubRoute: false,
                  showSubRoute: false,
                },
              ],
            },
          ],
        },
        {
          tittle: 'Error Pages',
          hasSubRoute: true,
          showSubRoute: false,
          route: routes.inventoryReport,
          subRoutes: [
            {
              tittle: '404 Error',
              route: routes.error404,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: '500 Error',
              route: routes.error500,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Places',
          hasSubRoute: true,
          showSubRoute: false,
          route: routes.invoiceReport,
          subRoutes: [
            {
              tittle: 'Countries',
              route: routes.countries,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'States',
              route: routes.states,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Blank Page',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.blankPage,
          subRoutes: [],
        },
        {
          tittle: 'Coming Soon',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.comingSoon,
          subRoutes: [],
        },
        {
          tittle: 'Under Maintenance',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.underMaintanance,
          subRoutes: [],
        },
      ],
    },
    {
      tittle: 'User Management',
      hasSubRoute: true,
      icon: 'assets/img/icons/printer.svg',
      showSubRoute: false,
      activeRoute: 'users',
      subRoutes: [
        {
          tittle: 'Users',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.users,
          subRoutes: [],
        },
        {
          tittle: 'Roles & Permissions',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.rolesPermission,
          subRoutes: [],
        },
        {
          tittle: 'Delete Account Request',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.deleteaccount,
          subRoutes: [],
        },
        {
          tittle: 'Base UI',
          hasSubRoute: true,
          icon: 'assets/img/icons/printer.svg',
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Alerts',
              route: routes.uiAlerts,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Accordion',
              route: routes.uiAccordion,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Avatar',
              route: routes.uiAvatar,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Badges',
              route: routes.uiBadges,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Border',
              route: routes.uiBorders,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Buttons',
              route: routes.uiButtons,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Button Group',
              route: routes.uiButtonsGroup,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Breadcrumb',
              route: routes.uiBreadcrumb,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Card',
              route: routes.uiCards,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Carousel',
              route: routes.uiCarousel,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Colors',
              route: routes.uiColors,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Dropdowns',
              route: routes.uiDropdowns,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Grid',
              route: routes.uiGrid,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Images',
              route: routes.uiImages,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Lightbox',
              route: routes.uiLightbox,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Media',
              route: routes.uiMedia,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Modals',
              route: routes.uiModals,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Offcanvas',
              route: routes.uiOffcanvas,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Pagination',
              route: routes.uiPagination,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Popovers',
              route: routes.uiPopovers,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Progress',
              route: routes.uiProgress,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Placeholders',
              route: routes.uiPlaceholders,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Range Slider',
              route: routes.uiRangeSlider,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Spinner',
              route: routes.uiSpinner,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Sweet Alerts',
              route: routes.uiSweetAlerts,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Tabs',
              route: routes.uiNavTabs,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Toasts',
              route: routes.uiToasts,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Tooltips',
              route: routes.uiTooltips,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Typography',
              route: routes.uiTypography,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Video',
              route: routes.uiVideo,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Advanced UI',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Ribbon',
              route: routes.ribbon,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Clipboard',
              route: routes.clipboard,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Drag & Drop',
              route: routes.dragDrop,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Rating',
              route: routes.rating,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Text Editor',
              route: routes.textEditor,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Counter',
              route: routes.counter,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Scrollbar',
              route: routes.scrollbar,
              hasSubRoute: false,
              showSubRoute: false,
            },

            {
              tittle: 'Timeline',
              route: routes.timeline,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Charts',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Apex Charts',
              route: routes.chartApex,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Ng2 Charts',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.chartNg2,
              subRoutes: [],
            },
            {
              tittle: 'Prime NG Charts',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.chartPrime,
              subRoutes: [],
            },
          ],
        },
        {
          tittle: 'Icons',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Fontawesome Icons',
              route: routes.iconFontAwesome,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Feather Icons',
              route: routes.iconFeather,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Ionic Icons',
              route: routes.iconIonic,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Material Icons',
              route: routes.iconMaterial,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Pe7 Icons',
              route: routes.iconPe7,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Simpleline Icons',
              route: routes.iconSimpleline,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Themify Icons',
              route: routes.iconThemify,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Weather Icons',
              route: routes.iconWeather,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Typicon Icons',
              route: routes.iconTypicon,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Flag Icons',
              route: routes.iconFlag,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
      ],
    },
    {
      tittle: 'Settings',
      hasSubRoute: true,
      icon: 'assets/img/icons/product.svg',
      showSubRoute: false,
      activeRoute: 'users',
      subRoutes: [
        {
          tittle: 'General Settings',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.users,
          subRoutes: [
            {
              tittle: 'Profile',
              route: routes.generalSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Security',
              route: routes.securitySettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Notifications',
              route: routes.settingsNotification,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Connected Apps',
              route: routes.connectedApps,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Website Settings',
          hasSubRoute: false,
          showSubRoute: false,
          subRoutes: [
            {
              tittle: 'System Settings',
              route: routes.systemSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Company Settings',
              route: routes.companySettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Localization',
              route: routes.localizationSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Prefixes',
              route: routes.prefixes,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Preference',
              route: routes.preference,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Appearance',
              route: routes.appearance,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Social Authentication',
              route: routes.socialAuthentication,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Language',
              route: routes.languageSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },

        {
          tittle: 'App Settings',
          hasSubRoute: true,
          icon: 'assets/img/icons/printer.svg',
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Invoice',
              route: routes.invoiceSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Printer',
              route: routes.printerSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'POS',
              route: routes.posSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Custom Fields',
              route: routes.customFields,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'System Settings',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Email',
              route: routes.emailSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'SMS Gateways',
              route: routes.smsGateway,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'OTP',
              route: routes.otpSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'GDPR Cookies',
              route: routes.gdprSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Financial Settings',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Payment Gateway',
              route: routes.paymentGatewaySettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Bank Accounts',
              route: routes.bankSettingsGrid,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Tax Rates',
              route: routes.taxRates,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Currencies',
              route: routes.currencySettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Other Settings',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Storage',
              route: routes.storageSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Ban IP Address',
              route: routes.banIpAddress,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Documentation',
          hasSubRoute: false,
          showSubRoute: false,
          activeRoute: 'users',
        },
        {
          tittle: 'Changelog v2.0.3',
          hasSubRoute: false,
          showSubRoute: false,
          activeRoute: 'users',
        },
      ],
    },
  ];

  public sidebarData31 = [
    {
      tittle: 'Main Menu',
      hasSubRoute: true,
      icon: 'assets/img/icons/menu-icon.svg',
      showSubRoute: false,
      subRoutes: [
        {
          tittle: 'Dashboard',
          hasSubRoute: true,
          icon: 'assets/img/icons/dashboard.svg',
          showSubRoute: true,
          route: routes.dashboard,
          subRoutes: [
            {
              tittle: 'Admin Dashboard',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.adminDashboard,
              subRoutes: [],
            },
            {
              tittle: 'Sales Dashboard',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.salesDashboard,
              subRoutes: [],
            },
          ],
        },
        {
          tittle: 'Application',
          hasSubRoute: true,
          showSubRoute: true,
          base: 'application',
          subRoutes: [
            {
              tittle: 'Chat',
              route: routes.chat,
              hasSubRoute: false,
              showSubRoute: false,
              customSubmenuTwo: false,
            },
            {
              tittle: 'Call',
              hasSubRoute: true,
              showSubRoute: true,
              base: 'application',
              subRoutes: [
                {
                  tittle: 'Video Call',
                  route: routes.videoCall,
                  hasSubRoute: false,
                  showSubRoute: false,
                  subRoutes: [],
                },
                {
                  tittle: 'Audio Call',
                  route: routes.audioCall,
                  hasSubRoute: false,
                  showSubRoute: false,
                },
                {
                  tittle: 'Call History',
                  route: routes.callHistory,
                  hasSubRoute: false,
                  showSubRoute: false,
                },
              ],
            },
            {
              tittle: 'Calendar',
              route: routes.calendar,
              hasSubRoute: false,
              showSubRoute: false,
              customSubmenuTwo: false,
            },
            {
              tittle: 'Email',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.email,
              customSubmenuTwo: false,
              subRoutes: [],
            },
            {
              tittle: 'To Do',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.toDo,
              customSubmenuTwo: false,
              subRoutes: [],
            },
            {
              tittle: 'Notes',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.notes,
              customSubmenuTwo: false,
              subRoutes: [],
            },
            {
              tittle: 'File Manager',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.fileManager,
              customSubmenuTwo: false,
              subRoutes: [],
            },
          ],
        },
      ],
    },
    {
      tittle: 'Inventory',
      hasSubRoute: true,
      icon: 'assets/img/icons/product.svg',
      showSubRoute: false,
      activeRoute: 'product',
      subRoutes: [
        {
          tittle: 'Products',
          hasSubRoute: false,
          showSubRoute: true,
          route: routes.productList,
          subRoutes: [],
        },
        {
          tittle: 'Create Product',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.addProduct,
          subRoutes: [],
        },
        {
          tittle: 'Expired Products',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.expiredProduct,
          subRoutes: [],
        },
        {
          tittle: 'Low Stocks',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.lowStock,
          subRoutes: [],
        },
        {
          tittle: 'Category',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.categoryList,
          subRoutes: [],
        },
        {
          tittle: 'Sub Category',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.subCategories,
          subRoutes: [],
        },
        {
          tittle: 'Brands',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.brandList,
          subRoutes: [],
        },
        {
          tittle: 'Units',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.units,
          subRoutes: [],
        },
        {
          tittle: 'Variant Attributes',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.varriantAttributes,
          subRoutes: [],
        },
        {
          tittle: 'Warranties',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.warranty,
          subRoutes: [],
        },
        {
          tittle: 'Print Barcode',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.barCode,
          subRoutes: [],
        },
        {
          tittle: 'Print QR Code',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.qrCode,
          subRoutes: [],
        },
      ],
    },
    {
      tittle: 'Sales & Purchase',
      hasSubRoute: true,
      icon: 'assets/img/icons/purchase1.svg',
      showSubRoute: false,
      activeRoute: 'users',
      subRoutes: [
        {
          tittle: 'Sales',
          hasSubRoute: true,
          showSubRoute: false,
          route: routes.salesList,
          subRoutes: [
            {
              tittle: 'Sales',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.salesList,
              subRoutes: [],
            },
            {
              tittle: 'Invoice',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.invoiceSettings,
              subRoutes: [],
            },
            {
              tittle: 'Sales Return',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.salesReturn,
              subRoutes: [],
            },
            {
              tittle: 'Quotation',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.quotationList,
              subRoutes: [],
            },
            {
              tittle: 'POS',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.pos,
              subRoutes: [],
            },
          ],
        },
        {
          tittle: 'Purchases',
          hasSubRoute: true,
          icon: 'assets/img/icons/purchase1.svg',
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Purchases',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.purchaseList,
              subRoutes: [],
            },
            {
              tittle: 'Purchase Order',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.purchaseOrderReport,
              subRoutes: [],
            },
            {
              tittle: 'Purchase Return',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.purchaseReturns,
              subRoutes: [],
            },
            {
              tittle: 'ManageStock',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.manageStocks,
              subRoutes: [],
            },
            {
              tittle: 'Stock Adjustment',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.stockAdjustment,
              subRoutes: [],
            },
            {
              tittle: 'Sub Category',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.subCategories,
              subRoutes: [],
            },
            {
              tittle: 'Stock Transfer',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.stockTransfer,
              subRoutes: [],
            },
          ],
        },
        {
          tittle: 'Expenses',
          hasSubRoute: true,
          showSubRoute: true,
          route: routes.stockTransfer,
          subRoutes: [
            {
              tittle: 'Expenses',
              route: routes.expenseList,
            },
            {
              tittle: 'Expense Category',
              route: routes.expenseCategory,
            },
          ],
        },
      ],
    },
    {
      tittle: 'User Management',
      hasSubRoute: true,
      icon: 'assets/img/icons/users1.svg',
      showSubRoute: false,
      activeRoute: 'users',
      subRoutes: [
        {
          tittle: 'Roles & Permissions',
          hasSubRoute: true,
          showSubRoute: false,
          route: routes.users,
          subRoutes: [
            {
              tittle: 'Roles & Permissions',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.rolesPermission,
              subRoutes: [],
            },
            {
              tittle: 'Delete Account Request',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.deleteaccount,
              subRoutes: [],
            },
          ],
        },
        {
          tittle: 'Base UI',
          hasSubRoute: true,
          icon: 'assets/img/icons/printer.svg',
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Alerts',
              route: routes.uiAlerts,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Accordion',
              route: routes.uiAccordion,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Avatar',
              route: routes.uiAvatar,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Badges',
              route: routes.uiBadges,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Border',
              route: routes.uiBorders,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Buttons',
              route: routes.uiButtons,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Button Group',
              route: routes.uiButtonsGroup,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Breadcrumb',
              route: routes.uiBreadcrumb,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Card',
              route: routes.uiCards,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Carousel',
              route: routes.uiCarousel,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Colors',
              route: routes.uiColors,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Dropdowns',
              route: routes.uiDropdowns,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Grid',
              route: routes.uiGrid,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Images',
              route: routes.uiImages,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Lightbox',
              route: routes.uiLightbox,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Media',
              route: routes.uiMedia,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Modals',
              route: routes.uiModals,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Offcanvas',
              route: routes.uiOffcanvas,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Pagination',
              route: routes.uiPagination,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Popovers',
              route: routes.uiPopovers,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Progress',
              route: routes.uiProgress,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Placeholders',
              route: routes.uiPlaceholders,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Range Slider',
              route: routes.uiRangeSlider,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Spinner',
              route: routes.uiSpinner,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Sweet Alerts',
              route: routes.uiSweetAlerts,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Tabs',
              route: routes.uiNavTabs,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Toasts',
              route: routes.uiToasts,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Tooltips',
              route: routes.uiTooltips,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Typography',
              route: routes.uiTypography,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Video',
              route: routes.uiVideo,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Advanced UI',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Ribbon',
              route: routes.ribbon,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Clipboard',
              route: routes.clipboard,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Drag & Drop',
              route: routes.dragDrop,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Rating',
              route: routes.rating,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Text Editor',
              route: routes.textEditor,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Counter',
              route: routes.counter,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Scrollbar',
              route: routes.scrollbar,
              hasSubRoute: false,
              showSubRoute: false,
            },

            {
              tittle: 'Timeline',
              route: routes.timeline,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Charts',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Apex Charts',
              route: routes.chartApex,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Ng2 Charts',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.chartNg2,
              subRoutes: [],
            },
            {
              tittle: 'Prime NG Charts',
              hasSubRoute: false,
              showSubRoute: false,
              route: routes.chartPrime,
              subRoutes: [],
            },
          ],
        },
        {
          tittle: 'Primary-icons',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Fontawesome Icons',
              route: routes.iconFontAwesome,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Feather Icons',
              route: routes.iconFeather,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Ionic Icons',
              route: routes.iconIonic,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Material Icons',
              route: routes.iconMaterial,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Pe7 Icons',
              route: routes.iconPe7,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Secondary-icons',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Simpleline Icons',
              route: routes.iconSimpleline,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Themify Icons',
              route: routes.iconThemify,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Weather Icons',
              route: routes.iconWeather,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Typicon Icons',
              route: routes.iconTypicon,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Flag Icons',
              route: routes.iconFlag,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Forms',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Basic Inputs',
              route: routes.formBasicInputs,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Checkbox & Radios',
              route: routes.formCheckboxRadios,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Input Groups',
              route: routes.formInputsGroups,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Form Select',
              route: routes.formSelect,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Input Masks',
              route: routes.formMask,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'File Uploads',
              route: routes.formFileUpload,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
      ],
    },
    {
      tittle: 'Profile',
      hasSubRoute: true,
      icon: 'assets/img/icons/users1.svg',
      showSubRoute: false,
      subRoutes: [
        {
          tittle: 'Profile',
          route: routes.generalSettings,
          hasSubRoute: false,
          showSubRoute: false,
        },
        {
          tittle: 'Authentication',
          hasSubRoute: true,
          showSubRoute: false,
          route: routes.purchaseReport,
          subRoutes: [
            {
              tittle: 'Login',
              hasSubRoute: true,
              showSubRoute: false,
              subRoutes: [
                {
                  tittle: 'Cover',
                  route: routes.signIn,
                  hasSubRoute: false,
                  showSubRoute: false,
                },
                {
                  tittle: 'Illustration',
                  route: routes.signIn2,
                  hasSubRoute: false,
                  showSubRoute: false,
                },
                {
                  tittle: 'Basic',
                  route: routes.signIn3,
                  hasSubRoute: false,
                  showSubRoute: false,
                },
              ],
            },
          ],
        },
        {
          tittle: 'Pages',
          hasSubRoute: true,
          showSubRoute: false,
          route: routes.purchaseReport,
          subRoutes: [
            {
              tittle: '404 Error',
              hasSubRoute: true,
              showSubRoute: false,
              subRoutes: [],
            },
            {
              tittle: '500 Error',
              hasSubRoute: true,
              showSubRoute: false,
              subRoutes: [],
            },
            {
              tittle: 'Blank page',
              hasSubRoute: true,
              showSubRoute: false,
              subRoutes: [],
            },
            {
              tittle: 'Comming Soon',
              hasSubRoute: true,
              showSubRoute: false,
              subRoutes: [],
            },
          ],
        },
      ],
    },
    {
      tittle: 'Reports',
      hasSubRoute: true,
      icon: 'assets/img/icons/printer.svg',
      showSubRoute: false,
      activeRoute: 'users',
      subRoutes: [
        {
          tittle: 'Sales Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.salesReport,
          subRoutes: [],
        },
        {
          tittle: 'Purchase Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.purchaseReport,
          subRoutes: [],
        },
        {
          tittle: 'Inventory Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.inventoryReport,
          subRoutes: [],
        },
        {
          tittle: 'Invoice Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.invoiceReport,
          subRoutes: [],
        },
        {
          tittle: 'Supplier Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.supplierReport,
          subRoutes: [],
        },
        {
          tittle: 'Supplier Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.supplierReport,
          subRoutes: [],
        },
        {
          tittle: 'Customer Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.customerReport,
          subRoutes: [],
        },
        {
          tittle: 'Expense Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.expenseReport,
          subRoutes: [],
        },
        {
          tittle: 'Income Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.incomeReport,
          subRoutes: [],
        },
        {
          tittle: 'Tax Report',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.taxReport,
          subRoutes: [],
        },
      ],
    },
    {
      tittle: 'Settings',
      hasSubRoute: true,
      icon: 'assets/img/icons/purchase1.svg',
      showSubRoute: false,
      activeRoute: 'users',
      subRoutes: [
        {
          tittle: 'General Settings',
          hasSubRoute: true,
          showSubRoute: false,
          route: routes.users,
          subRoutes: [
            {
              tittle: 'Profile',
              route: routes.generalSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Security',
              route: routes.securitySettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Notifications',
              route: routes.settingsNotification,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Connected Apps',
              route: routes.connectedApps,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Website Settings',
          hasSubRoute: true,
          showSubRoute: false,
          subRoutes: [
            {
              tittle: 'System Settings',
              route: routes.systemSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Company Settings',
              route: routes.companySettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Localization',
              route: routes.localizationSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Prefixes',
              route: routes.prefixes,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Preference',
              route: routes.preference,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Appearance',
              route: routes.appearance,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Social Authentication',
              route: routes.socialAuthentication,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Language',
              route: routes.languageSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },

        {
          tittle: 'App Settings',
          hasSubRoute: true,
          icon: 'assets/img/icons/printer.svg',
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Invoice',
              route: routes.invoiceSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Printer',
              route: routes.printerSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'POS',
              route: routes.posSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Custom Fields',
              route: routes.customFields,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'System Settings',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Email',
              route: routes.emailSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'SMS Gateways',
              route: routes.smsGateway,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'OTP',
              route: routes.otpSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'GDPR Cookies',
              route: routes.gdprSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Financial Settings',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Payment Gateway',
              route: routes.paymentGatewaySettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Bank Accounts',
              route: routes.bankSettingsGrid,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Tax Rates',
              route: routes.taxRates,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Currencies',
              route: routes.currencySettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Other Settings',
          hasSubRoute: true,
          showSubRoute: false,
          activeRoute: 'users',
          subRoutes: [
            {
              tittle: 'Storage',
              route: routes.storageSettings,
              hasSubRoute: false,
              showSubRoute: false,
            },
            {
              tittle: 'Ban IP Address',
              route: routes.banIpAddress,
              hasSubRoute: false,
              showSubRoute: false,
            },
          ],
        },
        {
          tittle: 'Documentation',
          hasSubRoute: false,
          showSubRoute: false,
          activeRoute: 'users',
        },
        {
          tittle: 'Changelog v2.0.3',
          hasSubRoute: false,
          showSubRoute: false,
          activeRoute: 'users',
        },
      ],
    },
  ];
  
  public settings_sidebar = [
    {
      icon: 'feather icon-settings',
      title: 'General Settings',
      page: 'general-settings',
      subMenu: [
        { title: 'Profile', routes: routes.generalSettings },
        { title: 'Security', routes: routes.securitySettings },
        { title: 'Notifications', routes: routes.settingsNotification },
        { title: 'Connected Apps', routes: routes.connectedApps },
      ],
    },
    {
      icon: 'feather icon-airplay',
      title: 'Website Settings',
      page: 'website-settings',
      subMenu: [
        { title: 'System Settings', routes: routes.systemSettings },
        { title: 'Company Settings', routes: routes.companySettings },
        { title: 'Localization', routes: routes.localizationSettings },
        { title: 'Prefixes', routes: routes.prefixes },
        { title: 'Preference', routes: routes.preference },
        { title: 'Appearance', routes: routes.appearance },
        {
          title: 'Social Authentication',
          routes: routes.socialAuthentication,
        },
        { title: 'Language', routes: routes.languageSettings },
      ],
    },
    {
      icon: 'feather icon-archive',
      title: 'App Settings',
      page: 'app-settings',
      subMenu: [
        { title: 'Invoice', routes: routes.invoiceSettings },
        { title: 'Printer', routes: routes.printerSettings },
        { title: 'POS', routes: routes.posSettings },
        { title: 'Custom Fields', routes: routes.customFields },
      ],
    },
    {
      icon: 'feather icon-server',
      title: 'System Settings',
      page: 'system-settings',
      subMenu: [
        { title: 'Email', routes: routes.emailSettings },
        { title: 'SMS Gateways', routes: routes.smsGateway },
        { title: 'OTP', routes: routes.otpSettings },
        { title: 'GDPR Cookies', routes: routes.gdprSettings },
      ],
    },
    {
      icon: 'feather icon-credit-card',
      title: 'Financial Settings',
      page: 'financial-settings',
      subMenu: [
        { title: 'Payment Gateway', routes: routes.paymentGatewaySettings },
        { title: 'Bank Accounts', routes: routes.bankSettingsGrid },
        { title: 'Tax Rates', routes: routes.taxRates },
        { title: 'Currencies', routes: routes.currencySettings },
      ],
    },
    {
      icon: 'feather icon-layout',
      title: 'Other Settings',
      page: 'other-settings',
      subMenu: [
        { title: 'Storage', routes: routes.storageSettings },
        { title: 'Ban IP Address', routes: routes.banIpAddress },
      ],
    },
  ];
  public videocall = [
    {
      img: 'assets/img/users/user-01.jpg',
      name: 'Barbara',
    },
    {
      img: 'assets/img/users/user-02.jpg',
      name: 'Linnea',
    },
    {
      img: 'assets/img/users/user-05.jpg',
      name: 'Richard',
    },
    {
      img: 'assets/img/users/user-03.jpg',
      name: 'Freda',
    },
  ];
}
