import { Component, OnInit , importProvidersFrom } from '@angular/core';
import { NavigationStart, Router, Event as RouterEvent } from '@angular/router';
import { CommonService, SidebarService } from 'src/app/core/core.index';
import { WebstorgeService } from 'src/app/shared/webstorge.service';
import { routes } from 'src/app/core/helpers/routes';
import { CommonComponentService } from '../common-component.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';
import { UserManagementService } from 'src/app/core-component/user-management/user-management.service';



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  {
  public routes = routes;
  activePath = '';
  showSearch = false;
  public changeLayout = '1';
  public darkTheme = false;
  public logoPath = '';
  public miniSidebar = false;
  elem = document.documentElement;
  public addClass = false;
  base = '';
  page = '';
  last = '';

  public loginUser: any;
  public headerDetails: any;
  public displayLogo: any;
  public displayLogoSmall: any;

  public userName: string = '';
  public userRole: string = '';
  public userPicture: any = '';

  constructor(
    private router: Router,
    private common: CommonService,
    private sidebar: SidebarService,
    private webStorage: WebstorgeService,
    private commonComponentService: CommonComponentService,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
    private userManagementService: UserManagementService,
  ) {

    this.activePath = this.router.url.split('/')[2];
    this.router.events.subscribe((data: RouterEvent) => {
      if (data instanceof NavigationStart) {
        this.activePath = data.url.split('/')[2];
      }
    });
    this.sidebar.sideBarPosition.subscribe((res: string) => {
      if (res == 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });
    this.common.base.subscribe((base: string) => {
      this.base = base;
    });
    this.common.page.subscribe((page: string) => {
      this.page = page;
    });
    this.common.last.subscribe((last: string) => {
      this.last = last;
    });

    this.loginUser = this.authenticationService.getLoginUser();
    // this.loginUser = JSON.parse(this.cookieService.get('loginDetails'));

    // this.getApplicaionHeaderDetails();
  }

  ngOnInit(){
    this.getApplicaionHeaderDetails();
    this.loadCurrentUserPicture();
  }


  public logout(): void {
    this.webStorage.Logout();
  }

  public toggleSidebar(): void {
    this.sidebar.switchSideMenuPosition();
  }

  public togglesMobileSideBar(): void {
    this.sidebar.switchMobileSideBarPosition();
  }

  public miniSideBarMouseHover(position: string): void {
    if (position == 'over') {
      this.sidebar.expandSideBar.next(true);
    } else {
      this.sidebar.expandSideBar.next(false);
    }
  }

  fullscreen() {
    if (!document.fullscreenElement) {
      this.elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  public getApplicaionHeaderDetails() {

    let firstName = this.cookieService.get('firstName');
    let lastName =  this.cookieService.get('lastName');
    this.userName = firstName+" "+lastName
    this.userRole =  this.cookieService.get('roleType');

    // this.displayLogo = this.cookieService.get('displayLogo');


     this.displayLogo =localStorage.getItem('displayLogo');
     this.displayLogo = 'data:image/png;base64,'+this.displayLogo;


    this.userPicture = this.resolveUserPicture(
      this.loginUser?.userPicture || localStorage.getItem('userPicture') || ''
    );
  }

  private loadCurrentUserPicture(): void {
    this.userManagementService.getUserDetailsByLoginId().subscribe({
      next: (response: any) => {
        if (Number(response?.responseCode) !== Constant.SUCCESS_CODE || !response?.payload) {
          return;
        }

        const user = response.payload;
        this.userPicture = this.resolveUserPicture(user.userPicture);
        this.userName = [user.firstName, user.lastName]
          .filter((value: any) => String(value || '').trim())
          .join(' ') || this.userName;
        this.userRole = user.roleType || this.userRole;

        if (user.userPicture) {
          localStorage.setItem('userPicture', user.userPicture);
        } else {
          localStorage.removeItem('userPicture');
        }
      },
      error: () => {
        this.userPicture = this.resolveUserPicture(
          this.loginUser?.userPicture || localStorage.getItem('userPicture') || ''
        );
      }
    });
  }

  private resolveUserPicture(value: any): string {
    const picture = String(value || '').trim();
    if (!picture || picture === 'undefined' || picture === 'null') {
      return 'assets/img/profiles/avatar-02.jpg';
    }
    if (/^(data:image\/|blob:|https?:)/i.test(picture)) {
      return picture;
    }
    if (picture.length > 100 && /^[A-Za-z0-9+/=\r\n]+$/.test(picture)) {
      return 'data:image/png;base64,' + picture;
    }
    const superadminId = String(
      this.loginUser?.superadminId
        || this.cookieService.get('superadminId')
        || this.loginUser?.loginId
        || this.cookieService.get('loginId')
        || ''
    ).trim();
    if (!superadminId) {
      return 'assets/img/profiles/avatar-02.jpg';
    }
    return Constant.Site_Url + 'userImage/'
      + encodeURIComponent(superadminId) + '/'
      + encodeURIComponent(picture);
  }

  public useDefaultUserImage(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = 'assets/img/profiles/avatar-02.jpg';
  }


  logOut(){
    this.authenticationService.logOut();
    // window.location.href = "";
    // window.location.reload();
  }
}
